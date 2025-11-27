# Fenix Streaming API - Complete Reference

## Base URL
```
Development: http://localhost:5000
Production: https://api.fenix.streaming
```

## Authentication
All protected endpoints require JWT Bearer token:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Error Handling

All errors follow standard HTTP status codes:
```
200 OK              - Successful request
201 Created         - Resource created successfully
400 Bad Request     - Invalid parameters
401 Unauthorized    - Missing or invalid authentication
404 Not Found       - Resource not found
500 Server Error    - Internal server error
```

Error Response Format:
```json
{
  "error": "Description of what went wrong"
}
```

---

## Public Endpoints (No Auth Required)

### Get Available Movies
```
GET /api/public/movies?plan=standard
```

**Query Parameters:**
- `plan` (string): User subscription plan - `free`, `standard`, or `premium`

**Response:**
```json
[
  {
    "id": 1,
    "title": "Inception",
    "genre": "Sci-Fi",
    "year": 2010,
    "description": "A skilled thief...",
    "cast": ["Leonardo DiCaprio"],
    "posterUrl": "https://example.com/inception.jpg",
    "status": "active",
    "requiredPlan": "premium",
    "views": 5000,
    "duration": 148,
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

### Get Available Series
```
GET /api/public/series?plan=standard
```

**Query Parameters:**
- `plan` (string): User subscription plan

**Response:** Array of series objects

### Check Content Access
```
GET /api/content/{type}/{id}/access?plan=premium
```

**Path Parameters:**
- `type` (string): `movie` or `series`
- `id` (integer): Content ID

**Query Parameters:**
- `plan` (string): User subscription plan

**Response:**
```json
{
  "id": 1,
  "title": "Inception",
  "accessible": true,
  "requiredPlan": "premium",
  "status": "active",
  "videoUrl": "/stream/1?token=eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Note:** `videoUrl` only included if `accessible: true`

### Get TV Channels
```
GET /api/channels
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Béisbol Dominicano 1",
    "category": "Sports",
    "streamUrl": "https://example.com/baseball1.m3u8",
    "logoUrl": "https://example.com/logo.png",
    "status": "online",
    "currentViewers": 1250,
    "createdAt": "2024-01-10T14:20:00Z"
  }
]
```

### Get Channel Details
```
GET /api/channels/{id}
```

**Path Parameters:**
- `id` (integer): Channel ID

**Response:** Single channel object

### Get Channel Content
```
GET /api/channels/{channelId}/content
```

**Path Parameters:**
- `channelId` (integer): Channel ID

**Response:**
```json
[
  {
    "id": 5,
    "title": "The Matrix",
    "genre": "Sci-Fi",
    "contentType": "movie",
    "videoUrl": "/stream/5?token=..."
  }
]
```

### Search Movies
```
GET /api/movies/search?q=inception&genre=sci-fi&status=active
```

**Query Parameters:**
- `q` (string): Search query (title/description)
- `genre` (string): Filter by genre (optional)
- `status` (string): Filter by status (optional)

**Response:** Array of matching movies

### Search Series
```
GET /api/series/search?q=breaking
```

**Query Parameters:** Same as movie search

**Response:** Array of matching series

### Get Series Episodes
```
GET /api/series/{seriesId}/episodes
```

**Path Parameters:**
- `seriesId` (integer): Series ID

**Response:**
```json
[
  {
    "id": 1,
    "seriesId": 1,
    "seasonNumber": 1,
    "episodeNumber": 1,
    "title": "Pilot",
    "description": "The first episode",
    "videoUrl": "/stream/1?token=...",
    "duration": 58,
    "status": "active",
    "views": 10000,
    "createdAt": "2024-01-05T09:00:00Z"
  }
]
```

---

## Authentication Endpoints

### Register User
```
POST /api/users/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "passwordHash": "hashed_password_here",
  "plan": "standard"
}
```

**Response:**
```json
{
  "id": 42,
  "name": "John Doe",
  "email": "john@example.com",
  "plan": "standard",
  "status": "active",
  "joinedAt": "2024-01-20T15:30:00Z",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login
```
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password_plain_text"
}
```

**Response:**
```json
{
  "id": 42,
  "name": "John Doe",
  "email": "john@example.com",
  "plan": "standard",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Verify API Key
```
POST /api/verify-key
```

**Request Body:**
```json
{
  "key": "fenix_1234567_abc123def",
  "secret": "randomsecret1234..."
}
```

**Response:**
```json
{
  "valid": true,
  "appName": "iOS App v1.0"
}
```

---

## Protected Endpoints (Requires JWT Token)

### Get User Details
```
GET /api/users/{id}
Authorization: Bearer {token}
```

**Response:** User object (without passwordHash)

### Update User
```
PATCH /api/users/{id}
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "Jane Doe",
  "plan": "premium"
}
```

**Response:** Updated user object

### Delete User
```
DELETE /api/users/{id}
Authorization: Bearer {token}
```

**Response:** 204 No Content

### Get All Users (Admin Only)
```
GET /api/users
Authorization: Bearer {admin_token}
```

**Response:** Array of user objects

### Create Movie
```
POST /api/movies
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "title": "New Movie",
  "genre": "Action",
  "year": 2024,
  "description": "Movie description",
  "cast": ["Actor 1", "Actor 2"],
  "posterUrl": "https://example.com/poster.jpg",
  "videoUrl": "https://example.com/movie.mp4",
  "duration": 120,
  "status": "active",
  "requiredPlan": "standard"
}
```

**Response:** Created movie object with ID

### Update Movie
```
PATCH /api/movies/{id}
Authorization: Bearer {admin_token}
```

**Request Body:** Any fields to update

**Response:** Updated movie object

### Delete Movie
```
DELETE /api/movies/{id}
Authorization: Bearer {admin_token}
```

**Response:** 204 No Content

### Create Series
```
POST /api/series
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "title": "Breaking Bad",
  "genre": "Drama",
  "totalSeasons": 5,
  "description": "Series description",
  "cast": ["Bryan Cranston", "Aaron Paul"],
  "posterUrl": "https://example.com/poster.jpg",
  "status": "active",
  "requiredPlan": "standard",
  "rating": "9.5"
}
```

**Response:** Created series object with ID

### Create Episode
```
POST /api/episodes
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "seriesId": 1,
  "seasonNumber": 1,
  "episodeNumber": 1,
  "title": "Pilot",
  "description": "Episode description",
  "videoUrl": "https://example.com/episode.mp4",
  "duration": 58,
  "status": "active"
}
```

**Response:** Created episode object with ID

### Create Channel
```
POST /api/channels
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "name": "HBO",
  "category": "Movies",
  "streamUrl": "https://example.com/channel.m3u8",
  "logoUrl": "https://example.com/logo.png",
  "status": "online"
}
```

**Response:** Created channel object with ID

### Add Content to Channel
```
POST /api/channels/{channelId}/content
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "contentType": "movie",
  "contentId": 5
}
```

**Response:** Channel content link object

### Remove Content from Channel
```
DELETE /api/channels/{channelId}/content/{contentId}
Authorization: Bearer {admin_token}
```

**Response:** 204 No Content

### Generate API Key
```
POST /api/admin/keys
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "appName": "iOS App v1.0",
  "createdBy": "admin"
}
```

**Response:**
```json
{
  "id": 1,
  "appName": "iOS App v1.0",
  "key": "fenix_1234567_abc123def",
  "secret": "randomsecret1234randomsecret1234",
  "status": "active",
  "createdBy": "admin",
  "createdAt": "2024-01-20T10:00:00Z"
}
```

### Get All API Keys
```
GET /api/admin/keys
Authorization: Bearer {admin_token}
```

**Response:** Array of API keys (secrets masked as `****`)

### Revoke API Key
```
POST /api/admin/keys/{id}/revoke
Authorization: Bearer {admin_token}
```

**Response:** Revoked key object

### Export Data
```
GET /api/admin/export?type=all
Authorization: Bearer {admin_token}
```

**Query Parameters:**
- `type` (string): `all`, `movies`, `series`, `channels`, or `users`

**Response:** JSON file download with all data

### Import Data
```
POST /api/admin/import
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "movies": [...],
  "series": [...],
  "episodes": [...],
  "channels": [...],
  "users": [...]
}
```

**Response:**
```json
{
  "moviesImported": 5,
  "seriesImported": 2,
  "channelsImported": 3,
  "usersImported": 10,
  "errors": []
}
```

### Get Dashboard Stats
```
GET /api/stats
```

**Response:**
```json
{
  "totalMovies": 150,
  "totalSeries": 45,
  "totalChannels": 20,
  "totalUsers": 5000,
  "activeChannels": 18,
  "totalViews": 500000
}
```

---

## API Response Codes Reference

| Code | Meaning | When It Happens |
|------|---------|-----------------|
| 200 | OK | Request successful |
| 201 | Created | New resource created |
| 204 | No Content | Successful deletion |
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Missing/invalid token |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Unexpected error |

---

## Rate Limiting

To prevent abuse, API enforces rate limits:
- **Public endpoints**: 100 requests per minute per IP
- **Authenticated endpoints**: 500 requests per minute per user
- **Streaming URL generation**: 100 requests per hour per user

---

## WebHook Events (Future)

For real-time updates, subscribe to events:
- `content.published` - Content marked as active
- `stream.started` - User started watching
- `user.subscription.upgraded` - Plan changed
- `channel.went_online` - TV channel came online

---

## SDK Availability

- **JavaScript/TypeScript**: OpenAPI SDK generation available
- **Python**: Flask client available
- **Swift (iOS)**: Native SDK in progress
- **Kotlin (Android)**: Native SDK in progress

Generate SDK:
```bash
# From OpenAPI spec
openapi-generator-cli generate -i http://localhost:5000/api/docs -g typescript-axios -o ./sdk
```

---

## Support & Documentation

- **Full OpenAPI Spec**: GET `/api/docs`
- **Interactive API Explorer**: Available in dashboard
- **Code Examples**: See `/docs/examples` directory
- **Status Page**: `/api/stats`
