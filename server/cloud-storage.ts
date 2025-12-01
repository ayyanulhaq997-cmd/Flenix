import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Cloud Storage Configuration
export interface CloudStorageConfig {
  provider: "s3" | "wasabi" | "gcs"; // Support AWS S3, Wasabi, Google Cloud Storage
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  region: string;
  endpoint?: string; // For Wasabi and custom S3 endpoints
  cdnUrl?: string; // CloudFront or Cloudflare CDN URL
}

// Initialize S3 client
let s3Client: S3Client | null = null;
let storageConfig: CloudStorageConfig | null = null;

export function initializeCloudStorage(config: CloudStorageConfig): S3Client {
  storageConfig = config;

  const clientConfig: any = {
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  };

  // Support custom endpoints (Wasabi, MinIO, etc.)
  if (config.endpoint) {
    clientConfig.endpoint = config.endpoint;
    clientConfig.forcePathStyle = true;
  }

  s3Client = new S3Client(clientConfig);
  console.log(`[cloud-storage] Initialized ${config.provider} storage`);
  return s3Client;
}

export function getS3Client(): S3Client {
  if (!s3Client) {
    throw new Error("Cloud storage not initialized. Call initializeCloudStorage first.");
  }
  return s3Client;
}

export function getStorageConfig(): CloudStorageConfig {
  if (!storageConfig) {
    throw new Error("Cloud storage not initialized.");
  }
  return storageConfig;
}

// Upload video to cloud storage
export async function uploadVideo(
  filename: string,
  buffer: Buffer,
  contentType: string = "video/mp4",
  metadata?: Record<string, string>
): Promise<string> {
  const client = getS3Client();
  const config = getStorageConfig();

  const key = `videos/${Date.now()}-${filename}`;

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        Metadata: metadata,
        // For CloudFront: add Cache-Control header
        CacheControl: "max-age=31536000", // 1 year for immutable content
      })
    );

    console.log(`[cloud-storage] Uploaded ${filename} to ${key}`);
    return key;
  } catch (error) {
    console.error("[cloud-storage] Upload failed:", error);
    throw error;
  }
}

// Generate presigned URL for download (used for streaming)
export async function generatePresignedUrl(
  key: string,
  expirationSeconds: number = 3600 // 1 hour default
): Promise<string> {
  const client = getS3Client();
  const config = getStorageConfig();

  try {
    const url = await getSignedUrl(
      client,
      new GetObjectCommand({
        Bucket: config.bucket,
        Key: key,
      }),
      { expiresIn: expirationSeconds }
    );

    return url;
  } catch (error) {
    console.error("[cloud-storage] Failed to generate presigned URL:", error);
    throw error;
  }
}

// Generate CDN URL (CloudFront or Cloudflare)
export function generateCDNUrl(key: string): string {
  const config = getStorageConfig();

  if (config.cdnUrl) {
    // Use CloudFront or Cloudflare CDN
    return `${config.cdnUrl}/${key}`;
  }

  // Fallback to direct S3 URL
  const region = config.region;
  const bucket = config.bucket;
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

// List objects in bucket (for admin dashboard)
export async function listObjects(prefix: string = "", maxKeys: number = 100) {
  const client = getS3Client();
  const config = getStorageConfig();

  try {
    const result = await client.send(
      new ListObjectsV2Command({
        Bucket: config.bucket,
        Prefix: prefix,
        MaxKeys: maxKeys,
      })
    );

    return (result.Contents || []).map((obj) => ({
      key: obj.Key,
      size: obj.Size,
      lastModified: obj.LastModified,
      storageClass: obj.StorageClass,
    }));
  } catch (error) {
    console.error("[cloud-storage] List failed:", error);
    throw error;
  }
}

// Health check for cloud storage connectivity
export async function healthCheck(): Promise<boolean> {
  try {
    const client = getS3Client();
    const config = getStorageConfig();

    await client.send(
      new ListObjectsV2Command({
        Bucket: config.bucket,
        MaxKeys: 1,
      })
    );

    return true;
  } catch (error) {
    console.error("[cloud-storage] Health check failed:", error);
    return false;
  }
}
