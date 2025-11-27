# Fenix - Large Scale Content Upload Guide (70TB+)

## Overview

For storing 70TB+ of content from your personal computer, you need a distributed storage solution that's:
- **Cost-effective**: Wasabi or similar S3-compatible storage
- **Scalable**: Handles large file uploads reliably
- **Fast**: Optimized for batch uploads

## Architecture for 70TB+ Content

```
Your Computer (70TB+ local storage)
        ↓
    Upload Client
        ↓
Fenix Backend Server (handles uploads)
        ↓
Wasabi Storage (70TB+)
        ↓
Mobile Apps (stream from Wasabi CDN URLs)
```

## Storage Cost Analysis

### Wasabi Pricing for 70TB+
- **Storage**: 70TB × $5.99/TB/month = **$419/month**
- **Egress**: Included in Wasabi (no extra charge)
- **Total**: ~$419/month

### Alternatives
| Provider | 70TB Cost/Month | Notes |
|----------|-----------------|-------|
| Wasabi | $419 | Cheapest for this volume |
| AWS S3 | $1,400+ | Much more expensive |
| Backblaze B2 | $420 | Similar to Wasabi |
| Hetzner Storage | €250-400 | Good if in Europe |

**Recommendation: Wasabi** - Most cost-effective at scale.

## Upload Strategy

### Option 1: Direct Upload API (Recommended for 70TB)

Create a resumable upload endpoint:

```typescript
// server/routes.ts - Add this endpoint
app.post("/api/upload/chunk", authMiddleware, async (req, res) => {
  try {
    const { fileId, chunkIndex, totalChunks, fileName } = req.body;
    const chunk = req.file;
    
    // Store chunk temporarily
    const chunkPath = `/tmp/uploads/${fileId}/chunk-${chunkIndex}`;
    fs.mkdirSync(path.dirname(chunkPath), { recursive: true });
    fs.writeFileSync(chunkPath, chunk.buffer);
    
    // Check if all chunks received
    const files = fs.readdirSync(path.dirname(chunkPath));
    if (files.length === totalChunks) {
      // Combine chunks and upload to Wasabi
      await combineAndUploadToWasabi(fileId, fileName);
    }
    
    res.json({ 
      status: "chunk_received",
      chunkIndex,
      totalChunks
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
```

### Option 2: Command-Line Upload Tool

Create a CLI tool for batch uploads:

```bash
#!/bin/bash
# upload-content.sh

# Parameters
LOCAL_DIR="/path/to/your/70TB/content"
API_URL="https://fenix-api.yourdomain.com"
JWT_TOKEN="your-jwt-token"

# Upload all video files
for file in $(find "$LOCAL_DIR" -type f \( -name "*.mp4" -o -name "*.mkv" -o -name "*.mov" \)); do
    echo "Uploading: $file"
    
    curl -X POST "$API_URL/api/upload" \
        -H "Authorization: Bearer $JWT_TOKEN" \
        -F "file=@$file" \
        -F "title=$(basename $file)" \
        --progress-bar
done
```

## Upload Recommendations for 70TB+

### 1. Use Parallel Uploads
```bash
# Upload 5 files simultaneously
parallel -j 5 curl -X POST "$API_URL/api/upload" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -F "file=@{}" ::: /path/to/content/*
```

### 2. Resume Broken Uploads
```typescript
// Mark upload as resumable with checksums
POST /api/upload/resume
{
  "fileId": "abc123",
  "fileName": "movie.mp4",
  "fileSize": 5368709120,
  "md5Checksum": "abc123def456"
}
```

### 3. Batch Processing
- Upload 10-20 files per day
- Monitor bandwidth usage
- Stagger uploads to avoid overloading backend

### 4. Optimize Network
```bash
# Increase TCP buffer
sudo sysctl -w net.core.rmem_max=134217728
sudo sysctl -w net.core.wmem_max=134217728

# Enable TCP window scaling
sudo sysctl -w net.ipv4.tcp_window_scaling=1
```

## Step-by-Step Upload Process

### Step 1: Prepare Your Computer

```bash
# Install required tools
sudo apt install -y curl parallel

# Create upload list
find /path/to/content -type f \( -name "*.mp4" -o -name "*.mkv" \) > files.txt

# Count files and total size
wc -l files.txt
du -sh /path/to/content
```

### Step 2: Get Authentication Token

```bash
# Login to Fenix admin
curl -X POST https://fenix-api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fenix.local","password":"your-password"}' \
  | jq .token
```

### Step 3: Upload Content

**Method A: One file at a time (slow but reliable)**
```bash
export JWT_TOKEN="your-token-here"
export API_URL="https://fenix-api.yourdomain.com"

for file in /path/to/content/*; do
    echo "Uploading: $(basename $file)"
    curl -X POST "$API_URL/api/upload" \
        -H "Authorization: Bearer $JWT_TOKEN" \
        -F "file=@$file" \
        --progress-bar \
        --speed-limit 1m  # Limit to prevent server overload
done
```

**Method B: Parallel uploads (faster)**
```bash
export JWT_TOKEN="your-token-here"
export API_URL="https://fenix-api.yourdomain.com"

# Upload 5 files simultaneously
find /path/to/content -type f | parallel -j 5 \
    'curl -X POST "$API_URL/api/upload" \
        -H "Authorization: Bearer $JWT_TOKEN" \
        -F "file=@{}" \
        --progress-bar'
```

**Method C: Using rsync over SSH (most reliable for large transfers)**
```bash
# If backend server has rsync installed
rsync -avz --progress --partial \
    /path/to/content/ \
    root@fenix-backend:/data/uploads/
```

### Step 4: Monitor Progress

```bash
# Check upload status
curl -X GET "https://fenix-api.yourdomain.com/api/upload/status" \
    -H "Authorization: Bearer $JWT_TOKEN"

# Monitor backend server
ssh root@fenix-backend
du -sh /data/uploads/
```

### Step 5: Verify Uploads

```bash
# Check all files in database
curl -X GET "https://fenix-api.yourdomain.com/api/movies" \
    -H "Authorization: Bearer $JWT_TOKEN" | jq '.[] | {id, title, videoUrl}'
```

## Timeline for 70TB Upload

### At 100 Mbps Connection Speed

- **Time to upload 70TB**: ~650 hours = ~27 days continuous
- **Recommendation**: Upload 2-3TB per week over several months

### Optimization: Use Multiple Connections

If you have fiber or business internet:
- 1 Gbps connection: 65 hours = ~3 days
- Multiple upload threads: 30-40 hours total
- Parallel uploads (5 connections): 15-20 hours total

## Cost During Upload Phase

| Item | Cost |
|------|------|
| Backend Server | $144-288/month |
| Wasabi Storage | $419/month |
| Database | $50-200/month |
| Upload Bandwidth | $0 (included in Wasabi) |
| **Total/Month** | **$613-907** |

**Estimated total for 70TB**: $3,500-5,000 for ~6 months of uploads

## Backup & Redundancy

### For 70TB, recommend:

1. **Primary Storage**: Wasabi ($419/month)
2. **Backup Strategy**: 
   - Weekly snapshots: Hetzner Storage (€50/month)
   - Or: Second Wasabi bucket (additional $419/month)

3. **Disaster Recovery**:
   - Keep source files on your computer
   - Verify checksums after upload
   - Document all file IDs and URLs

## Monitoring Upload Health

```bash
# Monitor disk space on backend
watch -n 5 'df -h /data/uploads'

# Monitor database growth
psql $DATABASE_URL -c "SELECT COUNT(*) FROM movies; SELECT COUNT(*) FROM episodes;"

# Check Wasabi usage
# Log into Wasabi console → Billing → Storage Usage
```

## Estimated Timeline

| Phase | Duration | Action |
|-------|----------|--------|
| Setup | 1 week | Configure servers, create endpoints |
| Upload | 2-6 months | Upload 70TB in batches |
| Verification | 1 week | Test all streams work |
| Go-Live | Immediate | Launch platform |

## Contingencies

**If upload fails:**
- Resumable upload: Retry failed chunks only
- Batch retry: Restart with last successful file
- Database rollback: Delete failed entries and re-upload

**If server runs out of space:**
- Monitor `/data/uploads` usage
- Increase backend server disk space
- Or upload directly to Wasabi (bypass local storage)

## After Upload Complete

1. Archive your local copy (optional, keep backup)
2. Monitor Wasabi storage monthly
3. Set up billing alerts
4. Schedule regular backup verification

---

**Next Steps:**
1. Confirm Wasabi account and bucket created
2. Deploy backend server with upload endpoint
3. Start batch uploads from your computer
4. Monitor progress and adjust parallel connections as needed

For issues during upload, check `/var/log/fenix/` on backend server.
