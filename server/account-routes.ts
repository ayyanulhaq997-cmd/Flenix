import type { Express } from "express";
import { storage } from "./storage";
import { authMiddleware } from "./auth";
import bcrypt from "bcryptjs";

export async function registerAccountRoutes(app: Express) {
  // Get account information
  app.get("/api/account", authMiddleware, async (req, res) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = await storage.getAppUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        email: user.email,
        name: user.name,
        plan: user.plan,
        joinedAt: user.joinedAt,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Change password
  app.post("/api/account/change-password", authMiddleware, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user?.userId;

      if (!userId || !currentPassword || !newPassword) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const user = await storage.getAppUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      // Hash new password and update
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateAppUser(userId, { passwordHash: hashedPassword });

      res.json({ message: "Password changed successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get user sessions
  app.get("/api/sessions", authMiddleware, async (req, res) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const sessions = await storage.getUserSessions(userId);
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Sign out specific device
  app.post("/api/sessions/:sessionId/sign-out", authMiddleware, async (req, res) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Verify session belongs to user
      const session = await storage.getUserSession(Number(sessionId));
      if (!session || session.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      // Delete session
      await storage.deleteSession(Number(sessionId));
      res.json({ message: "Signed out successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Sign out all devices
  app.post("/api/account/sign-out-all-devices", authMiddleware, async (req, res) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Delete all sessions for user
      await storage.deleteAllUserSessions(userId);
      res.json({ message: "Signed out from all devices" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get user profiles
  app.get("/api/profiles", authMiddleware, async (req, res) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const profiles = await storage.getUserProfiles(userId);
      res.json(profiles);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create profile
  app.post("/api/profiles", authMiddleware, async (req, res) => {
    try {
      const { name, isKidsProfile } = req.body;
      const userId = req.user?.userId;

      if (!userId || !name) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Check profile limit
      const profiles = await storage.getUserProfiles(userId);
      if (profiles.length >= 5) {
        return res.status(400).json({ error: "Maximum 5 profiles allowed" });
      }

      const profile = await storage.createUserProfile({
        userId,
        name,
        isKidsProfile: isKidsProfile || false,
      });

      res.status(201).json(profile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Set profile PIN
  app.post("/api/profiles/:profileId/set-pin", authMiddleware, async (req, res) => {
    try {
      const { pin } = req.body;
      const { profileId } = req.params;
      const userId = req.user?.userId;

      if (!userId || !pin || pin.length !== 4) {
        return res.status(400).json({ error: "PIN must be 4 digits" });
      }

      // Verify profile belongs to user
      const profile = await storage.getUserProfile(Number(profileId));
      if (!profile || profile.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      // Hash PIN and update
      const pinHash = await bcrypt.hash(pin, 10);
      await storage.updateUserProfile(Number(profileId), {
        isPinProtected: true,
        pinHash,
      });

      res.json({ message: "PIN set successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Verify profile PIN
  app.post("/api/profiles/:profileId/verify-pin", async (req, res) => {
    try {
      const { pin } = req.body;
      const { profileId } = req.params;

      if (!pin) {
        return res.status(400).json({ error: "PIN required" });
      }

      const profile = await storage.getUserProfile(Number(profileId));
      if (!profile || !profile.pinHash) {
        return res.status(403).json({ error: "Invalid profile" });
      }

      const isValid = await bcrypt.compare(pin, profile.pinHash);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid PIN" });
      }

      res.json({ message: "PIN verified", profileId });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}
