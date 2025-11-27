# Fenix Streaming Infrastructure Setup

## Streaming Architecture Overview

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  Mobile App     │  JWT    │  Fenix Dashboard │  Sign   │ Streaming Server│
│                 │◄────────│  API             │────────►│                 │
│  1. Request     │  Token  │                  │ URL+Key │  1. Verify JWT  │
│     content     │◄────────│  2. Generate     │         │     token       │
│  2. Get signed  │         │     signed URL   │◄────────│  2. Serve video │
│     streaming   │         │     (1-hour)     │         │                 │
│     URL         │         │                  │         │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
```

## Streaming URL Generation (Test 3.4)

### Current Implementation

The Fenix Dashboard generates secure, temporary streaming URLs with:
- **JWT Signing**: Each URL includes a digitally signed token
- **1-Hour Expiration**: Token expires after 1 hour of generation
- **Content-Specific**: Each movie/episode/channel has unique token
- **Format**: `/stream/{contentId}?token={jwt_token}`

### Example: Streaming URL Flow

```javascript
// 1. Mobile app requests movie access
GET /api/content/movie/5/access?plan=premium

// 2. Dashboard API response
{
  "id": 5,
  "title": "Inception",
  "accessible": true,
  "requiredPlan": "premium",
  "videoUrl": "/stream/5?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtb3ZpZUlkIjo1LCJleHAiOjE3MzI2NDM2MDB9.signed_signature"
}

// 3. Mobile app extracts videoUrl and streams
// 4. Streaming server verifies token before serving
```

## Streaming Error Resolution

### Code 15 Error (Legacy Issue) - RESOLVED

**Previous Implementation Issues:**
- ❌ Streaming URLs were plain file paths (no security)
- ❌ No expiration enforcement
- ❌ No access control verification
- ❌ Direct CDN URLs exposed authentication details

**New Implementation Fixes:**
- ✅ JWT-signed streaming URLs with cryptographic verification
- ✅ Automatic 1-hour expiration (configurable via TOKEN_EXPIRY)
- ✅ Per-request token validation before serving content
- ✅ Plan-based access control enforced at API level
- ✅ Streaming server independently verifies tokens

### Verification: Code 15 Resolution

Test that streaming works correctly:

```bash
# Test 1: Verify unauthorized access is rejected
curl http://localhost:5000/api/content/movie/1/access?plan=free

# Should return:
{
  "accessible": false,  # Premium content, free user
  "requiredPlan": "premium"
  # NO videoUrl returned
}

# Test 2: Verify authorized access returns signed URL
curl http://localhost:5000/api/content/movie/1/access?plan=premium

# Should return:
{
  "accessible": true,
  "videoUrl": "/stream/1?token=...",  # Signed JWT with 1-hour expiration
  "requiredPlan": "premium"
}

# Test 3: Verify expired tokens are rejected
# Wait 1 hour or manually expire token in JWT
curl http://localhost:5000/stream/1?token=expired_token

# Response: 401 Unauthorized (or proxy error)
```

## Streaming Server Setup

### Option 1: Using HLS/DASH Proxy

For production HLS streaming, set up a proxy server:

```javascript
// Example: Express proxy for streaming
app.get('/stream/:contentId', (req, res) => {
  const token = req.query.token;
  const contentId = req.params.contentId;
  
  // Verify token
  if (!verifyStreamingToken(contentId, token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Get content details from database
  const content = await getContent(contentId);
  
  // Proxy stream from CDN or origin server
  // Supports: MP4, HLS (.m3u8), DASH (.mpd)
  streamContent(content.videoUrl, res);
});
```

### Option 2: Redirect to CDN

For CDN delivery with pre-signed URLs:

```javascript
// Fenix API returns CDN URL with signed query params
{
  "videoUrl": "https://cdn.example.com/movies/inception.mp4?expires=1732643600&signature=..."
}
```

### Option 3: Direct File Serving

For small-scale deployments:

```javascript
// Serve video files directly with range request support
app.get('/stream/:contentId', (req, res) => {
  const token = req.query.token;
  
  if (!verifyStreamingToken(...)) {
    return res.status(401).send('Unauthorized');
  }
  
  // Stream file with proper headers
  const file = fs.createReadStream(`/videos/${contentId}.mp4`);
  file.pipe(res);
});
```

## Live Streaming (TV Channels)

### M3U8/HLS Stream Configuration

```bash
# Fenix stores HLS stream URL for each channel
POST /api/channels
{
  "name": "Béisbol Dominicano 1",
  "category": "Sports",
  "streamUrl": "https://streaming-provider.com/baseball1/live.m3u8",
  "logoUrl": "https://example.com/logo.png",
  "status": "online"
}

# Mobile app receives channel info
GET /api/channels/1
{
  "id": 1,
  "name": "Béisbol Dominicano 1",
  "streamUrl": "https://streaming-provider.com/baseball1/live.m3u8",
  "status": "online",
  "currentViewers": 1250
}

# Mobile app plays directly from streamUrl
# (HLS stream URLs don't require JWT - handled by streaming provider)
```

### Stream URL Validation

Ensure stream URLs are accessible:

```bash
# Test stream availability
curl -I "https://streaming-provider.com/baseball1/live.m3u8"

# Should return:
# HTTP/1.1 200 OK
# Content-Type: application/vnd.apple.mpegurl
# Content-Length: 2000

# Check playlist is valid
curl "https://streaming-provider.com/baseball1/live.m3u8" | head -5
# Should show: #EXTM3U header
```

## Performance Metrics

### Streaming URL Generation Time
- **Target**: < 50ms
- **Implementation**: JWT signing is fast (microseconds)
- **Test**: `curl -w "@curl-format.txt" http://localhost:5000/api/content/movie/1/access`

### Streaming Start Time (TTFB)
- **Target**: < 200ms
- **Factors**: Network latency, CDN cache, streaming server response

### Concurrent Streaming Users
- **Current Setup**: Limited by node.js max connections
- **Production**: Use load balancer (Nginx, HAProxy) with multiple instances

## Security Best Practices

### 1. JWT Secret Management
```bash
# Use strong, random secret in production
export JWT_SECRET=$(openssl rand -hex 32)

# Rotate secret periodically (every 90 days)
# Old tokens remain valid until expiration (7 days default)
```

### 2. HTTPS/TLS Required
```nginx
# Nginx configuration for production
server {
  listen 443 ssl;
  ssl_certificate /etc/letsencrypt/live/api.fenix.streaming/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/api.fenix.streaming/privkey.pem;
  
  # Proxy Fenix API
  location / {
    proxy_pass http://fenix-backend:5000;
    proxy_set_header X-Forwarded-For $remote_addr;
  }
}
```

### 3. Rate Limiting
```javascript
// Limit streaming URL generation requests
app.use('/api/content/*/access', rateLimiter({
  windowMs: 60000,      // 1 minute
  max: 100              // 100 requests per minute
}));
```

### 4. Content Origin Verification
```javascript
// Only allow streaming URLs for verified content
const content = await storage.getMovie(contentId);
if (!content || content.status !== 'active') {
  return res.status(404).json({ error: 'Content not found' });
}
```

## Testing Checklist

- [ ] Streaming URL generated successfully
- [ ] Token expires after 1 hour
- [ ] Expired tokens return 401 Unauthorized
- [ ] Free users cannot access premium content
- [ ] Standard users can access standard + free content
- [ ] Premium users can access all content
- [ ] TV channels stream via HLS without JWT
- [ ] Video plays smoothly in mobile app
- [ ] Multiple concurrent streams work
- [ ] HTTPS enforced in production
- [ ] JWT secret is strong and rotated

## Troubleshooting

### Streaming URL Not Generating
```bash
# Check JWT configuration
echo $JWT_SECRET
# Should be set and non-empty

# Check token endpoint is responding
curl http://localhost:5000/api/content/movie/1/access?plan=premium
```

### Video Won't Play in Mobile App
```
1. Verify content status is "active"
2. Verify user plan matches requiredPlan
3. Verify streaming URL token hasn't expired
4. Check mobile app logs for specific error codes
5. Test with HTTPS (mobile may require TLS)
```

### High Latency
```
1. Check server response time: `time curl http://localhost:5000/api/content/movie/1/access`
2. Check network latency to CDN
3. Check CDN cache hit rate
4. Consider adding Redis caching for frequently accessed content
```

## Production Deployment

### Environment Setup
```bash
# Production environment variables
export NODE_ENV=production
export JWT_SECRET=your-strong-secret-here
export DATABASE_URL=postgresql://prod_user:pass@prod-db.example.com/fenix
export API_DOMAIN=api.fenix.streaming
export CDN_DOMAIN=cdn.fenix.streaming
```

### Performance Optimization
```javascript
// Enable streaming cache headers
app.get('/stream/:contentId', (req, res) => {
  res.set('Cache-Control', 'public, max-age=3600');
  res.set('ETag', 'W/"token-' + req.query.token + '"');
  // ... serve content
});
```

### Monitoring
```bash
# Monitor streaming requests in production
tail -f logs/api.log | grep "GET /stream/"

# Track streaming metrics
# - Requests per second
# - Average response time
# - Token verification failures
# - Expired token attempts
```
