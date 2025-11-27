# Fenix Streaming Platform - Launch Guide

## Dashboard Access & Demo Credentials

### Admin Dashboard URL
```
http://localhost:5000
```

### Demo Admin Credentials
```
Username: admin
Email: admin@fenix.local
Password: Admin@123456
```

### Super Admin Credentials (Full Access)
```
Username: superadmin
Email: superadmin@fenix.local
Password: SuperAdmin@123456
```

### Content Editor Credentials (Content Only)
```
Username: editor
Email: editor@fenix.local
Password: Editor@123456
```

---

## Walkthrough: Creating Content

### Step 1: Login to Dashboard
1. Navigate to http://localhost:5000/login
2. Enter admin email: `admin@fenix.local`
3. Enter password: `Admin@123456`
4. Click "Sign In"

### Step 2: Create a Movie

**Path:** Sidebar → Movies

1. Click **"+ Add Movie"** button
2. Fill in the form:
   - **Title**: "Inception"
   - **Genre**: "Sci-Fi"
   - **Year**: 2010
   - **Description**: "A skilled thief who steals corporate secrets through dream-sharing technology"
   - **Cast**: ["Leonardo DiCaprio", "Marion Cotillard", "Tom Hardy"]
   - **Required Plan**: "premium"
   - **Video URL**: `https://example.com/inception.mp4`
   - **Poster URL**: `https://example.com/inception-poster.jpg`
   - **Duration**: 148 (minutes)
   - **Status**: "active"
3. Click **"Create Movie"**
4. Movie now appears in the Movies list
5. To edit: Click the movie row → Edit option
6. To publish: Change status from "draft" → "active"

### Step 3: Create a Series with Episodes

**Path:** Sidebar → Series

1. Click **"+ Add Series"** button
2. Fill in Series details:
   - **Title**: "Breaking Bad"
   - **Genre**: "Drama"
   - **Total Seasons**: 5
   - **Description**: "A high school chemistry teacher turns to producing methamphetamine"
   - **Cast**: ["Bryan Cranston", "Aaron Paul", "Dean Norris"]
   - **Required Plan**: "standard"
   - **Poster URL**: `https://example.com/breaking-bad-poster.jpg`
   - **Status**: "active"
3. Click **"Create Series"**

#### Add Episodes to Series

1. From the series page, click **"Manage Episodes"** option
2. For Season 1, Episode 1:
   - **Episode Title**: "Pilot"
   - **Season**: 1
   - **Episode Number**: 1
   - **Description**: "A high school chemistry teacher..."
   - **Video URL**: `https://example.com/breaking-bad-s01e01.mp4`
   - **Duration**: 58
   - **Status**: "active"
3. Click **"Add Episode"**
4. Repeat for additional episodes (S01E02, S01E03, etc.)
5. Episodes display in sequential order in the mobile app

### Step 4: Create a TV Channel

**Path:** Sidebar → Channels

1. Click **"+ Add Channel"** button
2. Fill in Channel details:
   - **Name**: "Béisbol Dominicano 1"
   - **Category**: "Sports"
   - **Stream URL**: `https://example.com/channel1.m3u8` (M3U8/HLS format)
   - **Logo URL**: `https://example.com/channel-logo.png`
   - **Status**: "online"
   - **EPG Data**: (Optional electronic program guide data)
3. Click **"Create Channel"**
4. Channel appears in the Channels grid
5. To link content to the channel:
   - Click channel name
   - Select **"Add Content"**
   - Choose movies/series to associate with this channel

---

## Critical Functionality: Streaming

### Streaming URL Architecture

**Temporary Streaming URLs** (Generated with 1-hour expiration):
```
/stream/{contentId}?token={signed_jwt_token}
```

**Mobile App Flow:**
1. Mobile app requests content access via: `GET /api/content/movie/{id}/access?plan=premium`
2. Dashboard responds with signed streaming URL (1-hour expiration)
3. Mobile app receives URL and streams content
4. Streaming server verifies JWT token before serving content

### Streaming Error Resolution

**Code 15 (Legacy Error) - RESOLVED:**
- ✅ Streaming URLs now generated with proper JWT signing
- ✅ 1-hour expiration enforced at token level
- ✅ All requests return 401 for invalid/expired tokens
- ✅ Streaming server can verify tokens independently

### Verification Test

Test streaming URL generation:
```bash
# Get access to a movie (premium plan)
curl http://localhost:5000/api/content/movie/1/access?plan=premium

# Response includes:
{
  "id": 1,
  "title": "Inception",
  "accessible": true,
  "requiredPlan": "premium",
  "videoUrl": "/stream/1?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

# Mobile app uses videoUrl for streaming
# If token expired (>1 hour), returns 401 Unauthorized
```

### Live Streaming (TV Channels)

TV channels stream directly from M3U8 URLs:
```
GET /api/channels/{id}

Response:
{
  "id": 1,
  "name": "Béisbol Dominicano 1",
  "category": "Sports",
  "streamUrl": "https://example.com/channel1.m3u8",  ← Direct HLS stream
  "status": "online",
  "currentViewers": 1250
}
```

---

## API Documentation

### Access API Docs
```
GET http://localhost:5000/api/docs
```

Returns complete OpenAPI 3.0 specification with all endpoints.

### Key Mobile App Endpoints

#### Public Content (No Auth)
```
GET /api/public/movies?plan=premium
GET /api/public/series?plan=standard
GET /api/content/movie/{id}/access?plan=premium
GET /api/channels
GET /api/channels/{id}/content
```

#### Authentication
```
POST /api/auth/login
POST /api/users/register
```

#### Protected (Requires JWT Bearer Token)
```
GET /api/users/{id}
PATCH /api/users/{id}
POST /api/verify-key (Mobile app API key verification)
```

---

## API Key Management for Mobile Apps

### Generate New API Key

**Path:** Sidebar → API Keys

1. Click **"+ Generate New Key"** button
2. Enter **Application Name**: "iOS App v1.0"
3. Click **"Generate"**
4. Save the **API Key** and **Secret** securely
5. Share only with mobile app development team

### Mobile App Usage
```bash
# Verify API credentials
POST /api/verify-key
{
  "key": "fenix_1234567_abc123def",
  "secret": "randomsecret1234..."
}

# Response:
{
  "valid": true,
  "appName": "iOS App v1.0"
}
```

### Revoke Compromised Keys
1. Go to API Keys page
2. Find the key to revoke
3. Click **"Revoke Key"** button
4. Compromised key immediately becomes invalid

---

## Data Migration

### Export Data (Test 4.1)

**Path:** Sidebar → Migration → Export Data

1. Click **"Export All Data"** for complete backup
   - Downloads: `fenix-export-{timestamp}.json`
2. Or export specific types:
   - **Export Movies Only**
   - **Export Series Only**
   - **Export Channels Only**

### Import Data (Test 4.2)

**Path:** Sidebar → Migration → Import Data

1. Click file input and select exported JSON
2. System shows import results:
   - Number of items imported per type
   - Any errors encountered
3. Data is instantly available in the dashboard

### Legacy System Migration

See `migration-helper.js` for script to extract data from old "crack server"

---

## Pre-Launch Checklist

- [ ] Admin dashboard accessible and responsive
- [ ] Movie creation/editing/publishing working
- [ ] Series with episodes creation working
- [ ] TV channel creation and linking working
- [ ] Streaming URLs generating correctly (1-hour expiration)
- [ ] Mobile app can verify API keys
- [ ] Export/Import data working
- [ ] API documentation accessible at `/api/docs`
- [ ] All JWT tokens properly validated
- [ ] Database backups configured
- [ ] HTTPS enabled in production (self-signed OK for staging)
- [ ] Environment variables configured (JWT_SECRET, DATABASE_URL, etc.)

---

## Production Deployment

### Environment Variables Required
```
JWT_SECRET=your-secret-key-here
DATABASE_URL=postgresql://user:password@host/dbname
NODE_ENV=production
```

### Database Setup
```bash
npm run db:push
```

### Start Application
```bash
npm run build
npm run start
```

### SSL/TLS Configuration
- Use Let's Encrypt for production HTTPS
- Configure reverse proxy (Nginx/Caddy) to terminate SSL
- Update `/api/docs` server URL to production domain

---

## Support & Troubleshooting

### Common Issues

**Issue: Streaming URL expired**
- Solution: Generate new URL (1-hour expiration)

**Issue: API key verification fails**
- Solution: Ensure key and secret are copied exactly (case-sensitive)

**Issue: Content not visible in mobile app**
- Solution: Verify status is "active" and user plan matches requiredPlan

**Issue: Import fails**
- Solution: Ensure JSON format matches export structure; check for duplicate emails/titles

---

## Contact & Support

For issues or questions:
- Email: support@fenix.streaming
- API Status: http://localhost:5000/api/stats
- Documentation: http://localhost:5000/api/docs
