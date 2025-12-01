import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertMovieSchema, insertSeriesSchema, insertEpisodeSchema, insertChannelSchema, insertAppUserSchema, insertSubscriptionPlanSchema, insertChannelContentSchema, insertApiKeySchema, insertFileSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { authMiddleware, adminMiddleware, generateToken, generateStreamingUrl } from "./auth";
import bcrypt from "bcryptjs";
import { openApiSpec } from "./openapi";
import { log } from "./index";
import { getCached, setCached, invalidateCache, cacheKeys } from "./cache";
import { filterBySubscription, checkContentAccess } from "./subscriptions";
import { getS3Client, getStorageConfig, generatePresignedUrl, generateCDNUrl, healthCheck } from "./cloud-storage";
import { buildStreamingUrl, generateHLSPlaylist, generateDASHManifest } from "./streaming";
import { startTranscodingJob } from "./transcoding";
import { generateSignedUrl, generateSignedHLSUrl, generateSignedDASHUrl, isSignedUrlValid } from "./cloudfront-signing";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // Import and register sub-routes
  const { registerAccountRoutes } = await import("./account-routes");
  const { registerStreamingRoutes } = await import("./streaming-routes");
  const { registerPaymentRoutes } = await import("./payment-routes");
  await registerAccountRoutes(app);
  await registerStreamingRoutes(app);
  await registerPaymentRoutes(app);

  // Health check endpoint (for load balancers & docker health checks)
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // OpenAPI Documentation
  app.get("/api/docs", (req, res) => {
    res.json(openApiSpec);
  });

  // Movies API with caching
  app.get("/api/movies", async (req, res) => {
    try {
      // Try cache first
      const cacheKey = cacheKeys.movies();
      const cached = await getCached(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const movies = await storage.getMovies();
      const userPlan = req.user?.plan || "free";
      
      // Filter by subscription and cache
      const filtered = await filterBySubscription(movies, userPlan);
      await setCached(cacheKey, filtered, 300); // 5 min cache
      
      res.json(filtered);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/movies/:id", async (req, res) => {
    try {
      const movie = await storage.getMovie(Number(req.params.id));
      if (!movie) {
        return res.status(404).json({ error: "Movie not found" });
      }
      res.json(movie);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/movies", adminMiddleware, async (req, res) => {
    try {
      const result = insertMovieSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }
      const movie = await storage.createMovie(result.data);
      // Invalidate cache on create
      await invalidateCache("cache:movies:*");
      res.status(201).json(movie);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/movies/:id", adminMiddleware, async (req, res) => {
    try {
      const movie = await storage.updateMovie(Number(req.params.id), req.body);
      if (!movie) {
        return res.status(404).json({ error: "Movie not found" });
      }
      // Invalidate cache on update
      await invalidateCache("cache:movies:*");
      res.json(movie);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/movies/:id", adminMiddleware, async (req, res) => {
    try {
      await storage.deleteMovie(Number(req.params.id));
      // Invalidate cache on delete
      await invalidateCache("cache:movies:*");
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Series API with caching
  app.get("/api/series", async (req, res) => {
    try {
      const cacheKey = cacheKeys.series();
      const cached = await getCached(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const seriesData = await storage.getAllSeries();
      const userPlan = req.user?.plan || "free";
      
      // Filter by subscription and cache
      const filtered = await filterBySubscription(seriesData, userPlan);
      await setCached(cacheKey, filtered, 300); // 5 min cache
      
      res.json(filtered);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/series/:id", async (req, res) => {
    try {
      const series = await storage.getSeries(Number(req.params.id));
      if (!series) {
        return res.status(404).json({ error: "Series not found" });
      }
      res.json(series);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/series", adminMiddleware, async (req, res) => {
    try {
      const result = insertSeriesSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }
      const series = await storage.createSeries(result.data);
      // Invalidate cache on create
      await invalidateCache("cache:series:*");
      res.status(201).json(series);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/series/:id", adminMiddleware, async (req, res) => {
    try {
      const series = await storage.updateSeries(Number(req.params.id), req.body);
      if (!series) {
        return res.status(404).json({ error: "Series not found" });
      }
      res.json(series);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/series/:id", adminMiddleware, async (req, res) => {
    try {
      await storage.deleteSeries(Number(req.params.id));
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Episodes API
  app.get("/api/series/:seriesId/episodes", async (req, res) => {
    try {
      const episodes = await storage.getEpisodesBySeries(Number(req.params.seriesId));
      res.json(episodes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/episodes", adminMiddleware, async (req, res) => {
    try {
      const result = insertEpisodeSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }
      const episode = await storage.createEpisode(result.data);
      res.status(201).json(episode);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/episodes/:id", adminMiddleware, async (req, res) => {
    try {
      const episode = await storage.updateEpisode(Number(req.params.id), req.body);
      if (!episode) {
        return res.status(404).json({ error: "Episode not found" });
      }
      res.json(episode);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/episodes/:id", adminMiddleware, async (req, res) => {
    try {
      await storage.deleteEpisode(Number(req.params.id));
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Channels API
  app.get("/api/channels", async (req, res) => {
    try {
      const channels = await storage.getChannels();
      res.json(channels);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/channels/:id", async (req, res) => {
    try {
      const channel = await storage.getChannel(Number(req.params.id));
      if (!channel) {
        return res.status(404).json({ error: "Channel not found" });
      }
      res.json(channel);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/channels", adminMiddleware, async (req, res) => {
    try {
      const result = insertChannelSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }
      const channel = await storage.createChannel(result.data);
      res.status(201).json(channel);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/channels/:id", adminMiddleware, async (req, res) => {
    try {
      const channel = await storage.updateChannel(Number(req.params.id), req.body);
      if (!channel) {
        return res.status(404).json({ error: "Channel not found" });
      }
      res.json(channel);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/channels/:id", adminMiddleware, async (req, res) => {
    try {
      await storage.deleteChannel(Number(req.params.id));
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // App Users API
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAppUsers();
      const safeUsers = users.map(({ passwordHash, ...user }) => user);
      res.json(safeUsers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getAppUser(Number(req.params.id));
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { passwordHash, ...safeUser } = user;
      res.json(safeUser);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/users/:id", adminMiddleware, async (req, res) => {
    try {
      // Don't allow password updates through this endpoint
      const { passwordHash, ...updates } = req.body;
      const user = await storage.updateAppUser(Number(req.params.id), updates);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { passwordHash: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/users/:id", adminMiddleware, async (req, res) => {
    try {
      await storage.deleteAppUser(Number(req.params.id));
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Dashboard stats endpoint
  app.get("/api/stats", async (req, res) => {
    try {
      const [movies, series, channels, users] = await Promise.all([
        storage.getMovies(),
        storage.getAllSeries(),
        storage.getChannels(),
        storage.getAppUsers(),
      ]);

      const stats = {
        totalMovies: movies.length,
        totalSeries: series.length,
        totalChannels: channels.length,
        totalUsers: users.length,
        activeChannels: channels.filter(c => c.status === "online").length,
        totalViews: movies.reduce((sum, m) => sum + m.views, 0),
      };

      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Subscription Plans API with auto-seed on first request
  app.get("/api/subscription-plans", async (req, res) => {
    try {
      let plans = await storage.getSubscriptionPlans();
      
      // Auto-seed default plans if empty
      if (plans.length === 0) {
        const defaultPlans = [
          {
            name: "Free",
            description: "Basic access with ads",
            price: 0, // Free
            billingPeriod: "monthly",
            maxDevices: 1,
            maxQuality: "480p",
            features: ["Standard definition", "1 device", "Monthly content"],
          },
          {
            name: "Standard",
            description: "HD quality on 2 devices",
            price: 999, // $9.99/month
            billingPeriod: "monthly",
            maxDevices: 2,
            maxQuality: "1080p",
            features: ["HD quality", "2 devices", "Offline downloads", "No ads"],
          },
          {
            name: "Premium",
            description: "Ultra HD on 4 devices",
            price: 1999, // $19.99/month
            billingPeriod: "monthly",
            maxDevices: 4,
            maxQuality: "4k",
            features: ["4K quality", "4 devices", "Offline downloads", "No ads", "DRM content"],
          },
        ];
        
        for (const plan of defaultPlans) {
          await storage.createSubscriptionPlan(plan);
        }
        
        plans = await storage.getSubscriptionPlans();
      }
      
      res.json(plans);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/subscription-plans", async (req, res) => {
    try {
      const result = insertSubscriptionPlanSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }
      const plan = await storage.createSubscriptionPlan(result.data);
      res.status(201).json(plan);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/subscription-plans/:id", async (req, res) => {
    try {
      const plan = await storage.updateSubscriptionPlan(Number(req.params.id), req.body);
      if (!plan) {
        return res.status(404).json({ error: "Plan not found" });
      }
      res.json(plan);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/subscription-plans/:id", async (req, res) => {
    try {
      await storage.deleteSubscriptionPlan(Number(req.params.id));
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // User registration endpoint
  app.post("/api/users/register", async (req, res) => {
    try {
      const { name, email, passwordHash, plan } = req.body;
      
      if (!name || !email || !passwordHash) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const existingUser = await storage.getAppUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const user = await storage.createAppUser({
        name,
        email,
        passwordHash,
        plan: plan || "free",
        status: "active",
      });

      const { passwordHash: _, ...safeUser } = user;
      const token = generateToken({
        userId: user.id,
        email: user.email,
        plan: user.plan,
      });
      
      res.status(201).json({ ...safeUser, token });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // User login endpoint - checks both app users and admins
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      // Check if user is an admin first
      const admin = await storage.getAdminByEmail(email);
      if (admin) {
        // Verify admin password
        const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
        if (!isPasswordValid) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = generateToken({
          userId: admin.id,
          email: admin.email,
          plan: "admin",
          role: "admin",
        });

        res.json({ 
          id: admin.id, 
          email: admin.email, 
          username: admin.username,
          role: "admin", 
          token 
        });
        return;
      }

      // Check app users
      const user = await storage.getAppUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Verify password using bcrypt
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = generateToken({
        userId: user.id,
        email: user.email,
        plan: user.plan,
        role: "subscriber",
      });

      const { passwordHash: _, ...safeUser } = user;
      res.json({ ...safeUser, token, role: "subscriber" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Public API: Get movies filtered by user plan and active status
  app.get("/api/public/movies", async (req, res) => {
    try {
      const userPlan = (req.query.plan as string) || "free";
      const allMovies = await storage.getMovies();
      
      const accessibleMovies = allMovies.filter(movie => 
        movie.status === "active" && (
          movie.requiredPlan === "free" ||
          (movie.requiredPlan === "standard" && (userPlan === "standard" || userPlan === "premium")) ||
          (movie.requiredPlan === "premium" && userPlan === "premium")
        )
      );
      
      res.json(accessibleMovies);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Public API: Get series filtered by user plan and active status
  app.get("/api/public/series", async (req, res) => {
    try {
      const userPlan = (req.query.plan as string) || "free";
      const allSeries = await storage.getAllSeries();
      
      const accessibleSeries = allSeries.filter(show => 
        show.status === "active" && (
          show.requiredPlan === "free" ||
          (show.requiredPlan === "standard" && (userPlan === "standard" || userPlan === "premium")) ||
          (show.requiredPlan === "premium" && userPlan === "premium")
        )
      );
      
      res.json(accessibleSeries);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Check content access for user
  app.get("/api/content/:type/:id/access", async (req, res) => {
    try {
      const { type, id } = req.params;
      const userPlan = (req.query.plan as string) || "free";
      
      let content: any;
      if (type === "movie") {
        content = await storage.getMovie(Number(id));
      } else if (type === "series") {
        content = await storage.getSeries(Number(id));
      } else {
        return res.status(400).json({ error: "Invalid content type" });
      }

      if (!content) {
        return res.status(404).json({ error: "Content not found" });
      }

      const canAccess = 
        content.status === "active" && (
          content.requiredPlan === "free" ||
          (content.requiredPlan === "standard" && (userPlan === "standard" || userPlan === "premium")) ||
          (content.requiredPlan === "premium" && userPlan === "premium")
        );

      res.json({
        id: content.id,
        title: content.title,
        accessible: canAccess,
        requiredPlan: content.requiredPlan,
        status: content.status,
        ...(canAccess ? { videoUrl: content.videoUrl } : {}),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Search & Filter: Movies
  app.get("/api/movies/search", async (req, res) => {
    try {
      const { q, genre, status } = req.query;
      const movies = await storage.searchMovies(
        (q as string) || "",
        (genre as string) || undefined,
        (status as string) || undefined
      );
      res.json(movies);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Search & Filter: Series
  app.get("/api/series/search", async (req, res) => {
    try {
      const { q, genre, status } = req.query;
      const allSeries = await storage.searchSeries(
        (q as string) || "",
        (genre as string) || undefined,
        (status as string) || undefined
      );
      res.json(allSeries);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Channel Content: Add content to channel
  app.post("/api/channels/:channelId/content", adminMiddleware, async (req, res) => {
    try {
      const { contentType, contentId } = req.body;
      const channelId = Number(req.params.channelId);

      if (!contentType || !contentId) {
        return res.status(400).json({ error: "Missing contentType or contentId" });
      }

      const content = await storage.addContentToChannel({
        channelId,
        contentType,
        contentId,
      });

      res.status(201).json(content);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Channel Content: Get channel content
  app.get("/api/channels/:channelId/content", async (req, res) => {
    try {
      const content = await storage.getChannelContent(Number(req.params.channelId));
      res.json(content);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Channel Content: Remove content from channel
  app.delete("/api/channels/:channelId/content/:contentId", adminMiddleware, async (req, res) => {
    try {
      await storage.removeContentFromChannel(
        Number(req.params.contentId),
        Number(req.params.channelId)
      );
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API Keys Management
  app.get("/api/admin/keys", authMiddleware, async (req, res) => {
    try {
      const keys = await storage.getApiKeys();
      // Hide secrets from response
      const safeKeys = keys.map(k => ({ ...k, secret: k.secret.substring(0, 8) + "****" }));
      res.json(safeKeys);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/keys", adminMiddleware, async (req, res) => {
    try {
      const { appName, createdBy } = req.body;
      
      if (!appName || !createdBy) {
        return res.status(400).json({ error: "Missing appName or createdBy" });
      }

      // Generate random key and secret
      const key = `fenix_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      const secret = Math.random().toString(36).substring(2, 32) + Math.random().toString(36).substring(2, 32);

      const apiKey = await storage.createApiKey({
        appName,
        key,
        secret,
        status: "active",
        createdBy,
      });

      res.status(201).json({ ...apiKey, secret }); // Return full secret on creation
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/keys/:id/revoke", adminMiddleware, async (req, res) => {
    try {
      const key = await storage.revokeApiKey(Number(req.params.id));
      if (!key) {
        return res.status(404).json({ error: "Key not found" });
      }
      res.json(key);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Mobile App API Key Verification (public endpoint)
  app.post("/api/verify-key", async (req, res) => {
    try {
      const { key, secret } = req.body;
      
      if (!key || !secret) {
        return res.status(400).json({ error: "Missing key or secret" });
      }

      const apiKey = await storage.verifyApiKey(key, secret);
      if (!apiKey) {
        return res.status(401).json({ error: "Invalid key or secret" });
      }

      res.json({ valid: true, appName: apiKey.appName });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // DATA MIGRATION ENDPOINTS (Test 4.1 & 4.2)
  
  // Test 4.1: Export data
  app.get("/api/admin/export", authMiddleware, async (req, res) => {
    try {
      const exportType = (req.query.type as string) || "all"; // all, movies, series, channels, users
      
      const exportData: any = { exportedAt: new Date().toISOString() };

      if (exportType === "all" || exportType === "movies") {
        exportData.movies = await storage.getMovies();
      }
      if (exportType === "all" || exportType === "series") {
        exportData.series = await storage.getAllSeries();
      }
      if (exportType === "all" || exportType === "channels") {
        exportData.channels = await storage.getChannels();
      }
      if (exportType === "all" || exportType === "users") {
        const users = await storage.getAppUsers();
        exportData.users = users.map(({ passwordHash, ...user }) => user);
      }

      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename="fenix-export-${Date.now()}.json"`);
      res.json(exportData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Import/Export data
  app.post("/api/admin/import", adminMiddleware, async (req, res) => {
    try {
      const { movies = [], series: seriesData = [], channels = [], users = [] } = req.body;
      
      const importResults = {
        moviesImported: 0,
        seriesImported: 0,
        channelsImported: 0,
        usersImported: 0,
        errors: [] as string[],
      };

      // Import movies
      for (const movie of movies) {
        try {
          const { id, createdAt, updatedAt, ...movieData } = movie;
          await storage.createMovie(movieData);
          importResults.moviesImported++;
        } catch (err: any) {
          importResults.errors.push(`Movie import failed: ${err.message}`);
        }
      }

      // Import series
      for (const show of seriesData) {
        try {
          const { id, createdAt, updatedAt, ...showData } = show;
          await storage.createSeries(showData);
          importResults.seriesImported++;
        } catch (err: any) {
          importResults.errors.push(`Series import failed: ${err.message}`);
        }
      }

      // Import channels
      for (const channel of channels) {
        try {
          const { id, createdAt, updatedAt, ...channelData } = channel;
          await storage.createChannel(channelData);
          importResults.channelsImported++;
        } catch (err: any) {
          importResults.errors.push(`Channel import failed: ${err.message}`);
        }
      }

      // Import users
      for (const user of users) {
        try {
          const { id, joinedAt, lastLogin, passwordHash, ...userData } = user;
          if (!userData.passwordHash) userData.passwordHash = "imported_user_hash";
          await storage.createAppUser(userData);
          importResults.usersImported++;
        } catch (err: any) {
          importResults.errors.push(`User import failed: ${err.message}`);
        }
      }

      res.status(201).json(importResults);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== CLOUD STORAGE & STREAMING ENDPOINTS =====

  // Storage health check
  app.get("/api/storage/health", async (req, res) => {
    try {
      const isHealthy = await healthCheck();
      res.json({
        status: isHealthy ? "healthy" : "unhealthy",
        provider: getStorageConfig().provider,
        bucket: getStorageConfig().bucket,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(503).json({
        status: "error",
        error: error.message,
      });
    }
  });

  // Video upload with cloud storage backend
  app.post("/api/videos/upload", adminMiddleware, async (req, res) => {
    try {
      const { title, description, genre, duration, fileBuffer } = req.body;

      if (!fileBuffer || !title) {
        return res.status(400).json({ error: "Missing title or file" });
      }

      const buffer = Buffer.from(fileBuffer, "base64");
      const filename = `${Date.now()}-${title.replace(/\s+/g, "-")}.mp4`;

      // Upload to cloud storage
      const videoKey = await (
        await import("./cloud-storage")
      ).uploadVideo(filename, buffer, "video/mp4", {
        title,
        uploadedBy: req.user?.email || "unknown",
      });

      // Start transcoding job if enabled
      let transcodingJobId = "";
      if (process.env.TRANSCODING_ENABLED === "true") {
        try {
          const { startTranscodingJob } = await import("./transcoding");
          transcodingJobId = await startTranscodingJob(
            videoKey,
            title,
            getStorageConfig().bucket
          );
        } catch (err) {
          console.warn("[api] Transcoding not available:", err);
        }
      }

      // Create movie record in database
      const movie = await storage.createMovie({
        title,
        description,
        genre,
        year: new Date().getFullYear(),
        duration: duration || 120,
        videoUrl: generateCDNUrl(videoKey),
        posterUrl: "", // Will be set later
        status: "processing",
        requiredPlan: "free",
        cast: [],
      });

      // Invalidate cache
      await invalidateCache("cache:movies:*");

      res.status(201).json({
        movieId: movie.id,
        videoKey,
        transcodingJobId,
        status: "processing",
        streamingUrl: generateCDNUrl(videoKey),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Generate streaming URLs (HLS/DASH) with CloudFront signing
  app.get("/api/videos/:id/stream", async (req, res) => {
    try {
      const movieId = Number(req.params.id);
      const format = (req.query.format as string) || "hls"; // hls or dash

      // Get movie from database
      const movie = await storage.getMovie(movieId);
      if (!movie) {
        return res.status(404).json({ error: "Movie not found" });
      }

      // Check subscription access
      const userPlan = req.user?.plan || "free";
      const hasAccess = await checkContentAccess(
        "movie",
        movieId,
        userPlan
      );

      if (!hasAccess) {
        return res.status(403).json({
          error: "Access denied. This content requires a higher subscription tier.",
          requiredPlan: movie.requiredPlan,
          userPlan: userPlan,
        });
      }

      // Generate streaming configuration
      const qualities = (
        process.env.STREAMING_QUALITIES || "hd1080,hd720,sd480"
      ).split(",");

      const cdnUrlBase: string = getStorageConfig().cdnUrl || generateCDNUrl("");
      const streamingConfig = buildStreamingUrl(
        movie.videoUrl,
        cdnUrlBase,
        (format as "hls" | "dash") || "hls",
        qualities,
        movie.duration || 0,
        movie.posterUrl
      );

      // Generate playlists
      let playlistContent = "";
      if (format === "hls") {
        playlistContent = generateHLSPlaylist(
          movie.videoUrl,
          qualities,
          cdnUrlBase
        );
      } else {
        playlistContent = generateDASHManifest(
          movie.videoUrl,
          qualities,
          cdnUrlBase,
          movie.duration || 0
        );
      }

      // Generate CloudFront signed URLs if private key is available
      let signedUrls: any = {
        hls: `${process.env.CDN_URL}/${movie.videoUrl}/playlist.m3u8`,
        dash: `${process.env.CDN_URL}/${movie.videoUrl}/manifest.mpd`,
      };

      if (process.env.CLOUDFRONT_PRIVATE_KEY && process.env.CLOUDFRONT_KEY_PAIR_ID && process.env.CLOUDFRONT_DOMAIN) {
        try {
          const hlsSignedUrl = generateSignedHLSUrl(movieId, {
            privateKey: process.env.CLOUDFRONT_PRIVATE_KEY,
            keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID,
            domainName: process.env.CLOUDFRONT_DOMAIN,
            expireTime: parseInt(process.env.CLOUDFRONT_URL_EXPIRY || "3600"),
          });

          const dashSignedUrl = generateSignedDASHUrl(movieId, {
            privateKey: process.env.CLOUDFRONT_PRIVATE_KEY,
            keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID,
            domainName: process.env.CLOUDFRONT_DOMAIN,
            expireTime: parseInt(process.env.CLOUDFRONT_URL_EXPIRY || "3600"),
          });

          signedUrls = {
            hls: hlsSignedUrl.url,
            dash: dashSignedUrl.url,
          };
        } catch (err) {
          console.warn("[api] Failed to generate signed URLs:", err);
          // Fallback to unsigned URLs if signing fails
        }
      }

      res.json({
        movieId,
        title: movie.title,
        format,
        streamingUrl: signedUrls[format] || streamingConfig.playlistUrl,
        qualities,
        duration: movie.duration,
        poster: movie.posterUrl,
        playlist: playlistContent, // For direct playlist access
        signedUrls, // Signed URLs for secure access
        security: {
          signed: !!process.env.CLOUDFRONT_PRIVATE_KEY,
          provider: "CloudFront",
          expiry: parseInt(process.env.CLOUDFRONT_URL_EXPIRY || "3600"),
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get video streaming manifest (HLS or DASH)
  app.get("/api/videos/:id/playlist.m3u8", async (req, res) => {
    try {
      const movieId = Number(req.params.id);
      const movie = await storage.getMovie(movieId);

      if (!movie) {
        return res.status(404).json({ error: "Not found" });
      }

      const qualities = (
        process.env.STREAMING_QUALITIES || "hd1080,hd720,sd480"
      ).split(",");
      const cdnUrlPlaylist: string = getStorageConfig().cdnUrl || "";
      const playlist = generateHLSPlaylist(
        movie.videoUrl,
        qualities,
        cdnUrlPlaylist
      );

      res.type("application/vnd.apple.mpegurl");
      res.send(playlist);
    } catch (error) {
      res.status(500).send("Error generating playlist");
    }
  });

  // Get video DASH manifest
  app.get("/api/videos/:id/manifest.mpd", async (req, res) => {
    try {
      const movieId = Number(req.params.id);
      const movie = await storage.getMovie(movieId);

      if (!movie) {
        return res.status(404).json({ error: "Not found" });
      }

      const qualities = (
        process.env.STREAMING_QUALITIES || "hd1080,hd720,sd480"
      ).split(",");
      const cdnUrlManifest: string = getStorageConfig().cdnUrl || "";
      const manifest = generateDASHManifest(
        movie.videoUrl,
        qualities,
        cdnUrlManifest,
        movie.duration || 0
      );

      res.type("application/dash+xml");
      res.send(manifest);
    } catch (error) {
      res.status(500).send("Error generating manifest");
    }
  });

  // Save viewing progress (for resume watching)
  app.post("/api/viewing-progress", authMiddleware, async (req, res) => {
    try {
      const { contentId, currentTimeSeconds, durationSeconds, contentType } = req.body;
      const userId = (req as any).user.userId;

      if (!contentId || currentTimeSeconds === undefined || durationSeconds === undefined) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const completionPercentage = Math.round((currentTimeSeconds / durationSeconds) * 100);
      
      // Update viewing progress
      const result = await storage.updateViewingProgress(
        userId,
        contentId,
        currentTimeSeconds,
        durationSeconds
      );

      res.json({
        success: true,
        completionPercentage,
        lastWatched: result?.lastWatchedAt || new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Get billing transactions
  app.get("/api/admin/transactions", adminMiddleware, async (req, res) => {
    try {
      // Return mock transactions for now - in production this would query payment history
      const mockTransactions = [
        {
          id: 1,
          userId: 4,
          planId: 2,
          planName: "Standard",
          amount: 9.99,
          status: "paid",
          paymentMethod: "Stripe",
          transactionId: "pi_1234567890abcdef",
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          userId: 5,
          planId: 3,
          planName: "Premium",
          amount: 19.99,
          status: "paid",
          paymentMethod: "Stripe",
          transactionId: "pi_0987654321fedcba",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
      
      res.json(mockTransactions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Favorites API
  app.post("/api/favorites", authMiddleware, async (req, res) => {
    try {
      const { contentId, contentType } = req.body;
      const userId = (req as any).user.userId;
      
      if (!contentId || !contentType) {
        return res.status(400).json({ error: "Missing contentId or contentType" });
      }

      const favorite = await storage.addFavorite({ userId, contentId, contentType });
      res.status(201).json(favorite);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/favorites/:contentId/:contentType", authMiddleware, async (req, res) => {
    try {
      const { contentId, contentType } = req.params;
      const userId = (req as any).user.userId;
      
      await storage.removeFavorite(userId, Number(contentId), contentType);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/favorites", authMiddleware, async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/favorites/check/:contentId/:contentType", authMiddleware, async (req, res) => {
    try {
      const { contentId, contentType } = req.params;
      const userId = (req as any).user.userId;
      
      const isFav = await storage.isFavorite(userId, Number(contentId), contentType);
      res.json({ isFavorite: isFav });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Watchlist API
  app.post("/api/watchlist", authMiddleware, async (req, res) => {
    try {
      const { contentId, contentType } = req.body;
      const userId = (req as any).user.userId;
      
      if (!contentId || !contentType) {
        return res.status(400).json({ error: "Missing contentId or contentType" });
      }

      const watchlist = await storage.addToWatchlist({ userId, contentId, contentType });
      res.status(201).json(watchlist);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/watchlist/:contentId/:contentType", authMiddleware, async (req, res) => {
    try {
      const { contentId, contentType } = req.params;
      const userId = (req as any).user.userId;
      
      await storage.removeFromWatchlist(userId, Number(contentId), contentType);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/watchlist", authMiddleware, async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const watchlist = await storage.getUserWatchlist(userId);
      
      // Fetch content details for each watchlist item
      const enriched = await Promise.all(
        watchlist.map(async (item: any) => {
          let content;
          if (item.contentType === "movie") {
            content = await storage.getMovie(item.contentId);
          } else if (item.contentType === "series") {
            content = await storage.getSeries(item.contentId);
          }
          return { ...item, content };
        })
      );
      
      res.json(enriched);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
