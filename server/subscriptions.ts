import { type Request, Response, NextFunction } from "express";
import { storage } from "./storage";

// Plan hierarchy: free < standard < premium
const planHierarchy: Record<string, number> = {
  free: 0,
  standard: 1,
  premium: 2,
};

// Subscription tier features - business model enforcement
export const subscriptionFeatures: Record<string, {
  maxDevices: number;
  maxQuality: "480p" | "720p" | "1080p" | "4k";
  maxSimultaneousStreams: number;
  supportsOfflineDownload: boolean;
  supportsHDR: boolean;
  supportsSpatialAudio: boolean;
}> = {
  free: {
    maxDevices: 1,
    maxQuality: "720p",
    maxSimultaneousStreams: 1,
    supportsOfflineDownload: false,
    supportsHDR: false,
    supportsSpatialAudio: false,
  },
  standard: {
    maxDevices: 2,
    maxQuality: "1080p",
    maxSimultaneousStreams: 2,
    supportsOfflineDownload: true,
    supportsHDR: false,
    supportsSpatialAudio: false,
  },
  premium: {
    maxDevices: 4,
    maxQuality: "4k",
    maxSimultaneousStreams: 4,
    supportsOfflineDownload: true,
    supportsHDR: true,
    supportsSpatialAudio: true,
  },
};

// Countries where streaming is available (empty = worldwide)
const ALLOWED_COUNTRIES = process.env.ALLOWED_COUNTRIES
  ? process.env.ALLOWED_COUNTRIES.split(",")
  : [];

export function canAccessContent(userPlan: string, requiredPlan: string): boolean {
  const userLevel = planHierarchy[userPlan] ?? 0;
  const requiredLevel = planHierarchy[requiredPlan] ?? 0;
  return userLevel >= requiredLevel;
}

// Get subscription features for a plan
export function getSubscriptionFeatures(plan: string) {
  return subscriptionFeatures[plan] || subscriptionFeatures.free;
}

// Check if user can stream at requested quality
export function canStreamAtQuality(userPlan: string, requestedQuality: string): boolean {
  const features = getSubscriptionFeatures(userPlan);
  const qualityOrder = ["480p", "720p", "1080p", "4k"];
  
  const userQualityIndex = qualityOrder.indexOf(features.maxQuality);
  const requestedQualityIndex = qualityOrder.indexOf(requestedQuality);
  
  return requestedQualityIndex <= userQualityIndex;
}

/**
 * Check if user can start a new stream (enforces max simultaneous streams)
 */
export async function canStartStream(
  userId: number,
  userPlan: string
): Promise<boolean> {
  const features = getSubscriptionFeatures(userPlan);
  
  // Get active sessions for this user
  // In production, query database for active playback sessions
  // For now, we assume DB has this capability
  const activeSessions = await getActivePlaybackSessions(userId);
  
  return activeSessions.length < features.maxSimultaneousStreams;
}

/**
 * Get active playback sessions (stub - implement with DB query)
 */
async function getActivePlaybackSessions(userId: number): Promise<any[]> {
  // TODO: Query database for active sessions in last 5 minutes
  // SELECT * FROM user_sessions WHERE user_id = ? AND last_activity_at > NOW() - INTERVAL 5 MINUTE
  return [];
}

// Middleware to check subscription access for content
export async function subscriptionMiddleware(req: Request, res: Response, next: NextFunction) {
  // Optional middleware - doesn't block, just validates if user exists
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    // No auth = treat as free user
    req.user = { userId: 0, email: "guest", plan: "free" };
  }
  
  next();
}

// Utility to filter content by user subscription
export async function filterBySubscription(content: any[], userPlan: string) {
  return content.filter(item => {
    const requiredPlan = item.requiredPlan || "free";
    return canAccessContent(userPlan, requiredPlan);
  });
}

// Utility to check if user can access specific content
export async function checkContentAccess(
  contentType: "movie" | "series" | "episode",
  contentId: number,
  userPlan: string
): Promise<boolean> {
  try {
    let requiredPlan = "free";

    if (contentType === "movie") {
      const movie = await storage.getMovie(contentId);
      if (!movie) return false;
      requiredPlan = movie.requiredPlan || "free";
    } else if (contentType === "series") {
      const series = await storage.getSeries(contentId);
      if (!series) return false;
      requiredPlan = series.requiredPlan || "free";
    } else if (contentType === "episode") {
      const episode = await storage.getEpisode(contentId);
      if (!episode) return false;
      // Episodes inherit series plan
      const series = await storage.getSeries(episode.seriesId);
      requiredPlan = series?.requiredPlan || "free";
    }

    return canAccessContent(userPlan, requiredPlan);
  } catch (error) {
    console.error("[subscriptions] Access check error:", error);
    return false;
  }
}
