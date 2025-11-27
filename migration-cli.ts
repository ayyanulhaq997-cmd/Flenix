#!/usr/bin/env tsx
import * as readline from "readline";
import * as path from "path";
import { startWasabiMigration } from "./server/migration-wasabi";

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
  console.log("║  Fenix CDN Migration Tool - Wasabi Storage            ║");
  console.log("╚═══════════════════════════════════════════════════════╝\n");

  try {
    // Get Wasabi credentials
    console.log("📋 Wasabi Storage Configuration:");
    const wasabiAccessKeyId = await question("  Wasabi Access Key ID: ");
    const wasabiSecretAccessKey = await question("  Wasabi Secret Access Key: ");
    const wasabiBucketName = await question("  Wasabi Bucket Name: ");
    
    console.log("\n🌍 Available Wasabi Regions:");
    console.log("  - us-east-1 (US East)");
    console.log("  - us-west-1 (US West)");
    console.log("  - eu-central-1 (Europe)");
    console.log("  - ap-northeast-1 (Tokyo)");
    console.log("  - ap-southeast-1 (Singapore)");
    
    const wasabiRegion = await question("  Wasabi Region: ");

    // Get source directory
    console.log("\n📁 Source Configuration:");
    const sourceDirectory = await question(
      "  Path to video files directory: "
    );

    // Confirm destination
    console.log("\n🎯 Migration Destination Confirmation:");
    console.log(`  Provider: Wasabi Storage`);
    console.log(`  Bucket: ${wasabiBucketName}`);
    console.log(`  Region: ${wasabiRegion}`);
    console.log(`  CDN URL Pattern: https://${wasabiBucketName}.s3.${wasabiRegion}.wasabisys.com/...`);
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
    const report = await startWasabiMigration({
      wasabiAccessKeyId,
      wasabiSecretAccessKey,
      wasabiBucketName,
      wasabiRegion,
      sourceDirectory,
      dryRun: dryRun.toLowerCase() === "yes",
    });

    // If dry run was successful, ask to run actual migration
    if (dryRun.toLowerCase() === "yes") {
      const runActual = await question(
        "\n🚀 Dry run completed. Run actual migration? (yes/no): "
      );
      if (runActual.toLowerCase() === "yes") {
        await startWasabiMigration({
          wasabiAccessKeyId,
          wasabiSecretAccessKey,
          wasabiBucketName,
          wasabiRegion,
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
