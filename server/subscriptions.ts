import { type Request, Response, NextFunction } from "express";
import { storage } from "./storage";

// Plan hierarchy: free < standard < premium
const planHierarchy: Record<string, number> = {
  free: 0,
  standard: 1,
  premium: 2,
};

export function canAccessContent(userPlan: string, requiredPlan: string): boolean {
  const userLevel = planHierarchy[userPlan] ?? 0;
  const requiredLevel = planHierarchy[requiredPlan] ?? 0;
  return userLevel >= requiredLevel;
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
