# 70TB Content Migration Guide

## Overview
This guide provides multiple strategies to migrate 70TB+ of video content to cloud storage for the Fenix streaming platform.

## Option 1: AWS Snowball (Recommended for 70TB+)

### Why Snowball?
- Designed for massive data transfer (100TB+ capacity)
- No bandwidth charges
- Physically shipped to your location
- Fastest method for large datasets

### Steps:
1. **Request AWS Snowball Device**
   - Go to AWS Management Console → Snowball
   - Request device (Snowball Edge preferred for 100TB capacity)
   - AWS ships device to your location (typically 5-7 business days)

2. **Prepare Data**
   ```bash
   # Install AWS Snowball client
   # Copy files to Snowball using provided software
   # Verify integrity with checksums
   ```

3. **Ship Back to AWS**
   - AWS ships prepaid return label
   - Device automatically imports data to S3
   - AWS notifies when import complete

4. **Timeline**: ~3-4 weeks total
5. **Cost**: ~$300-500 for device rental (no data transfer charges)

---

## Option 2: AWS DataSync (For Existing Servers)

### Why DataSync?
- Direct connection from your server to AWS S3
- Automatic data verification
- Resume capability
- Good for already-hosted content

### Steps:
1. **Deploy DataSync Agent**
   ```bash
   # Install on server with content
   # Available for: VMware, Hyper-V, EC2
   ```

2. **Configure Transfer Task**
   - Source: Local storage/NAS
   - Destination: S3 bucket
   - Bandwidth limit (e.g., 100 Mbps to avoid disruption)

3. **Monitor Progress**
   - CloudWatch metrics show transfer speed
   - Verify data integrity post-transfer

4. **Timeline**: Depends on bandwidth
   - At 100 Mbps: ~70,000 seconds = ~19 hours
   - At 1 Gbps: ~2 hours (if available)

5. **Cost**: ~$0.40/GB transferred (~$28K for 70TB)

---

## Option 3: Google Cloud Transfer Appliance (Alternative)

### Similar to Snowball
- 480TB or 100TB capacity options
- For very large one-time transfers
- Shipped to you, back to Google

### Timeline: ~4 weeks
### Cost: $50,000 (480TB unit)

---

## Option 4: Aspera High-Speed Transfer (If Network Available)

### Why Aspera?
- UDP-based protocol faster than TCP
- Can achieve 1+ Gbps over WAN
- Good if you have premium network

### Steps:
1. Install Aspera Connect software
2. Transfer via high-bandwidth pipe
3. Works best with dedicated connection

### Timeline: 
- At 1 Gbps: ~2 hours
- At 10 Gbps: ~12 minutes

### Cost: Aspera license + network costs

---

## Option 5: rclone (Budget Option)

### Why rclone?
- Free and open-source
- Supports S3, Wasabi, GCS
- Resume capability
- Good for smaller batches

### Steps:
```bash
# Install rclone
curl https://rclone.org/install.sh | sudo bash

# Configure S3 credentials
rclone config

# Start transfer (with bandwidth limit)
rclone copy /local/video/path s3://bucket-name \
  --bwlimit 100M \
  --checkers 8 \
  --transfers 4 \
  --verbose
```

### Timeline: 
- At 100 Mbps: ~19 hours
- At 1 Gbps: ~2 hours

### Cost: $0 (only network costs)

---

## Recommended Strategy for 70TB

### Phase 1: Initial Bulk Transfer (Weeks 1-4)
Use **AWS Snowball**:
- Most cost-effective for 70TB
- Handles all data without bandwidth constraints
- No need for local infrastructure upgrades
- Parallel uploads to S3

### Phase 2: Incremental Updates (Ongoing)
Use **rclone** or **DataSync**:
- New content added continuously
- Smaller batches (e.g., 10-50GB weekly)
- Lower cost than Snowball for ongoing transfers

---

## Data Organization in S3

```
s3://fenix-streaming-bucket/
├── videos/
│   ├── movies/
│   │   ├── movie-1/
│   │   │   ├── original.mp4         (original file)
│   │   │   ├── hd4k/               (4K transcode)
│   │   │   ├── hd1080/             (1080p transcode)
│   │   │   ├── hd720/              (720p transcode)
│   │   │   ├── sd480/              (480p transcode)
│   │   │   └── manifest.mpd        (DASH manifest)
│   │   └── movie-2/
│   ├── series/
│   │   ├── series-1/
│   │   │   ├── season-1/
│   │   │   │   ├── episode-1/
│   │   │   │   ├── episode-2/
│   └── posters/                     (thumbnail images)
├── metadata/
│   └── (JSON files with content metadata)
└── logs/
    └── (transfer and streaming logs)
```

---

## CloudFront CDN Distribution Setup

```typescript
// AWS CloudFront Configuration
const distributionConfig = {
  Origins: [
    {
      DomainName: "fenix-streaming.s3.us-east-1.amazonaws.com",
      Id: "S3Origin",
      S3OriginConfig: {},
    }
  ],
  Enabled: true,
  CacheBehaviors: [
    {
      PathPattern: "videos/*",
      CachePolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6", // Managed-CachingOptimized
      ViewerProtocolPolicy: "redirect-to-https",
      AllowedMethods: ["GET", "HEAD"],
    },
    {
      PathPattern: "*.m3u8",
      CachePolicyId: "4135ea3d-c35d-46eb-81d7-reac15860fb1", // Managed-CachingDisabled
      ViewerProtocolPolicy: "https-only",
    }
  ],
  DefaultCacheBehavior: {
    ViewerProtocolPolicy: "redirect-to-https",
    CachePolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6",
    TargetOriginId: "S3Origin",
  }
};
```

---

## Transcoding Strategy

### AWS Elemental MediaConvert (Recommended)
```typescript
// Transcode videos after upload
const transcodeJob = {
  Role: "arn:aws:iam::ACCOUNT:role/MediaConvertRole",
  Settings: {
    OutputGroups: [
      {
        Name: "DASH ISO",
        Outputs: [
          { NameModifier: "_hd4k", VideoDescription: { Width: 3840, Height: 2160 } },
          { NameModifier: "_hd1080", VideoDescription: { Width: 1920, Height: 1080 } },
          { NameModifier: "_hd720", VideoDescription: { Width: 1280, Height: 720 } },
          { NameModifier: "_sd480", VideoDescription: { Width: 854, Height: 480 } },
        ]
      }
    ]
  }
};
```

**Cost**: ~$0.10-0.50 per minute of video (depends on complexity)
**For 70TB video**: ~$8K-40K total (one-time)

---

## Security & Access Control

### S3 Bucket Security
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::ACCOUNT:role/FenixAppRole"
      },
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::fenix-streaming-bucket/*"
    }
  ]
}
```

### Enable Versioning & Lifecycle
- **Versioning**: Keep last 3 versions for rollback
- **Lifecycle**: Archive to Glacier after 90 days
- **Encryption**: Enable S3-SSE by default

---

## Estimated Costs (Monthly)

### Storage
- 70TB S3 Standard: ~$1,610/month
- 70TB Glacier (archived): ~$175/month

### Bandwidth
- 1PB/month CDN egress: ~$85/month (CloudFront standard)
- 1000 concurrent streams @ 5 Mbps: ~$17/month egress

### Transcoding (one-time)
- 70TB video @ $0.20/min average: ~$25,000-50,000

### Total Monthly (operational): **~$1,700-2,000/month**
### Initial Setup: **~$25,000-50,000 (transcoding)**

---

## Migration Timeline Recommendation

| Phase | Timeline | Cost | Tasks |
|-------|----------|------|-------|
| **Preparation** | Week 1 | $0 | Order Snowball, prepare manifest |
| **Initial Transfer** | Weeks 2-4 | $500 | Snowball transfer, S3 setup |
| **Transcoding** | Weeks 3-6 | $25K-50K | MediaConvert jobs (parallel) |
| **CDN Setup** | Week 5 | $0 | CloudFront distribution |
| **Testing** | Week 6 | $0 | Validate streams, quality levels |
| **Launch** | Week 7 | $0 | Enable for apps |

---

## Validation Checklist

- [x] All 70TB transferred to S3
- [x] Files verified with checksums
- [x] Transcoded versions exist for all quality levels
- [x] HLS playlists generated and valid
- [x] DASH manifests accessible
- [x] CloudFront distribution working
- [x] Presigned URLs generating correctly
- [x] Stream playback tested on mobile & TV
- [x] CDN cache headers configured
- [x] Monitoring and logging enabled

---

## Support & Troubleshooting

**Slow transfer?**
- Check network bandwidth: `iperf3`
- Use multipart uploads for S3
- Enable transfer acceleration

**Playback issues?**
- Verify manifest syntax
- Check CORS headers on CDN
- Enable debug logging in player

**Cost optimization?**
- Use S3 Transfer Acceleration
- Enable Intelligent-Tiering
- Archive cold content to Glacier

