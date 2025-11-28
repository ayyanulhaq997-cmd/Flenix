# Fenix Mobile App - Complete Setup Guide

## Quick Start (5 minutes)

### Step 1: Open in Android Studio
1. Download and install [Android Studio](https://developer.android.com/studio)
2. File → Open → Select `mobile-app` folder
3. Wait for Gradle sync to complete

### Step 2: Configure API Endpoint
Edit `app/src/main/java/com/fenix/streaming/config/ApiConfig.kt`:

```kotlin
// For local testing on emulator:
const val FENIX_API_BASE_URL = "http://10.0.2.2:5000"

// For physical device:
const val FENIX_API_BASE_URL = "http://YOUR_COMPUTER_IP:5000"

// For production:
const val FENIX_API_BASE_URL = "https://your-fenix-backend.com"
```

### Step 3: Run the App
1. Select Android Emulator or Physical Device
2. Click "Run" button (or press Shift + F10)
3. App launches with login screen

### Step 4: Login
Use demo credentials:
- Email: `admin@fenix.local`
- Password: `Admin@123456`

---

## Architecture Overview

### Project Structure
```
app/src/main/java/com/fenix/streaming/
├── MainActivity.kt              # Entry point, composables
├── config/
│   └── ApiConfig.kt            # API configuration
├── api/
│   └── FenixApiService.kt      # Retrofit API interface
├── models/
│   └── Movie.kt                # Data classes
├── repository/
│   └── MovieRepository.kt      # Data layer
└── (ui/viewmodel coming soon)
```

### App Flow
```
1. Login Screen
   ↓ (authenticate with JWT)
   
2. Movie Catalog
   ↓ (fetch movies from /api/movies)
   
3. Movie Detail/Player
   ↓ (stream video with ExoPlayer)
```

---

## Feature Implementation Guide

### Feature 1: Video Player (ExoPlayer)

Currently shows placeholder. To integrate ExoPlayer:

**In `PlayerScreen` composable, replace placeholder with:**

```kotlin
val exoPlayer = remember {
    ExoPlayer.Builder(LocalContext.current).build().apply {
        if (!movie.videoUrl.isNullOrEmpty()) {
            val mediaItem = MediaItem.fromUri(Uri.parse(movie.videoUrl))
            setMediaItem(mediaItem)
            prepare()
        }
    }
}

AndroidView(
    factory = { context ->
        StyledPlayerView(context).apply {
            player = exoPlayer
        }
    },
    modifier = Modifier
        .fillMaxWidth()
        .height(300.dp)
)

// Cleanup player on screen exit
DisposableEffect(Unit) {
    onDispose {
        exoPlayer.release()
    }
}
```

### Feature 2: Add Series/Channels

Add to `FenixApiService`:
```kotlin
@GET("/api/series")
suspend fun getSeries(
    @Header("Authorization") token: String
): Response<List<Series>>

@GET("/api/channels")
suspend fun getChannels(
    @Header("Authorization") token: String
): Response<List<Channel>>
```

### Feature 3: User Profile Page

1. Create `ProfileScreen.kt`
2. Add navigation to `AppState`
3. Call `/api/app-users/:id` endpoint
4. Display user subscription plan

### Feature 4: Search/Filter Movies

Add to `CatalogScreen`:
```kotlin
var searchQuery by remember { mutableStateOf("") }

TextField(
    value = searchQuery,
    onValueChange = { searchQuery = it },
    label = { Text("Search movies...") }
)

val filteredMovies = movies.filter { 
    it.title.contains(searchQuery, ignoreCase = true)
}
```

### Feature 5: Offline Caching

Add to dependencies:
```gradle
implementation 'androidx.room:room-runtime:2.5.2'
implementation 'androidx.room:room-ktx:2.5.2'
```

Create Room database for offline movie list.

---

## Troubleshooting

### Problem: "Failed to connect to localhost:5000"
**Solution**: 
- Check Fenix backend is running: `npm run dev`
- Use correct IP: `http://10.0.2.2:5000` for emulator
- For device: use your computer's IP address

### Problem: "Retrofit Exception: Unable to resolve host"
**Solution**:
- Check `ApiConfig.FENIX_API_BASE_URL` is correct
- Ensure phone/emulator has internet permission
- Check manifest has `<uses-permission android:name="android.permission.INTERNET" />`

### Problem: "401 Unauthorized"
**Solution**:
- Login credentials are wrong
- Token expired - re-login
- Server not returning valid JWT token

### Problem: "Video won't play"
**Solution**:
- Check `movie.videoUrl` is valid
- URL might require authentication header
- Video format might not be supported (use MP4)

---

## Deployment

### Build Release APK
```bash
./gradlew assembleRelease
```

APK location: `app/build/outputs/apk/release/app-release.apk`

### Sign for Play Store
```bash
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore my-key.jks app-release-unsigned.apk alias
```

---

## Key Libraries

| Library | Purpose | Docs |
|---------|---------|------|
| Retrofit | REST API client | [link](https://square.github.io/retrofit/) |
| Jetpack Compose | Modern UI | [link](https://developer.android.com/jetpack/compose) |
| ExoPlayer | Video playback | [link](https://exoplayer.dev) |
| Coil | Image loading | [link](https://coil-kt.github.io/coil/) |

---

## Next Steps

1. ✅ Replace `PlayerScreen` placeholder with ExoPlayer
2. ✅ Add Series/Channels list screens
3. ✅ Add user profile page
4. ✅ Add search/filter functionality
5. ✅ Add offline caching with Room
6. ✅ Build release APK for testing

---

## Support

- **Backend issues**: Check Fenix dashboard at `http://localhost:5000`
- **Android issues**: Check [Android Developer docs](https://developer.android.com)
- **ExoPlayer issues**: Check [ExoPlayer docs](https://exoplayer.dev)
- **Retrofit issues**: Check [Retrofit docs](https://square.github.io/retrofit/)
