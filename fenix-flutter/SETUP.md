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

## Next Steps

1. ✅ Implement video player (uncomment code in player_screen.dart)
2. ✅ Add series/channels pages
3. ✅ Add search functionality
4. ✅ Add user profile page
5. ✅ Add offline caching
6. ✅ Build release APK/IPA

---

## Support

- **Flutter Docs**: https://flutter.dev/docs
- **Fenix Backend**: Check backend README
- **Video Player**: https://pub.dev/packages/video_player
- **REST API**: https://pub.dev/packages/http

---

## License

MIT - Use and modify freely
