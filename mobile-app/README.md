# Fenix Mobile App - Android

A Netflix-style streaming app that connects to the Fenix backend API for content management.

## Features

- **Secure Sign-In**: JWT authentication with the Fenix backend
- **Movie Catalog**: Browse available movies with posters, titles, and descriptions
- **Video Playback**: ExoPlayer integration for smooth video streaming
- **Subscription Plans**: Free, Standard, Premium access control
- **Clean Architecture**: Separation of concerns with MVVM pattern

## Setup Instructions

### Prerequisites
- Android Studio (latest version)
- Android API Level 24+
- Internet connection

### Configuration

1. **Update API Endpoint** (in `app/src/main/java/com/fenix/streaming/config/ApiConfig.kt`):
   ```kotlin
   const val FENIX_API_BASE_URL = "https://your-fenix-backend.com"
   ```

2. **Sync Gradle Dependencies**:
   - Open Android Studio
   - File → Sync Now

3. **Run the App**:
   - Select a device or emulator
   - Click Run button

### Default Test Credentials

- Email: `admin@fenix.local`
- Password: `Admin@123456`

## Project Structure

```
app/
├── src/main/java/com/fenix/streaming/
│   ├── api/                 # API client and services
│   ├── models/              # Data models (Movie, User, etc)
│   ├── ui/
│   │   ├── screens/         # Main screens (Login, Catalog, Player)
│   │   ├── components/      # Reusable UI components
│   │   └── theme/           # App theming
│   ├── viewmodel/           # ViewModel for MVVM
│   ├── repository/          # Data repository layer
│   └── MainActivity.kt       # Entry point
└── res/
    ├── layout/              # XML layouts
    ├── drawable/            # Images and icons
    └── values/              # Colors, strings, dimensions
```

## API Integration

The app communicates with the Fenix backend via REST API:

### Authentication
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: { "token": "jwt_token_here", ... }
```

### Get Movies
```
GET /api/movies
Authorization: Bearer jwt_token_here

Response: [
  {
    "id": 1,
    "title": "Movie Title",
    "description": "...",
    "posterUrl": "...",
    "duration": 120,
    "requiredPlan": "free"
  },
  ...
]
```

### Get Movie Details
```
GET /api/movies/:id
Authorization: Bearer jwt_token_here
```

## Video Player

The app uses **ExoPlayer** for video streaming:
- Smooth playback
- Adaptive bitrate streaming
- Offline caching support (optional)
- Flexible controller UI

## Customization

### Change Theme
Edit `app/src/main/java/com/fenix/streaming/ui/theme/Theme.kt`:
```kotlin
private val DarkColorScheme = darkColorScheme(
    primary = Color(0xFF3B82F6),  // Primary color
    // Customize other colors...
)
```

### Change API Endpoint
Edit `app/src/main/java/com/fenix/streaming/config/ApiConfig.kt`:
```kotlin
const val FENIX_API_BASE_URL = "your_api_url_here"
```

### Video Player Configuration
Edit `app/src/main/java/com/fenix/streaming/ui/screens/PlayerScreen.kt`:
```kotlin
// Customize player settings (autoplay, controls, etc)
```

## Building for Production

### Generate Release APK
```bash
./gradlew assembleRelease
```

The APK will be available at:
```
app/build/outputs/apk/release/app-release.apk
```

### Sign APK (Required for Play Store)
```bash
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore my-release-key.jks app-release.apk alias_name
```

## Troubleshooting

### Issue: "Certificate verification failed"
**Solution**: Check your API endpoint SSL certificate or use `http://` for development.

### Issue: "ExoPlayer not playing video"
**Solution**: Ensure the video URL from Fenix API is accessible and not expired.

### Issue: "Login fails with 401"
**Solution**: Check credentials and ensure Fenix backend is running.

## Libraries Used

- **Retrofit**: HTTP client for API communication
- **Gson**: JSON parsing
- **ExoPlayer**: Video playback
- **Jetpack Compose**: Modern UI framework (optional, can use XML)
- **Room**: Local database (optional, for offline content)
- **Hilt**: Dependency injection

## License

MIT - Use and modify freely for your Netflix-style app.

## Support

For issues with:
- **Fenix Backend**: Check the Fenix dashboard
- **ExoPlayer**: Refer to [Google ExoPlayer docs](https://exoplayer.dev)
- **Android Development**: Check [Android Developer docs](https://developer.android.com)
