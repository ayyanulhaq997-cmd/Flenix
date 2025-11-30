# Fenix Streaming App - Complete Setup Guide

## Overview

Fenix is a Netflix-style streaming platform with three main app implementations:

1. **Mobile App** (Android/iOS) - Consumer streaming app
2. **TV App** (Android TV, Apple TV, Web TV) - Large screen optimized interface
3. **Admin Dashboard** (Web) - Content and user management

---

## Part 1: Mobile App Setup (Android/iOS)

### Prerequisites

- Flutter SDK (3.0+)
- Android Studio or Xcode
- Java Development Kit (JDK 11+)
- Node.js (for backend)

### Installation Steps

1. **Set up Flutter environment:**
   ```bash
   flutter doctor
   flutter pub get
   ```

2. **Run on device/emulator:**
   ```bash
   # For Android
   flutter run -d android

   # For iOS
   flutter run -d ios
   ```

3. **Build production APK (Android):**
   ```bash
   flutter build apk --release
   # APK will be at: build/app/outputs/apk/release/app-release.apk
   ```

4. **Build production IPA (iOS):**
   ```bash
   flutter build ios --release
   # Follow iOS app store submission process
   ```

---

## Part 2: TV App Setup (Android TV, Apple TV, Web)

### Android TV Build

The TV app uses the same Flutter codebase with TV-optimized screens:

```bash
# Create TV variant project structure
flutter create . --platforms android

# For Android TV specifically, modify android/app/build.gradle:
# - Add TV permission: <uses-feature android:name="android.hardware.tv" />
# - Target Android API 30+

# Build Android TV APK
flutter build apk --release

# For Nvidia Shield, Fire TV, etc:
# The APK can be sideloaded or distributed through developer settings
```

**TV App Screens:**
- `tv_catalog_screen.dart` - Large grid layout optimized for TV
- `tv_player_screen.dart` - Full-screen player with remote control support

### Apple TV Build

For Apple TV, you'll need to create a tvOS project:

```bash
# Note: Current Flutter has limited tvOS support
# Recommended: Use native Swift with Xcode

# Or use flutter_tv plugin (community-maintained):
flutter pub add flutter_tv

flutter build ios --release
```

### Web TV Interface

The React dashboard can be adapted for web TV:

```bash
# The existing web dashboard at http://localhost:5000
# Works on any smart TV browser (LG WebOS, Samsung Tizen, etc.)
```

---

## Part 3: Admin Dashboard Setup (Web)

The admin dashboard runs on the Node.js/Express backend with React frontend.

### Backend Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Database setup:**
   ```bash
   npm run db:push
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```
   - Backend runs on: `http://localhost:5000/api`
   - Frontend runs on: `http://localhost:5000`

4. **Default admin credentials:**
   - Email: `admin@fenix.local`
   - Password: `Admin@123456`

### Frontend Access

- **Dashboard:** `http://localhost:5000`
- **Content Management:** Movies, Series, Channels, Episodes
- **User Management:** App users, subscriptions
- **API Keys:** For mobile app developers

---

## Deployment Guide

### Mobile App Deployment

#### Google Play Store (Android)

1. **Create Google Play Developer Account** ($25 one-time)

2. **Generate signed keystore:**
   ```bash
   keytool -genkey -v -keystore ~/key.jks -keyalg RSA -keysize 2048 -validity 10000
   ```

3. **Configure signing in android/app/build.gradle**

4. **Build signed APK:**
   ```bash
   flutter build apk --release
   ```

5. **Upload to Google Play Console**

#### Apple App Store (iOS)

1. **Enroll Apple Developer Program** ($99/year)

2. **Create App ID and provisioning profiles in Xcode**

3. **Build for App Store:**
   ```bash
   flutter build ios --release
   ```

4. **Upload with Transporter or Xcode**

### TV App Deployment

#### Android TV

- **Supported Devices:** Nvidia Shield, Fire TV, Sony Smart TVs, TCL, etc.
- **Distribution:** Google Play Store (TV section) or direct APK installation
- **Sideload for testing:** ADB installation on test devices

#### Web TV Interface

- Deploy the React dashboard to a web server
- Access via smart TV browser
- No installation required

#### Apple TV

- Submit through App Store Connect (tvOS section)
- Requires Apple Developer account

---

## API Integration for Mobile Apps

### Authentication

```dart
// Login endpoint
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

Response:
{
  "token": "jwt_token_here",
  "user": { ... }
}
```

### Content Queries

```dart
// Get all movies
GET /api/movies
Headers: Authorization: Bearer {token}

// Get series with episodes
GET /api/series?id={seriesId}

// Get channels
GET /api/channels

// Get episodes for series
GET /api/episodes?seriesId={seriesId}
```

### Streaming URLs

```dart
// Get signed streaming URL (1-hour expiry)
GET /api/public/stream/{contentId}

// Use in video_player:
video_player: ^2.7.0
```

---

## System Architecture

### Scalability (1000-3000 concurrent users)

**Backend:**
- Node.js clustering (multi-core utilization)
- Connection pooling (10-50 database connections)
- Nginx load balancer (reverse proxy)
- Redis session management (production)

**Database:**
- PostgreSQL with connection pooling
- Indexes on frequently queried fields
- Read replicas for scaling reads

**Storage:**
- Wasabi S3 (70TB+ video content)
- CDN for edge delivery
- Signed URLs with expiry for security

**Mobile App:**
- Local caching with `cached_network_image`
- Video buffering with `video_player`
- JWT refresh tokens for authentication

---

## Environment Variables

### Backend (.env)

```
DATABASE_URL=postgresql://user:password@host:5432/fenix
JWT_SECRET=your_secret_key_here
NODE_ENV=production
PORT=5000

# Wasabi S3 (optional)
WASABI_ENDPOINT=https://s3.wasabisys.com
WASABI_ACCESS_KEY=your_access_key
WASABI_SECRET_KEY=your_secret_key
WASABI_BUCKET_NAME=fenix-videos
```

### Mobile App (lib/config/api_config.dart)

```dart
class ApiConfig {
  static const String apiBaseUrl = 'https://api.fenix.app';
  static const Duration timeoutDuration = Duration(seconds: 30);
}
```

---

## Testing Checklist

- [ ] Mobile app login with test credentials
- [ ] Movie/series browsing and filtering
- [ ] Video playback on mobile
- [ ] TV app layout on 55" TV screen
- [ ] Admin dashboard content management
- [ ] Add/edit/delete movies, series, channels
- [ ] User subscription management
- [ ] API key generation for developers
- [ ] Streaming URL generation with expiry
- [ ] Database backup and recovery

---

## Support & Troubleshooting

### Common Issues

**Flutter build fails on Android:**
```bash
flutter clean
flutter pub get
flutter build apk
```

**TV app not detecting as TV device:**
- Ensure `android.hardware.tv` feature is declared
- Test on actual Android TV or emulator with TV add-on

**API connection issues:**
- Verify backend is running: `http://localhost:5000/api/stats`
- Check JWT token expiry (7 days)
- Ensure CORS is enabled on backend

---

## File Structure

```
fenix-flutter/
├── lib/
│   ├── main.dart
│   ├── screens/
│   │   ├── login_screen.dart
│   │   ├── catalog_screen.dart (Mobile)
│   │   ├── tv_catalog_screen.dart (TV)
│   │   ├── player_screen.dart (Mobile)
│   │   └── tv_player_screen.dart (TV)
│   ├── services/
│   │   ├── auth_service.dart
│   │   └── movie_service.dart
│   └── config/
│       └── api_config.dart

fenix-dashboard/ (React Admin)
├── client/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── App.tsx
│   └── index.html

server/
├── routes.ts
├── storage.ts
├── index.ts
└── middleware/
```

---

## Next Steps

1. **Configure Wasabi S3** for video storage
2. **Set up CI/CD pipeline** for automatic builds
3. **Deploy backend** to Railway/AWS
4. **Submit to app stores** (Play Store, App Store, TV platforms)
5. **Configure CDN** for video edge delivery
6. **Set up monitoring** (Sentry, DataDog)
flutter run
```

**iOS:**
```bash
flutter run -d iPhone
```

**Web (for testing):**
```bash
flutter run -d chrome
```

### Step 4: Login
Use demo credentials:
- Email: `admin@fenix.local`
- Password: `Admin@123456`

---

## Project Structure

```
lib/
├── main.dart                  # App entry point
├── config/
│   └── api_config.dart       # API configuration
├── models/
│   └── movie.dart            # Data models (Movie, User, etc)
├── services/
│   ├── auth_service.dart     # Authentication logic
│   └── movie_service.dart    # Movie API calls
├── screens/
│   ├── login_screen.dart     # Login page
│   ├── catalog_screen.dart   # Movie list
│   └── player_screen.dart    # Video player
└── widgets/                   # Reusable widgets (future)
```

---

## Features

### Implemented ✅
- Secure login with JWT
- Movie catalog with posters
- Movie details view
- Clean Material Design UI
- Works on Android, iOS, and Web
- Secure token storage
- Type-safe API integration

### Ready for Integration 🔧
- Video player (VideoPlayer plugin ready)
- Series/Channels support
- Search functionality
- User profile page

---

## Integration Guide

### Add Video Playback

In `lib/screens/player_screen.dart`, replace the placeholder with:

```dart
import 'package:video_player/video_player.dart';

late VideoPlayerController _controller;

@override
void initState() {
  super.initState();
  if (widget.movie.videoUrl != null) {
    _controller = VideoPlayerController.network(widget.movie.videoUrl!)
      ..initialize().then((_) {
        setState(() {});
      });
  }
}

@override
void dispose() {
  _controller.dispose();
  super.dispose();
}

// In build():
if (_controller.value.isInitialized)
  AspectRatio(
    aspectRatio: _controller.value.aspectRatio,
    child: VideoPlayer(_controller),
  );
```

### Add Search/Filter

In `lib/screens/catalog_screen.dart`:

```dart
TextField(
  decoration: InputDecoration(
    hintText: 'Search movies...',
    prefixIcon: const Icon(Icons.search),
  ),
  onChanged: (query) {
    // Filter movies
  },
)
```

### Add Series Support

1. Add `Series` model in `lib/models/movie.dart`
2. Add API method in `lib/services/movie_service.dart`
3. Create `series_screen.dart`
4. Add navigation in `main.dart`

---

## Building for Production

### Android Release APK
```bash
flutter build apk --release
```
Output: `build/app/outputs/apk/release/app-release.apk`

### iOS Release IPA
```bash
flutter build ipa --release
```

### Web Release
```bash
flutter build web --release
```

---

## Troubleshooting

### "Failed to connect to localhost:5000"
**Solution:**
- Ensure Fenix backend is running
- Update `apiBaseUrl` in `ApiConfig` to match your backend
- For Android emulator: Use `http://10.0.2.2:5000`
- For iOS simulator: Use `http://localhost:5000`
- For physical device: Use your computer's IP (e.g., `http://192.168.1.100:5000`)

### "Login fails with 401"
**Solution:**
- Check credentials (admin@fenix.local / Admin@123456)
- Verify backend is running: `npm run dev` in backend folder
- Check JWT_SECRET is set in backend

### "Pod install fails" (iOS)
**Solution:**
```bash
cd ios
rm Podfile.lock
pod install --repo-update
cd ..
```

### "Gradle build fails" (Android)
**Solution:**
```bash
flutter clean
flutter pub get
flutter run
```

---

## Deployment

### Google Play Store
1. Create signing key
2. Build APK: `flutter build apk --release`
3. Upload to Play Console

### Apple App Store
1. Create certificate in Xcode
2. Build IPA: `flutter build ipa --release`
3. Upload with Transporter

### Firebase Hosting (Web)
```bash
flutter build web --release
firebase deploy
```

---

## Key Dependencies

| Package | Purpose | Docs |
|---------|---------|------|
| http | REST API calls | [link](https://pub.dev/packages/http) |
| video_player | Video playback | [link](https://pub.dev/packages/video_player) |
| cached_network_image | Image caching | [link](https://pub.dev/packages/cached_network_image) |
| flutter_secure_storage | Secure token storage | [link](https://pub.dev/packages/flutter_secure_storage) |
| provider | State management | [link](https://pub.dev/packages/provider) |

---

## How to Add New Movie Entries

This is the most important part! Here's how to populate your app with movies:

### Method 1: Via Fenix Dashboard (Web UI)

1. **Start Fenix backend**:
   ```bash
   cd ..  # Go to backend directory
   npm run dev
   ```

2. **Open Fenix Dashboard**: 
   - URL: http://localhost:5000
   - Login: `admin@fenix.local` / `Admin@123456`

3. **Add Movies**:
   - Click "Movies" menu
   - Click "Add Movie" button
   - Fill in details:
     - **Title**: Movie name (e.g., "Avatar 2")
     - **Genre**: Genre (e.g., "Sci-Fi")
     - **Year**: Release year (e.g., 2022)
     - **Description**: Plot summary
     - **Duration**: Minutes (e.g., 192)
     - **Poster URL**: Link to poster image
     - **Video URL**: Link to video file (from Wasabi/S3)
     - **Required Plan**: free/standard/premium
     - **Rating**: Content rating (e.g., PG-13)
   - Click "Save Movie"

4. **Refresh Flutter App**:
   - App automatically loads new movies
   - Or logout and login to refresh

### Method 2: Batch Import (Via API)

For adding 100+ movies at once:

```bash
# Using curl to add movie via API
curl -X POST http://localhost:5000/api/movies \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Movie Name",
    "genre": "Action",
    "year": 2023,
    "description": "Movie description",
    "duration": 120,
    "posterUrl": "https://...",
    "videoUrl": "https://wasabi.../movie.mp4",
    "requiredPlan": "free",
    "rating": "PG-13"
  }'
```

### Method 3: Database Direct (Advanced)

Connect to PostgreSQL and insert directly:

```sql
INSERT INTO movies (title, genre, year, description, duration, posterUrl, videoUrl, requiredPlan, rating) 
VALUES (
  'Movie Title',
  'Genre',
  2023,
  'Description',
  120,
  'https://poster-url',
  'https://video-url.mp4',
  'free',
  'PG-13'
);
```

---

## Video URL Sources (For Wasabi/S3)

When you upload a video to Wasabi, you get URLs like:
```
https://bucket-name.s3.us-west-1.wasabisys.com/movies/avatar2.mp4
```

Store this full URL in the `videoUrl` field.

---

## Workflow: Add Videos → Add Movies → Test App

1. **Upload video file** → Wasabi/S3 (get URL)
2. **Add movie entry** → Fenix Dashboard (paste video URL)
3. **Test in Flutter app** → See movie + play video

---

## Next Steps

1. ✅ Implement video player (uncomment code in player_screen.dart)
2. ✅ Add series/channels pages
3. ✅ Add search functionality
4. ✅ Add user profile page
5. ✅ Add offline caching
6. ✅ Build release APK/IPA
7. ✅ Deploy to Play Store / App Store

---

## Support

- **Flutter Docs**: https://flutter.dev/docs
- **Fenix Backend**: Check backend README at parent directory
- **Video Player**: https://pub.dev/packages/video_player
- **REST API**: https://pub.dev/packages/http
- **Wasabi Docs**: https://wasabi.com/

---

## License

MIT - Use and modify freely
