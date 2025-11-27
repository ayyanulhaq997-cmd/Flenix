#!/usr/bin/env tsx
import * as readline from "readline";
import * as path from "path";
import { startR2Migration } from "./server/migration-r2";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log("╔═══════════════════════════════════════════════════════╗");
  console.log("║  Fenix CDN Migration Tool - Cloudflare R2             ║");
  console.log("╚═══════════════════════════════════════════════════════╝\n");

  try {
    // Get Cloudflare R2 credentials
    console.log("📋 Cloudflare R2 Configuration:");
    const r2AccountId = await question("  R2 Account ID: ");
    const r2AccessKeyId = await question("  R2 Access Key ID: ");
    const r2SecretAccessKey = await question("  R2 Secret Access Key: ");
    const r2BucketName = await question("  R2 Bucket Name: ");
    const r2Endpoint = await question(
      "  R2 Endpoint (or press Enter for default): "
    );

    // Get source directory
    console.log("\n📁 Source Configuration:");
    const sourceDirectory = await question(
      "  Path to video files directory: "
    );

    // Confirm destination
    console.log("\n🎯 Migration Destination Confirmation:");
    console.log(`  Bucket: ${r2BucketName}`);
    console.log(
      `  Endpoint: ${r2Endpoint || "https://r2.cloudflarestorage.com"}`
    );
    console.log(`  Source: ${sourceDirectory}`);

    const confirmed = await question(
      "\n✅ Is this configuration correct? (yes/no): "
    );
    if (confirmed.toLowerCase() !== "yes") {
      console.log("❌ Migration cancelled.");
      rl.close();
      return;
    }

    // Run in dry-run mode first
    const dryRun = await question(
      "\n🏜️ Run in DRY RUN mode first? (yes/no): "
    );

    // Start migration
    const report = await startR2Migration({
      r2AccountId,
      r2AccessKeyId,
      r2SecretAccessKey,
      r2BucketName,
      r2Endpoint: r2Endpoint || "https://r2.cloudflarestorage.com",
      sourceDirectory,
      dryRun: dryRun.toLowerCase() === "yes",
    });

    // If dry run was successful, ask to run actual migration
    if (dryRun.toLowerCase() === "yes") {
      const runActual = await question(
        "\n🚀 Dry run completed. Run actual migration? (yes/no): "
      );
      if (runActual.toLowerCase() === "yes") {
        await startR2Migration({
          r2AccountId,
          r2AccessKeyId,
          r2SecretAccessKey,
          r2BucketName,
          r2Endpoint: r2Endpoint || "https://r2.cloudflarestorage.com",
          sourceDirectory,
          dryRun: false,
        });
      }
    }

    console.log(
      "\n✅ Migration process completed! Check migration-reports/ for detailed logs."
    );
  } catch (error: any) {
    console.error("❌ Error during migration:", error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main().catch(console.error);
