# Infrastructure & Content Storage Setup Guide

## Overview
This guide covers setting up Fenix for production with 70TB+ content delivery, 1000-3000 concurrent users, and secure secret management.

---

## 1. Environment Variable Configuration (CRITICAL)

### Required Secrets
These **MUST** be set before deploying:

```bash
# JWT Secret (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your_secure_random_secret_here

# Database (auto-configured on Replit)
DATABASE_URL=postgresql://...
PGHOST=...
PGPORT=...
PGUSER=...
PGPASSWORD=...
PGDATABASE=...

# Wasabi S3-Compatible Cloud Storage (for 70TB+ content)
WASABI_ACCESS_KEY=your_wasabi_access_key
WASABI_SECRET_KEY=your_wasabi_secret_key
WASABI_ENDPOINT=s3.wasabisys.com
WASABI_BUCKET_NAME=fenix-content
```

**⚠️ CRITICAL:** Never hardcode secrets in code. Always use environment variables.

---

## 2. Cloud Storage Setup (Wasabi S3)

### Why Wasabi?
- **Cost-effective:** $5.99/TB/month vs AWS S3 $23/TB/month
- **S3-compatible:** Drop-in replacement for AWS S3
- **Ideal for streaming:** 70TB+ storage and high bandwidth

### Setup Steps:

#### Step 1: Create Wasabi Account
1. Go to https://wasabi.com
2. Sign up and create account
3. Navigate to "Access Keys" in settings
4. Generate new access key pair
5. Save `Access Key ID` and `Secret Access Key`

#### Step 2: Create Bucket
1. In Wasabi console, create new bucket: `fenix-content`
2. Set region (e.g., us-east-1 for US content)
3. Keep bucket private (not public)

#### Step 3: Configure Backend
Set environment variables with your Wasabi credentials:
```bash
WASABI_ACCESS_KEY=your_access_key_id
WASABI_SECRET_KEY=your_secret_access_key
WASABI_ENDPOINT=s3.wasabisys.com
WASABI_BUCKET_NAME=fenix-content
```

#### Step 4: Upload Content
Use AWS CLI (compatible with Wasabi):
```bash
# Configure CLI
aws configure --profile wasabi
# Access Key ID: [your access key]
# Secret Access Key: [your secret key]
# Region: us-east-1
# Output format: json

# Upload single file
aws s3 cp movie.mp4 s3://fenix-content/movies/ --profile wasabi

# Upload entire folder (70TB+)
aws s3 sync ./content s3://fenix-content/ --profile wasabi --no-progress

# Generate public URL (1-hour expiry)
aws s3 presign s3://fenix-content/movies/movie.mp4 --expires-in 3600 --profile wasabi
```

---

## 3. Backend Deployment Architecture

### Recommended Setup: Railway.app

#### Step 1: Connect Repository
1. Go to https://railway.app
2. Connect your GitHub repository
3. Select `fenix` project

#### Step 2: Configure Services

**Database (Neon PostgreSQL):**
- Already included - uses Replit's PostgreSQL

**Backend Server:**
- Environment Variables:
  ```
  NODE_ENV=production
  JWT_SECRET=[generate random secret]
  WASABI_ACCESS_KEY=[from Wasabi]
  WASABI_SECRET_KEY=[from Wasabi]
  WASABI_ENDPOINT=s3.wasabisys.com
  WASABI_BUCKET_NAME=fenix-content
  DATABASE_URL=[from Replit]
  ```
- Build Command: `npm run build`
- Start Command: `npm start`
- Port: `5000`

#### Step 3: Configure Clustering
The backend automatically uses all CPU cores:
```javascript
// server/index.ts - clustering is already enabled
const numCPUs = os.cpus().length;
// Spawns worker processes for each core
```

---

## 4. CDN Configuration (CloudFlare)

### Why CloudFlare?
- **Global edge caching** - Faster delivery worldwide
- **DDoS protection** - Protects against attacks
- **Compression** - Auto-compress video streams
- **SSL/TLS** - Free HTTPS certificates

#### Setup:
1. Go to cloudflare.com
2. Add your domain
3. Update nameservers at registrar
4. Enable caching rules for `/api/stream/*`
5. Set TTL to 1 hour for streaming URLs

---

## 5. Data Migration (70TB+ Content)

### Migration Plan:

#### Phase 1: Metadata Migration
```bash
# Export existing content metadata from Fenix dashboard
curl -H "Authorization: Bearer your_token" \
  http://your-server:5000/api/admin/export?type=all \
  > content_metadata.json

# Import to production via API
curl -X POST http://your-server:5000/api/admin/import \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json" \
  -d @content_metadata.json
```

#### Phase 2: Video File Migration to Wasabi
```bash
# Using AWS CLI (compatible with Wasabi)
# For 70TB, use parallel uploads:
aws s3 sync ./70tb_content s3://fenix-content/ \
  --profile wasabi \
  --max-concurrent-requests 10 \
  --max-bandwidth 1GB/s
```

#### Phase 3: Update Video URLs
- Each movie/episode `videoUrl` should point to Wasabi:
  ```
  https://s3.wasabisys.com/fenix-content/movies/title.mp4
  ```
- Or use presigned URLs (expires in 1 hour):
  ```
  https://fenix-content.s3.wasabisys.com/movies/title.mp4?X-Amz-Signature=...
  ```

---

## 6. Security Checklist

- [x] JWT Secret configured (required, no hardcoded fallback)
- [ ] Wasabi credentials stored in environment variables (not in code)
- [ ] Database password secured
- [ ] API keys generated via dashboard (never hardcoded)
- [ ] HTTPS/SSL enabled on production domain
- [ ] Firewall rules to restrict database access
- [ ] Regular backups of PostgreSQL database
- [ ] CloudFlare DDoS protection enabled

---

## 7. Monitoring & Scaling

### Database Monitoring
- **Neon Console:** Monitor query performance, connections
- **Target:** 50 max connections for 1000-3000 concurrent users

### Application Monitoring
- **Railway:** Built-in monitoring for CPU, memory, network
- **Auto-scale:** Set replicas to 2-4 for high availability

### Content Delivery Monitoring
- **Wasabi:** Monitor bandwidth usage and costs
- **CloudFlare:** Monitor cache hit rate and performance

---

## 8. Expected Costs (Monthly)

| Service | Size | Cost |
|---------|------|------|
| Wasabi Storage | 70TB | $418.65 |
| Wasabi Egress | 100TB/month | $0 (first 1TB free) |
| Neon PostgreSQL | Serverless | $20-50 |
| Railway Backend | 2 replicas | $20-50 |
| CloudFlare CDN | Pro Plan | $20 |
| **TOTAL** | | **~$500-540/month** |

---

## 9. Deployment Checklist

Before going live:

- [ ] JWT_SECRET environment variable configured
- [ ] Wasabi bucket created and credentials configured
- [ ] Database migrations run (`npm run db:push`)
- [ ] Admin user created (admin@fenix.local)
- [ ] Test content imported via `/api/admin/import`
- [ ] Video playback tested on mobile/TV apps
- [ ] Load testing with 1000+ concurrent users
- [ ] SSL/TLS certificate configured
- [ ] Backup strategy documented
- [ ] Monitoring and alerting set up

---

## 10. Troubleshooting

### Videos Won't Play
- Check `videoUrl` format (must be HTTPS)
- Verify Wasabi bucket is accessible
- Check CORS headers if getting cross-origin errors
- Test presigned URL expiry (max 1 hour)

### Slow Video Streaming
- Enable CloudFlare caching for `/api/stream/*`
- Check Wasabi bandwidth limits
- Verify network connection from TV/mobile to backend

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check max connections (should be 50)
- Monitor active connections in Neon dashboard

---

## Support

For questions about:
- **Wasabi:** https://www.wasabisys.com/docs
- **Railway:** https://docs.railway.app
- **Neon:** https://neon.tech/docs
- **CloudFlare:** https://developers.cloudflare.com

