#!/usr/bin/env npx tsx
/**
 * Bulk Registration CLI Tool
 * 
 * This tool reads a file manifest from Wasabi S3 and registers all files
 * in the database after an rclone bulk transfer.
 * 
 * Usage:
 *   npx tsx bulk-registration-cli.ts --bucket fenix-content --prefix uploads/ --dry-run
 *   npx tsx bulk-registration-cli.ts --bucket fenix-content --prefix uploads/
 */

import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { neon } from "@neondatabase/serverless";
import * as fs from "fs";
import * as path from "path";

// Parse command line arguments
const args = process.argv.slice(2);
const argMap: Record<string, string> = {};

for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith("--")) {
    const key = args[i].substring(2);
    argMap[key] = args[i + 1] || "true";
    i++;
  }
}

const BUCKET = argMap.bucket || process.env.WASABI_BUCKET || "fenix-content";
const PREFIX = argMap.prefix || "uploads/";
const REGION = argMap.region || process.env.WASABI_REGION || "us-east-1";
const DRY_RUN = argMap["dry-run"] === "true";
const MANIFEST_FILE = argMap.manifest || "./file-manifest.json";

// Initialize Wasabi S3 client
const s3Client = new S3Client({
  region: REGION,
  endpoint: `https://s3.${REGION}.wasabisys.com`,
  credentials: {
    accessKeyId: process.env.WASABI_ACCESS_KEY || "",
    secretAccessKey: process.env.WASABI_SECRET_KEY || "",
  },
});

// Initialize database
const sql = neon(process.env.DATABASE_URL || "");

interface FileMetadata {
  storageKey: string;
  originalName: string;
  fileSizeBytes: number;
  uploadedAt: string;
  status: "available" | "processing" | "deleted";
}

async function listFilesFromWasabi(): Promise<FileMetadata[]> {
  console.log(`\n📂 Scanning Wasabi bucket: ${BUCKET}/${PREFIX}`);
  
  const files: FileMetadata[] = [];
  let continuationToken: string | undefined;
  let totalSize = 0;
  let fileCount = 0;

  try {
    do {
      const listCommand = new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: PREFIX,
        ContinuationToken: continuationToken,
        MaxKeys: 1000,
      });

      const response = await s3Client.send(listCommand);

      if (response.Contents) {
        for (const object of response.Contents) {
          if (object.Key && object.Key !== PREFIX && !object.Key.endsWith("/")) {
            files.push({
              storageKey: object.Key,
              originalName: path.basename(object.Key),
              fileSizeBytes: object.Size || 0,
              uploadedAt: object.LastModified?.toISOString() || new Date().toISOString(),
              status: "available",
            });
            totalSize += object.Size || 0;
            fileCount++;
          }
        }
      }

      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    console.log(`✅ Found ${fileCount} files in Wasabi (${(totalSize / 1024 / 1024 / 1024).toFixed(2)} GB)`);
    return files;
  } catch (error: any) {
    console.error(`❌ Error listing Wasabi files: ${error.message}`);
    throw error;
  }
}

async function loadManifestFromFile(): Promise<FileMetadata[]> {
  try {
    if (!fs.existsSync(MANIFEST_FILE)) {
      console.log(`\n⚠️  Manifest file not found: ${MANIFEST_FILE}`);
      console.log("   Falling back to Wasabi scan...\n");
      return listFilesFromWasabi();
    }

    console.log(`\n📄 Loading manifest from: ${MANIFEST_FILE}`);
    const manifestData = fs.readFileSync(MANIFEST_FILE, "utf-8");
    const manifest = JSON.parse(manifestData);

    if (Array.isArray(manifest)) {
      console.log(`✅ Loaded ${manifest.length} files from manifest`);
      return manifest;
    } else {
      throw new Error("Manifest must be a JSON array");
    }
  } catch (error: any) {
    console.error(`❌ Error loading manifest: ${error.message}`);
    throw error;
  }
}

async function registerFilesInDatabase(files: FileMetadata[]): Promise<void> {
  console.log(`\n🗄️  Registering files in database...`);
  
  let registered = 0;
  let failed = 0;
  let skipped = 0;

  for (const file of files) {
    try {
      // Check if file already exists
      const existing = await sql(
        "SELECT id FROM files WHERE storage_key = $1",
        [file.storageKey]
      );

      if (existing && existing.length > 0) {
        skipped++;
        continue;
      }

      // Insert file metadata
      if (!DRY_RUN) {
        await sql(
          `INSERT INTO files 
          (storage_key, original_name, owner_user_id, mime_type, file_size_bytes, uploaded_at, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            file.storageKey,
            file.originalName,
            "migration",
            "video/mp4",
            file.fileSizeBytes,
            file.uploadedAt,
            "available",
          ]
        );
      }

      registered++;

      // Log progress every 100 files
      if (registered % 100 === 0) {
        console.log(`  ✓ Registered ${registered} files...`);
      }
    } catch (error: any) {
      console.error(`  ✗ Failed to register ${file.originalName}: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Registration Summary:`);
  console.log(`   ✅ Registered: ${registered}`);
  console.log(`   ⏭️  Skipped (already exist): ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   Total files: ${files.length}`);
}

async function main() {
  try {
    console.log("🚀 Fenix Bulk Registration CLI");
    console.log("================================");
    console.log(`Bucket: ${BUCKET}`);
    console.log(`Region: ${REGION}`);
    console.log(`Prefix: ${PREFIX}`);
    console.log(`Dry Run: ${DRY_RUN}`);

    // Load files from manifest or Wasabi
    const files = await loadManifestFromFile();

    if (files.length === 0) {
      console.log("\n⚠️  No files found. Exiting.");
      process.exit(0);
    }

    // Show preview of first 5 files
    console.log("\n📋 Preview (first 5 files):");
    files.slice(0, 5).forEach((file, i) => {
      console.log(`   ${i + 1}. ${file.originalName} (${(file.fileSizeBytes / 1024 / 1024).toFixed(2)} MB)`);
    });

    if (files.length > 5) {
      console.log(`   ... and ${files.length - 5} more files`);
    }

    // Register files
    if (DRY_RUN) {
      console.log("\n🔍 DRY RUN MODE - No files will be registered");
      console.log("   Run without --dry-run to perform actual registration");
    } else {
      await registerFilesInDatabase(files);
      console.log("\n✨ Bulk registration complete!");
    }
  } catch (error: any) {
    console.error(`\n❌ Fatal error: ${error.message}`);
    process.exit(1);
  }
}

main();
