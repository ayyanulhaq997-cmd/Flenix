import { type Request, Response, NextFunction } from "express";
import geoip from "geoip-lite";

/**
 * Geoblocking middleware
 * Restricts streaming access based on user's geographic location
 * Supports content licensing agreements for specific regions
 */

export interface GeoblockingConfig {
  allowedCountries?: string[]; // ISO country codes (e.g., ["US", "CA", "MX"])
  blockedCountries?: string[]; // ISO country codes to block
  blockVPN?: boolean; // Block VPN/proxy users (optional)
}

// Default: worldwide access (empty = allow all)
const DEFAULT_CONFIG: GeoblockingConfig = {
  allowedCountries: process.env.ALLOWED_COUNTRIES
    ? process.env.ALLOWED_COUNTRIES.split(",")
    : [],
  blockedCountries: process.env.BLOCKED_COUNTRIES
    ? process.env.BLOCKED_COUNTRIES.split(",")
    : [],
  blockVPN: false,
};

/**
 * Get user's country from IP address
 * Handles both IPv4 and IPv6
 */
export function getUserCountry(ipAddress: string): string | null {
  try {
    const geo = geoip.lookup(ipAddress);
    return geo?.country || null;
  } catch (error) {
    console.error("[geoblocking] Failed to lookup IP:", error);
    return null;
  }
}

/**
 * Check if user is allowed to stream based on location
 */
export function isGeoAllowed(
  userCountry: string | null,
  config: GeoblockingConfig = DEFAULT_CONFIG
): boolean {
  if (!userCountry) {
    // Unknown country - deny access for security
    return false;
  }

  // Check blocked countries first
  if (config.blockedCountries && config.blockedCountries.includes(userCountry)) {
    return false;
  }

  // If allowedCountries is specified, only allow those countries
  if (config.allowedCountries && config.allowedCountries.length > 0) {
    return config.allowedCountries.includes(userCountry);
  }

  // Default: allow
  return true;
}

/**
 * Geoblocking middleware
 * Attach to routes that need geoblocking protection
 */
export function geoblockingMiddleware(
  config?: GeoblockingConfig
) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Get user's IP address (handle proxies)
    const ipAddress = 
      (req.headers["cf-connecting-ip"] as string) || // Cloudflare
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] || // Proxy chain
      req.ip || // Express default
      "127.0.0.1";

    // Get country from IP
    const userCountry = getUserCountry(ipAddress);

    // Check geoblocking rules
    const mergedConfig = { ...DEFAULT_CONFIG, ...config };
    const allowed = isGeoAllowed(userCountry, mergedConfig);

    // Attach geo info to request
    (req as any).geo = {
      ipAddress,
      country: userCountry,
      allowed,
    };

    if (!allowed) {
      return res.status(403).json({
        error: "Content not available in your region",
        country: userCountry,
      });
    }

    next();
  };
}

/**
 * Create a geoblocking middleware for specific content
 */
export function createGeoblockingMiddleware(allowedCountries: string[]) {
  return geoblockingMiddleware({ allowedCountries });
}
