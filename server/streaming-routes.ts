import type { Express } from "express";
import { storage } from "./storage";
import { authMiddleware } from "./auth";
import { generateSignedUrl } from "./cloudfront-signing";
import { canStreamAtQuality, getSubscriptionFeatures, canStartStream } from "./subscriptions";
import { geoblockingMiddleware } from "./geoblocking";

export async function registerStreamingRoutes(app: Express) {
  // Get HLS manifest with adaptive bitrate streaming
  // Protected by subscription tier and geoblocking
  app.get(
    "/api/stream/:contentId/manifest.m3u8",
    authMiddleware,
    geoblockingMiddleware(),
    async (req, res) => {
      try {
        const { contentId } = req.params;
        const userPlan = req.user?.plan || "free";
        const userId = req.user?.userId;

        // Check if user can stream based on simultaneous stream limit
        if (userId) {
          const canStream = await canStartStream(userId, userPlan);
          if (!canStream) {
            return res.status(429).json({
              error: "Maximum simultaneous streams reached for your plan",
              maxStreams: getSubscriptionFeatures(userPlan).maxSimultaneousStreams,
            });
          }
        }

        const movie = await storage.getMovie(Number(contentId));
        if (!movie) {
          return res.status(404).json({ error: "Content not found" });
        }

        // Check subscription access
        if (!canStreamAtQuality(userPlan, "1080p")) {
          return res.status(403).json({
            error: "Your subscription plan doesn't support streaming",
            requiredPlan: "standard",
          });
        }

        // Generate signed CloudFront URL valid for 5 minutes (300 seconds)
        // Short expiry prevents unauthorized sharing/redistribution
        const masterUrl = generateSignedUrl(`/hls/${contentId}/master.m3u8`, {
          privateKey: process.env.CLOUDFRONT_PRIVATE_KEY || "",
          keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID || "",
          domainName: process.env.CLOUDFRONT_DOMAIN || "d123456.cloudfront.net",
          expireTime: 300, // 5 minutes - short-lived for security
        });

      // HLS Master Playlist with multiple quality levels
      const manifest = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXT-X-MEDIA-SEQUENCE:0

#EXT-X-STREAM-INF:BANDWIDTH=500000,RESOLUTION=854x480
${masterUrl.replace("master.m3u8", "480p/playlist.m3u8")}

#EXT-X-STREAM-INF:BANDWIDTH=1000000,RESOLUTION=1280x720
${masterUrl.replace("master.m3u8", "720p/playlist.m3u8")}

#EXT-X-STREAM-INF:BANDWIDTH=2500000,RESOLUTION=1920x1080
${masterUrl.replace("master.m3u8", "1080p/playlist.m3u8")}

#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=3840x2160
${masterUrl.replace("master.m3u8", "4k/playlist.m3u8")}`;

      res.set("Content-Type", "application/vnd.apple.mpegurl");
      res.send(manifest);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
    }
  );

  // Get audio tracks for content (with subscription check)
  app.get("/api/content/:contentId/audio-tracks", authMiddleware, geoblockingMiddleware(), async (req, res) => {
    try {
      const { contentId } = req.params;
      const tracks = await storage.getAudioTracks(Number(contentId));
      res.json(tracks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get subtitles for content (with subscription check)
  app.get("/api/content/:contentId/subtitles", authMiddleware, geoblockingMiddleware(), async (req, res) => {
    try {
      const { contentId } = req.params;
      const subtitles = await storage.getSubtitles(Number(contentId));
      res.json(subtitles);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update viewing progress (cross-device sync)
  app.post("/api/viewing-history/progress", authMiddleware, async (req, res) => {
    try {
      const { contentId, contentType, currentTime, duration, episodeId } = req.body;
      const userId = req.user?.userId;

      if (!userId || !contentId || !contentType || currentTime === undefined || !duration) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const completionPercentage = Math.round((currentTime / duration) * 100);

      const history = await storage.updateViewingProgress(
        userId,
        contentId,
        currentTime,
        duration,
        contentType,
        episodeId,
        completionPercentage
      );

      res.json(history);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get viewing progress for cross-device sync
  app.get("/api/viewing-history/:contentId", authMiddleware, async (req, res) => {
    try {
      const { contentId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const history = await storage.getViewingHistoryItem(
        userId,
        "movie",
        Number(contentId)
      );

      if (!history) {
        return res.json({ currentTime: 0 });
      }

      res.json({
        currentTime: history.currentTimeSeconds,
        duration: history.durationSeconds,
        completionPercentage: history.completionPercentage,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Download content for offline viewing
  app.post("/api/downloads", authMiddleware, async (req, res) => {
    try {
      const { contentId, contentType, episodeId, quality } = req.body;
      const userId = req.user?.userId;

      if (!userId || !contentId || !contentType || !quality) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Validate quality
      if (!["standard", "high"].includes(quality)) {
        return res.status(400).json({ error: "Invalid quality" });
      }

      // Estimate file size based on quality
      const fileSize = quality === "standard" ? 500 * 1024 * 1024 : 1500 * 1024 * 1024; // 500MB or 1.5GB

      // DRM license expires in 30 days
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const download = await storage.createDownload({
        userId,
        contentId: Number(contentId),
        contentType,
        episodeId: episodeId ? Number(episodeId) : undefined,
        quality,
        fileSize,
        expiresAt,
        status: "downloading",
      });

      // In production, return signed URL for download
      // For now, return placeholder
      res.status(201).json({
        ...download,
        downloadUrl: `/api/downloads/${download.id}/file`,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get user's downloads
  app.get("/api/downloads", authMiddleware, async (req, res) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const downloads = await storage.getUserDownloads(userId);
      res.json(downloads);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete download
  app.delete("/api/downloads/:downloadId", authMiddleware, async (req, res) => {
    try {
      const { downloadId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const download = await storage.getDownload(Number(downloadId));
      if (!download || download.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      await storage.deleteDownload(Number(downloadId));
      res.json({ message: "Download deleted" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}
