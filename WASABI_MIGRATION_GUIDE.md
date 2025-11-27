# Fenix CDN Migration Guide - Wasabi Storage

## Overview

This guide walks you through migrating your video content from local storage to **Wasabi Object Storage** - a cost-effective S3-compatible storage solution that's significantly cheaper than Cloudflare R2.

### Cost Comparison
- **Wasabi**: $5.99/TB/month (minimum $5.99/month)
- **Cloudflare R2**: $0.015/GB for egress + expensive storage
- **Savings**: 60-80% cheaper for most video streaming workloads

## Prerequisites

1. **Wasabi Account**: Sign up at https://wasabi.com
2. **Wasabi API Keys**: 
   - Access Key ID
   - Secret Access Key
3. **Wasabi Bucket**: Pre-create a bucket in your desired region
4. **Video Files**: Organized in a local directory
5. **Database**: Files must have matching entries in Fenix database

## Setup Steps

### 1. Create Wasabi Account & Bucket

1. Go to https://wasabi.com and sign up
2. Create a new bucket in your preferred region:
   - US East (us-east-1) - Default, best latency for North America
   - US West (us-west-1) - California region
   - EU Central (eu-central-1) - Europe
   - AP Northeast (ap-northeast-1) - Tokyo
   - AP Southeast (ap-southeast-1) - Singapore

### 2. Generate API Credentials

1. Log in to Wasabi Console
2. Go to **Settings** → **Access Keys**
3. Click **Create New Access Key**
4. Download and save your credentials safely:
   - Access Key ID
   - Secret Access Key

### 3. Prepare Video Files

Your video files should be organized in a directory structure. The migration script will:
- Scan recursively for video files (.mp4, .mkv, .mov, .avi, .webm)
- Match filenames to database entries
- Upload to Wasabi with new CDN URLs

Example structure:
```
/videos
  ├── movies/
  │   ├── inception_v2.mp4
  │   ├── interstellar.mkv
  │   └── dark_knight.mp4
  └── series/
      ├── breaking_bad_s01e01.mp4
      └── house_s02e03.mp4
```

### 4. Ensure Database Has File References

Before migration, your database movies and episodes **must have** matching `fileName` entries:

**For Movies:**
```sql
UPDATE movies SET file_name = 'inception_v2.mp4' WHERE id = 1;
```

**For Episodes:**
```sql
UPDATE episodes SET file_name = 'breaking_bad_s01e01.mp4' WHERE id = 1;
```

## Running the Migration

### Command
```bash
npm run tsx migration-cli.ts
```

### Interactive Prompts

The CLI will ask you for:

1. **Wasabi Access Key ID**
   - Your AWS-style access key from Wasabi console

2. **Wasabi Secret Access Key**
   - Your secret key (keep this private!)

3. **Wasabi Bucket Name**
   - Name of your pre-created bucket

4. **Wasabi Region**
   - Choose from: us-east-1, us-west-1, eu-central-1, ap-northeast-1, ap-southeast-1

5. **Path to Video Files Directory**
   - Full or relative path to your video files
   - Example: `/data/videos` or `./videos`

### Example Session
```
╔═══════════════════════════════════════════════════════╗
║  Fenix CDN Migration Tool - Wasabi Storage            ║
╚═══════════════════════════════════════════════════════╝

📋 Wasabi Storage Configuration:
  Wasabi Access Key ID: WASABI_ACCESS_KEY_HERE
  Wasabi Secret Access Key: WASABI_SECRET_KEY_HERE
  Wasabi Bucket Name: fenix-videos

🌍 Available Wasabi Regions:
  - us-east-1 (US East)
  - us-west-1 (US West)
  - eu-central-1 (Europe)
  - ap-northeast-1 (Tokyo)
  - ap-southeast-1 (Singapore)

  Wasabi Region: us-east-1

📁 Source Configuration:
  Path to video files directory: /data/videos

🎯 Migration Destination Confirmation:
  Provider: Wasabi Storage
  Bucket: fenix-videos
  Region: us-east-1
  CDN URL Pattern: https://fenix-videos.s3.us-east-1.wasabisys.com/...
  Source: /data/videos

✅ Is this configuration correct? (yes/no): yes

🏜️ Run in DRY RUN mode first? (yes/no): yes
```

## Dry Run Mode

**Always run in dry-run mode first!** This will:
- Scan all video files
- Show what would be uploaded
- Generate a preview report
- NOT actually upload anything
- NOT update the database

Output example:
```
🚀 Starting Wasabi Storage migration...
📁 Source directory: /data/videos
🪣 Wasabi Bucket: fenix-videos
🌍 Wasabi Region: us-east-1
🏜️ Dry run mode: true

📊 Found 47 video files to migrate

[1/47] Processing: inception_v2.mp4
  📤 Uploading to: https://fenix-videos.s3.us-east-1.wasabisys.com/fenix/movie/1_inception_v2_1732123456789.mp4
  [DRY RUN] Would upload inception_v2.mp4 to ...
  ✅ Successfully processed: inception_v2.mp4

[2/47] Processing: breaking_bad_s01e01.mp4
  ...

✅ Migration completed!
===============================================================
📋 MIGRATION SUMMARY
===============================================================
Total Files: 47
✅ Successful: 47 (100%)
❌ Failed: 0 (0%)
📊 Total Data: 250.50 GB
⏱️ Duration: 12345ms
===============================================================
```

## Actual Migration

After confirming the dry-run preview:

```
🚀 Dry run completed. Run actual migration? (yes/no): yes
```

The script will:
1. Upload all video files to Wasabi
2. Update the Fenix database with new CDN URLs
3. Generate detailed migration reports

This process **will** update your database with the new streaming URLs.

## Migration Reports

After each migration, three files are generated in `migration-reports/`:

### 1. JSON Report: `migration-report-[timestamp].json`
Complete migration metadata:
```json
{
  "startTime": "2024-11-27T15:30:00.000Z",
  "endTime": "2024-11-27T15:45:30.000Z",
  "totalFiles": 47,
  "successfulUploads": 47,
  "failedUploads": 0,
  "totalDataUploaded": 268435456000,
  "mappings": [
    {
      "originalFileName": "inception_v2.mp4",
      "originalPath": "/data/videos/movies/inception_v2.mp4",
      "contentType": "movie",
      "contentId": 1,
      "contentTitle": "Inception",
      "cdnUrl": "https://fenix-videos.s3.us-east-1.wasabisys.com/fenix/movie/1_inception_v2_1732123456789.mp4",
      "fileSize": 2147483648,
      "uploadedAt": "2024-11-27T15:32:15.000Z",
      "status": "success"
    }
  ],
  "failedFiles": []
}
```

### 2. CSV Mapping: `migration-mapping-[timestamp].csv`
Easy-to-import file mapping:
```csv
Original Filename,Content Type,Content ID,Content Title,CDN URL,File Size (bytes),Upload Status,Error Message
"inception_v2.mp4","movie","1","Inception","https://fenix-videos.s3.us-east-1.wasabisys.com/fenix/movie/1_inception_v2_1732123456789.mp4","2147483648","success",""
"breaking_bad_s01e01.mp4","episode","5","Pilot","https://fenix-videos.s3.us-east-1.wasabisys.com/fenix/episode/5_breaking_bad_s01e01_1732123456789.mp4","1073741824","success",""
```

### 3. Console Output
Real-time progress logs and summary statistics

## Troubleshooting

### Issue: "No matching content found in database"
**Solution**: Add the filename to your database before running migration.

```sql
-- For movies
UPDATE movies SET file_name = 'inception_v2.mp4' WHERE id = 1;

-- For episodes
UPDATE episodes SET file_name = 'breaking_bad_s01e01.mp4' WHERE id = 5;
```

### Issue: "Wasabi endpoint unreachable"
**Solution**: Verify your credentials and region are correct:
- Access Key ID format: 12+ characters
- Secret Key: Long alphanumeric string
- Region must match bucket region

### Issue: "Permission denied uploading to bucket"
**Solution**: 
1. Check your API key has permission to write to bucket
2. Verify bucket name is correct
3. Create new API keys if necessary

### Issue: "Files stuck at processing"
**Solution**: Check your internet connection. Large files take time to upload.

## After Migration

### 1. Verify Database Updates
```sql
-- Check that video_url fields were updated
SELECT id, title, video_url FROM movies LIMIT 5;
```

You should see URLs like:
```
https://fenix-videos.s3.us-east-1.wasabisys.com/fenix/movie/1_inception_v2_1732123456789.mp4
```

### 2. Test Streaming
1. Log in to Fenix admin dashboard
2. Go to Movies or Series
3. Click on a migrated video
4. Verify the streaming URL loads correctly

### 3. Archive Local Files (Optional)
Once you've confirmed everything works:
```bash
# Archive local video files
tar -czf local_videos_backup.tar.gz /data/videos/

# Or move to archive storage
mv /data/videos/* /archive/videos/
```

### 4. Update Streaming Service
The mobile apps fetch streaming URLs from your Fenix API, so they'll automatically get the new Wasabi URLs once the database is updated.

## Performance Tips

### Upload Speed
- Upload from a high-bandwidth connection
- Consider running on a server near your Wasabi region
- Large files (>2GB) take proportionally longer

### Migration Window
- Schedule migrations during off-peak hours
- A 1TB transfer typically takes 2-4 hours
- Database updates happen immediately after upload

### Wasabi Optimization
- Use the region closest to your content
- Enable caching if you offer multiple resolutions
- Monitor bandwidth usage in Wasabi console

## Security Best Practices

### Credentials
1. **Never commit** Access Keys to git
2. **Store securely** in password manager
3. **Rotate keys** after migration
4. **Use IAM policies** to limit bucket access

### Bucket Settings
1. Enable **versioning** for recovery
2. Set **lifecycle policies** to delete old versions after 30 days
3. Enable **access logging** for audit trails
4. Restrict access to **private ACL** only

## Wasabi Console Features

Once files are uploaded, you can:

1. **Monitor Bandwidth**: Real-time upload/download stats
2. **Set Lifecycle Rules**: Auto-delete old versions
3. **View Access Logs**: Who accessed what and when
4. **Configure CORS**: For cross-origin requests
5. **Set Custom Metadata**: Track file information

## Support

For Wasabi support: https://support.wasabi.com
For Fenix issues: Check migration-reports/ for error details

## Cost Tracking

### Storage Calculation
Wasabi charges per TB per month:
- 250 GB = $5.99 (minimum)
- 1 TB = $5.99
- 5 TB = $29.95
- 100 TB = $599

Check your usage in Wasabi Console → Billing section.

---

**Next Steps**: After successful migration, consider:
- Enabling CDN acceleration with Bunny or Cloudflare (caching only, no storage costs)
- Setting up automated backups
- Monitoring streaming quality metrics
