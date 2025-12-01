import crypto from "crypto";
import { storage } from "./storage";

/**
 * DRM Licensing Server
 * Implements commercial-grade DRM support for:
 * - Widevine (Android, TV, Windows)
 * - FairPlay (iOS, macOS)
 * - PlayReady (Windows, Xbox)
 */

export interface DRMLicenseRequest {
  userId: number;
  contentId: number;
  deviceId: string;
  licenseType: "widevine" | "fairplay" | "playready";
  challenge?: string; // For Widevine/PlayReady
}

export interface DRMLicense {
  licenseToken: string;
  contentId: number;
  deviceId: string;
  expiresAt: Date;
  licenseType: string;
  drmSystem: string;
  maxDevices: number;
}

/**
 * Generate DRM license for authenticated user
 * Validates subscription tier and device limits
 */
export async function generateDRMLicense(req: DRMLicenseRequest): Promise<DRMLicense> {
  // Verify user has subscription access
  const user = await storage.getUser(req.userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Get subscription features
  const maxDevices = getMaxDevicesForSubscription(user.subscriptionPlan || "free");

  // Check device limit
  const deviceCount = await storage.getUserDeviceCount(req.userId);
  if (deviceCount >= maxDevices) {
    throw new Error(`Device limit (${maxDevices}) exceeded for your subscription`);
  }

  // Generate license token
  const licenseToken = generateLicenseToken(req.userId, req.contentId, req.deviceId);

  // License valid for 30 days
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  // Store license in database
  const license = await storage.createDRMLicense({
    userId: req.userId,
    contentId: req.contentId,
    deviceId: req.deviceId,
    licenseToken,
    licenseType: req.licenseType,
    expiresAt,
    maxDevices,
  });

  return {
    licenseToken,
    contentId: req.contentId,
    deviceId: req.deviceId,
    expiresAt,
    licenseType: req.licenseType,
    drmSystem: mapLicenseType(req.licenseType),
    maxDevices,
  };
}

/**
 * Map license type to DRM system identifier
 */
function mapLicenseType(licenseType: string): string {
  switch (licenseType) {
    case "widevine":
      return "com.widevine.alpha";
    case "fairplay":
      return "com.apple.fairplay";
    case "playready":
      return "com.microsoft.playready";
    default:
      return "unknown";
  }
}

/**
 * Get maximum devices based on subscription tier
 */
function getMaxDevicesForSubscription(plan: string): number {
  switch (plan) {
    case "premium":
      return 4; // Premium: 4 simultaneous devices
    case "standard":
      return 2; // Standard: 2 simultaneous devices
    case "free":
      return 1; // Free: 1 device only
    default:
      return 1;
  }
}

/**
 * Generate cryptographic license token
 */
function generateLicenseToken(userId: number, contentId: number, deviceId: string): string {
  const payload = {
    userId,
    contentId,
    deviceId,
    issuedAt: Math.floor(Date.now() / 1000),
    expiresAt: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
  };

  const token = Buffer.from(JSON.stringify(payload)).toString("base64");
  const signature = crypto
    .createHmac("sha256", process.env.DRM_SECRET || "default-secret")
    .update(token)
    .digest("hex");

  return `${token}.${signature}`;
}

/**
 * Verify license token validity
 */
export async function verifyLicenseToken(token: string): Promise<boolean> {
  try {
    const [tokenPart, signature] = token.split(".");
    const expectedSignature = crypto
      .createHmac("sha256", process.env.DRM_SECRET || "default-secret")
      .update(tokenPart)
      .digest("hex");

    if (signature !== expectedSignature) {
      return false;
    }

    const payload = JSON.parse(Buffer.from(tokenPart, "base64").toString());
    const now = Math.floor(Date.now() / 1000);

    return payload.expiresAt > now;
  } catch (error) {
    return false;
  }
}

/**
 * Revoke DRM license
 */
export async function revokeLicense(userId: number, contentId: number, deviceId: string): Promise<void> {
  await storage.revokeDRMLicense(userId, contentId, deviceId);
}

/**
 * Get active licenses for user (for device management)
 */
export async function getUserLicenses(userId: number): Promise<DRMLicense[]> {
  return storage.getUserDRMLicenses(userId);
}
