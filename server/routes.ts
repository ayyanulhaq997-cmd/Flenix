import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertMovieSchema, insertSeriesSchema, insertEpisodeSchema, insertChannelSchema, insertAppUserSchema, insertSubscriptionPlanSchema, insertChannelContentSchema, insertApiKeySchema, insertFileSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { authMiddleware, generateToken, generateStreamingUrl } from "./auth";
import { openApiSpec } from "./openapi";
import { log } from "./index";
import { getCached, setCached, invalidateCache, cacheKeys } from "./cache";
import { filterBySubscription, checkContentAccess } from "./subscriptions";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
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

  app.post("/api/movies", authMiddleware, async (req, res) => {
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

  app.patch("/api/movies/:id", authMiddleware, async (req, res) => {
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

  app.delete("/api/movies/:id", authMiddleware, async (req, res) => {
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

  app.post("/api/series", authMiddleware, async (req, res) => {
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

  app.patch("/api/series/:id", authMiddleware, async (req, res) => {
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

  app.delete("/api/series/:id", authMiddleware, async (req, res) => {
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

  app.post("/api/episodes", authMiddleware, async (req, res) => {
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

  app.patch("/api/episodes/:id", authMiddleware, async (req, res) => {
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

  app.delete("/api/episodes/:id", authMiddleware, async (req, res) => {
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

  app.post("/api/channels", authMiddleware, async (req, res) => {
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

  app.patch("/api/channels/:id", authMiddleware, async (req, res) => {
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

  app.delete("/api/channels/:id", authMiddleware, async (req, res) => {
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

  app.patch("/api/users/:id", async (req, res) => {
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

  app.delete("/api/users/:id", async (req, res) => {
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

  // Subscription Plans API
  app.get("/api/subscription-plans", async (req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
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

  // User login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      const user = await storage.getAppUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Simple password check - in production, use bcrypt
      if (user.passwordHash !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = generateToken({
        userId: user.id,
        email: user.email,
        plan: user.plan,
      });

      const { passwordHash: _, ...safeUser } = user;
      res.json({ ...safeUser, token });
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
  app.post("/api/channels/:channelId/content", authMiddleware, async (req, res) => {
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
  app.delete("/api/channels/:channelId/content/:contentId", authMiddleware, async (req, res) => {
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

  app.post("/api/admin/keys", authMiddleware, async (req, res) => {
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

  app.post("/api/admin/keys/:id/revoke", authMiddleware, async (req, res) => {
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
  app.post("/api/admin/import", authMiddleware, async (req, res) => {
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

  return httpServer;
}
