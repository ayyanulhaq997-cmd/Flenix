# Fenix Flutter App - Setup Guide

Complete Netflix-style streaming app for Android and iOS.

## Prerequisites

1. **Flutter SDK** (3.0+)
   - Download: https://flutter.dev/docs/get-started/install
   - Verify: `flutter --version`

2. **Android Studio** (for Android development)
   - Download: https://developer.android.com/studio

3. **Xcode** (for iOS development, macOS only)
   - Install: `xcode-select --install`

## Quick Start (5 minutes)

### Step 1: Update API Endpoint
Edit `lib/config/api_config.dart`:
```dart
// Change this to your Fenix backend URL
static const String apiBaseUrl = 'http://localhost:5000';
```

### Step 2: Install Dependencies
```bash
cd fenix-flutter
flutter pub get
```

### Step 3: Run the App

**Android:**
```bash
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
