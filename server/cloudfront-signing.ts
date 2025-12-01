import crypto from "crypto";

/**
 * CloudFront Signed URL Signing
 * Implements AWS CloudFront URL signing using RSA 2048 private key
 * Ensures videos are only accessible through signed URLs, not directly from S3
 */

export interface SignedUrlOptions {
  privateKey: string; // RSA private key (PEM format)
  keyPairId: string; // CloudFront key pair ID
  domainName: string; // CloudFront domain (e.g., d123456.cloudfront.net)
  expireTime?: number; // URL expiry time in seconds (default: 300 for security)
}

export interface SignedUrlResult {
  url: string;
  expires: number;
  signature: string;
}

/**
 * Generate a CloudFront signed URL for secure video delivery
 * Videos in S3 are private - only accessible through these signed URLs
 */
export function generateSignedUrl(
  resourcePath: string,
  options: SignedUrlOptions
): SignedUrlResult {
  // Default to 300 seconds (5 minutes) for maximum security
  // Videos expire quickly, preventing unauthorized sharing/redistribution
  const expireTime = Math.floor(Date.now() / 1000) + (options.expireTime || 300);

  // Build the policy document
  const policy = {
    Statement: [
      {
        Resource: `https://${options.domainName}${resourcePath}`,
        Condition: {
          DateLessThan: {
            "AWS:EpochTime": expireTime,
          },
        },
      },
    ],
  };

  const policyString = JSON.stringify(policy);
  const encodedPolicy = Buffer.from(policyString).toString("base64");

  // Sign the policy with the private key
  const signature = crypto
    .createSign("RSA-SHA1")
    .update(encodedPolicy)
    .sign(options.privateKey, "base64");

  // Convert URL-unsafe characters to URL-safe equivalents
  const encodedSignature = signature
    .replace(/\+/g, "-")
    .replace(/=/g, "_")
    .replace(/\//g, "~");

  const encodedPolicyUrl = encodedPolicy
    .replace(/\+/g, "-")
    .replace(/=/g, "_")
    .replace(/\//g, "~");

  // Build the signed URL
  const signedUrl = `https://${options.domainName}${resourcePath}?Policy=${encodedPolicyUrl}&Signature=${encodedSignature}&Key-Pair-Id=${options.keyPairId}`;

  return {
    url: signedUrl,
    expires: expireTime,
    signature: encodedSignature,
  };
}

/**
 * Generate a signed URL for HLS playlist
 */
export function generateSignedHLSUrl(
  movieId: number,
  options: SignedUrlOptions
): SignedUrlResult {
  return generateSignedUrl(`/videos/${movieId}/playlist.m3u8`, options);
}

/**
 * Generate a signed URL for DASH manifest
 */
export function generateSignedDASHUrl(
  movieId: number,
  options: SignedUrlOptions
): SignedUrlResult {
  return generateSignedUrl(`/videos/${movieId}/manifest.mpd`, options);
}

/**
 * Generate signed URLs for video segments (for direct segment requests)
 */
export function generateSignedSegmentUrl(
  segmentPath: string,
  options: SignedUrlOptions
): SignedUrlResult {
  return generateSignedUrl(segmentPath, options);
}

/**
 * Validate CloudFront signed URL (for debugging/logging)
 * In production, CloudFront itself validates signatures
 */
export function validateSignedUrl(url: string, publicKey: string): boolean {
  try {
    const urlObj = new URL(url);
    const policy = urlObj.searchParams.get("Policy");
    const signature = urlObj.searchParams.get("Signature");

    if (!policy || !signature) {
      return false;
    }

    // Decode URL-safe base64
    const decodedPolicy = Buffer.from(
      policy.replace(/-/g, "+").replace(/_/g, "=").replace(/~/g, "/"),
      "base64"
    ).toString();

    // Decode URL-safe signature
    const decodedSignature = Buffer.from(
      signature.replace(/-/g, "+").replace(/_/g, "=").replace(/~/g, "/"),
      "base64"
    );

    // Verify signature with public key
    const verifier = crypto.createVerify("RSA-SHA1");
    verifier.update(policy);

    return verifier.verify(publicKey, decodedSignature);
  } catch (error) {
    console.error("[cloudfront-signing] Validation error:", error);
    return false;
  }
}

/**
 * Parse CloudFront signed URL to extract policy expiry
 */
export function getSignedUrlExpiry(url: string): number | null {
  try {
    const urlObj = new URL(url);
    const policyParam = urlObj.searchParams.get("Policy");

    if (!policyParam) {
      return null;
    }

    // Decode the policy
    const decodedPolicy = Buffer.from(
      policyParam.replace(/-/g, "+").replace(/_/g, "=").replace(/~/g, "/"),
      "base64"
    ).toString();

    const policy = JSON.parse(decodedPolicy);
    const expireTime = policy?.Statement?.[0]?.Condition?.DateLessThan?.["AWS:EpochTime"];

    return expireTime || null;
  } catch (error) {
    return null;
  }
}

/**
 * Check if a signed URL is still valid
 */
export function isSignedUrlValid(url: string): boolean {
  const expiry = getSignedUrlExpiry(url);
  if (!expiry) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  return now < expiry;
}
