import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertMovieSchema, insertSeriesSchema, insertEpisodeSchema, insertChannelSchema, insertAppUserSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // Movies API
  app.get("/api/movies", async (req, res) => {
    try {
      const movies = await storage.getMovies();
      res.json(movies);
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

  app.post("/api/movies", async (req, res) => {
    try {
      const result = insertMovieSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }
      const movie = await storage.createMovie(result.data);
      res.status(201).json(movie);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/movies/:id", async (req, res) => {
    try {
      const movie = await storage.updateMovie(Number(req.params.id), req.body);
      if (!movie) {
        return res.status(404).json({ error: "Movie not found" });
      }
      res.json(movie);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/movies/:id", async (req, res) => {
    try {
      await storage.deleteMovie(Number(req.params.id));
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Series API
  app.get("/api/series", async (req, res) => {
    try {
      const allSeries = await storage.getAllSeries();
      res.json(allSeries);
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

  app.post("/api/series", async (req, res) => {
    try {
      const result = insertSeriesSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }
      const series = await storage.createSeries(result.data);
      res.status(201).json(series);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/series/:id", async (req, res) => {
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

  app.delete("/api/series/:id", async (req, res) => {
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

  app.post("/api/episodes", async (req, res) => {
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

  app.patch("/api/episodes/:id", async (req, res) => {
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

  app.delete("/api/episodes/:id", async (req, res) => {
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

  app.post("/api/channels", async (req, res) => {
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

  app.patch("/api/channels/:id", async (req, res) => {
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

  app.delete("/api/channels/:id", async (req, res) => {
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
      // Don't send password hashes to frontend
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

  return httpServer;
}
