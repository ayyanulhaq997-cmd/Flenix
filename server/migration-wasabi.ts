import * as fs from "fs";
import * as path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from "./db";
import { movies, episodes } from "@shared/schema";
import { eq } from "drizzle-orm";

interface MigrationConfig {
  wasabiAccessKeyId: string;
  wasabiSecretAccessKey: string;
  wasabiBucketName: string;
  wasabiRegion: string;
  sourceDirectory: string;
  dryRun: boolean;
}

interface MigrationMapping {
  originalFileName: string;
  originalPath: string;
  contentType: "movie" | "episode";
  contentId: number;
  contentTitle: string;
  cdnUrl: string;
  fileSize: number;
  uploadedAt: string;
  status: "success" | "failed";
  errorMessage?: string;
}

interface MigrationReport {
  startTime: string;
  endTime: string;
  totalFiles: number;
  successfulUploads: number;
  failedUploads: number;
  totalDataUploaded: number;
  mappings: MigrationMapping[];
  failedFiles: {
    fileName: string;
    reason: string;
  }[];
}

class WasabiMigrator {
  private config: MigrationConfig;
  private s3Client: S3Client;
  private mappings: MigrationMapping[] = [];
  private failedFiles: { fileName: string; reason: string }[] = [];

  constructor(config: MigrationConfig) {
    this.config = config;
    // Wasabi S3-compatible endpoint for the specified region
    const wasabiEndpoint = `https://s3.${config.wasabiRegion}.wasabisys.com`;
    
    this.s3Client = new S3Client({
      region: config.wasabiRegion,
      credentials: {
        accessKeyId: config.wasabiAccessKeyId,
        secretAccessKey: config.wasabiSecretAccessKey,
      },
      endpoint: wasabiEndpoint,
    });
  }

  async migrate(): Promise<MigrationReport> {
    const startTime = new Date();
    console.log("🚀 Starting Wasabi Storage migration...");
    console.log(`📁 Source directory: ${this.config.sourceDirectory}`);
    console.log(`🪣 Wasabi Bucket: ${this.config.wasabiBucketName}`);
    console.log(`🌍 Wasabi Region: ${this.config.wasabiRegion}`);
    console.log(`🏜️ Dry run mode: ${this.config.dryRun}`);

    try {
      // Get all video files from source directory
      const videoFiles = await this.getVideoFiles();
      console.log(`📊 Found ${videoFiles.length} video files to migrate`);

      // Process each file
      for (let i = 0; i < videoFiles.length; i++) {
        const file = videoFiles[i];
        console.log(
          `\n[${i + 1}/${videoFiles.length}] Processing: ${path.basename(file.path)}`
        );
        await this.processFile(file);
      }

      // Update database with new CDN URLs (if not dry run)
      if (!this.config.dryRun && this.mappings.length > 0) {
        console.log("\n💾 Updating database with new CDN URLs...");
        await this.updateDatabase();
      }

      const endTime = new Date();
      const totalDataUploaded = this.mappings.reduce(
        (sum, m) => sum + m.fileSize,
        0
      );

      const report: MigrationReport = {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        totalFiles: videoFiles.length,
        successfulUploads: this.mappings.filter(m => m.status === "success").length,
        failedUploads: this.mappings.filter(m => m.status === "failed").length,
        totalDataUploaded,
        mappings: this.mappings,
        failedFiles: this.failedFiles,
      };

      await this.generateReport(report);
      console.log("\n✅ Migration completed!");
      this.printSummary(report);

      return report;
    } catch (error: any) {
      console.error("❌ Migration failed:", error.message);
      throw error;
    }
  }

  private async getVideoFiles(): Promise<
    { path: string; fileName: string }[]
  > {
    if (!fs.existsSync(this.config.sourceDirectory)) {
      throw new Error(
        `Source directory not found: ${this.config.sourceDirectory}`
      );
    }

    const videoExtensions = [".mp4", ".mkv", ".mov", ".avi", ".webm"];
    const files: { path: string; fileName: string }[] = [];

    const walkDir = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walkDir(fullPath);
        } else if (
          videoExtensions.some(ext => entry.name.toLowerCase().endsWith(ext))
        ) {
          files.push({ path: fullPath, fileName: entry.name });
        }
      }
    };

    walkDir(this.config.sourceDirectory);
    return files;
  }

  private async processFile(file: { path: string; fileName: string }) {
    try {
      // Get file stats
      const stats = fs.statSync(file.path);
      const fileSize = stats.size;

      // Check if file exists in database (by filename pattern)
      const content = await this.findContentByFileName(file.fileName);

      if (!content) {
        const error = `No matching content found in database for file: ${file.fileName}`;
        console.warn(`⚠️ ${error}`);
        this.failedFiles.push({ fileName: file.fileName, reason: error });
        this.mappings.push({
          originalFileName: file.fileName,
          originalPath: file.path,
          contentType: "movie",
          contentId: 0,
          contentTitle: "Unknown",
          cdnUrl: "",
          fileSize,
          uploadedAt: new Date().toISOString(),
          status: "failed",
          errorMessage: error,
        });
        return;
      }

      // Generate CDN URL path
      const cdnPath = this.generateCdnPath(content.type, content.id, file.fileName);
      const cdnUrl = `https://${this.config.wasabiBucketName}.s3.${this.config.wasabiRegion}.wasabisys.com/${cdnPath}`;

      console.log(`📤 Uploading to: ${cdnUrl}`);

      if (!this.config.dryRun) {
        // Upload to Wasabi
        await this.uploadToWasabi(file.path, cdnPath, file.fileName);
      } else {
        console.log(`[DRY RUN] Would upload ${file.fileName} to ${cdnUrl}`);
      }

      // Record mapping
      this.mappings.push({
        originalFileName: file.fileName,
        originalPath: file.path,
        contentType: content.type as "movie" | "episode",
        contentId: content.id,
        contentTitle: content.title,
        cdnUrl,
        fileSize,
        uploadedAt: new Date().toISOString(),
        status: "success",
      });

      console.log(`✅ Successfully processed: ${file.fileName}`);
    } catch (error: any) {
      const errorMessage = error.message || String(error);
      console.error(`❌ Failed to process ${file.fileName}: ${errorMessage}`);

      this.mappings.push({
        originalFileName: file.fileName,
        originalPath: file.path,
        contentType: "movie",
        contentId: 0,
        contentTitle: "Unknown",
        cdnUrl: "",
        fileSize: 0,
        uploadedAt: new Date().toISOString(),
        status: "failed",
        errorMessage,
      });

      this.failedFiles.push({
        fileName: file.fileName,
        reason: errorMessage,
      });
    }
  }

  private async uploadToWasabi(
    localPath: string,
    s3Key: string,
    fileName: string
  ): Promise<void> {
    const fileContent = fs.readFileSync(localPath);
    const contentType = this.getContentType(fileName);

    const command = new PutObjectCommand({
      Bucket: this.config.wasabiBucketName,
      Key: s3Key,
      Body: fileContent,
      ContentType: contentType,
      Metadata: {
        "original-filename": fileName,
        "upload-time": new Date().toISOString(),
      },
    });

    await this.s3Client.send(command);
  }

  private generateCdnPath(
    contentType: string,
    contentId: number,
    fileName: string
  ): string {
    const fileExt = path.extname(fileName);
    const timestamp = Date.now();
    return `fenix/${contentType}/${contentId}_${timestamp}${fileExt}`;
  }

  private async findContentByFileName(
    fileName: string
  ): Promise<
    | { type: "movie"; id: number; title: string }
    | { type: "episode"; id: number; title: string }
    | null
  > {
    // Try to find in movies first
    const movieMatches = await db
      .select()
      .from(movies)
      .where(eq(movies.fileName, fileName));

    if (movieMatches.length > 0) {
      const movie = movieMatches[0];
      return {
        type: "movie",
        id: movie.id,
        title: movie.title,
      };
    }

    // Try to find in episodes
    const episodeMatches = await db
      .select()
      .from(episodes)
      .where(eq(episodes.fileName, fileName));

    if (episodeMatches.length > 0) {
      const episode = episodeMatches[0];
      return {
        type: "episode",
        id: episode.id,
        title: episode.title,
      };
    }

    return null;
  }

  private async updateDatabase(): Promise<void> {
    for (const mapping of this.mappings) {
      if (mapping.status !== "success") continue;

      try {
        if (mapping.contentType === "movie") {
          await db
            .update(movies)
            .set({
              videoUrl: mapping.cdnUrl,
              updatedAt: new Date(),
            })
            .where(eq(movies.id, mapping.contentId));

          console.log(
            `  ✅ Updated movie ${mapping.contentId} with CDN URL`
          );
        } else if (mapping.contentType === "episode") {
          await db
            .update(episodes)
            .set({
              videoUrl: mapping.cdnUrl,
            })
            .where(eq(episodes.id, mapping.contentId));

          console.log(
            `  ✅ Updated episode ${mapping.contentId} with CDN URL`
          );
        }
      } catch (error: any) {
        console.error(
          `  ❌ Failed to update ${mapping.contentType} ${mapping.contentId}: ${error.message}`
        );
      }
    }
  }

  private getContentType(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      ".mp4": "video/mp4",
      ".mkv": "video/x-matroska",
      ".mov": "video/quicktime",
      ".avi": "video/x-msvideo",
      ".webm": "video/webm",
    };
    return mimeTypes[ext] || "video/mp4";
  }

  private async generateReport(report: MigrationReport): Promise<void> {
    const reportDir = "migration-reports";
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const reportPath = path.join(
      reportDir,
      `migration-report-${timestamp}.json`
    );
    const mappingPath = path.join(
      reportDir,
      `migration-mapping-${timestamp}.csv`
    );

    // Write JSON report
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Report saved to: ${reportPath}`);

    // Write CSV mapping
    let csvContent =
      "Original Filename,Content Type,Content ID,Content Title,CDN URL,File Size (bytes),Upload Status,Error Message\n";
    for (const mapping of report.mappings) {
      const errorMsg = mapping.errorMessage ? `"${mapping.errorMessage}"` : "";
      csvContent += `"${mapping.originalFileName}","${mapping.contentType}","${mapping.contentId}","${mapping.contentTitle}","${mapping.cdnUrl}","${mapping.fileSize}","${mapping.status}",${errorMsg}\n`;
    }
    fs.writeFileSync(mappingPath, csvContent);
    console.log(`📊 Mapping saved to: ${mappingPath}`);
  }

  private printSummary(report: MigrationReport): void {
    console.log("\n" + "=".repeat(60));
    console.log("📋 MIGRATION SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total Files: ${report.totalFiles}`);
    console.log(
      `✅ Successful: ${report.successfulUploads} (${Math.round((report.successfulUploads / report.totalFiles) * 100)}%)`
    );
    console.log(
      `❌ Failed: ${report.failedUploads} (${Math.round((report.failedUploads / report.totalFiles) * 100)}%)`
    );
    console.log(
      `📊 Total Data: ${(report.totalDataUploaded / (1024 * 1024 * 1024)).toFixed(2)} GB`
    );
    console.log(
      `⏱️ Duration: ${new Date(report.endTime).getTime() - new Date(report.startTime).getTime()}ms`
    );
    console.log("=".repeat(60));

    if (report.failedFiles.length > 0) {
      console.log("\n⚠️ FAILED FILES:");
      for (const failed of report.failedFiles) {
        console.log(`  - ${failed.fileName}: ${failed.reason}`);
      }
    }
  }
}

export async function startWasabiMigration(config: MigrationConfig) {
  const migrator = new WasabiMigrator(config);
  return migrator.migrate();
}
