# Fenix Android TV / Google TV - Complete Build Guide

## 🎯 PRIMARY PLATFORM: Android TV & Google TV

This is the **main streaming platform** for your Fenix streaming service. Build for Android TV/Google TV first.

---

## Supported Android TV Devices

✅ **Nvidia Shield** - Premium set-top box  
✅ **Google Chromecast with Google TV** - Affordable streaming  
✅ **Amazon Fire TV** - Fire Stick and Fire TV devices  
✅ **Samsung Smart TVs** - Tizen-based TVs with Android TV option  
✅ **Sony Bravia** - Android TV built-in  
✅ **TCL TVs** - Android TV models  
✅ **Mi Box / Xiaomi** - Android TV devices  

---

## Installation & Setup

### Step 1: Initialize Flutter Project with Android TV Support

```bash
cd fenix-flutter

# Create platform-specific files
flutter create . --platforms android,ios

# Get dependencies
flutter pub get
```

### Step 2: Configure Android TV in Manifest

Edit `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.fenix.streaming">

    <!-- REQUIRED: Android TV Feature -->
    <uses-feature
        android:name="android.hardware.tv"
        android:required="false" />
    
    <!-- Google TV / Leanback Support -->
    <uses-feature
        android:name="android.software.leanback"
        android:required="false" />

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:label="Fenix Streaming"
        android:icon="@mipmap/ic_launcher">

        <activity
            android:name=".MainActivity"
            android:exported="true">

            <!-- TV Intent Filter - IMPORTANT for Play Store TV listing -->
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LEANBACK_LAUNCHER" />
            </intent-filter>

            <!-- Backup: Phone/Mobile intent filter -->
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

        </activity>
    </application>
</manifest>
```

### Step 3: Configure Android Gradle for TV

Edit `android/app/build.gradle`:

```gradle
android {
    namespace "com.fenix.streaming"
    compileSdk 34  // Android 14
    
    defaultConfig {
        applicationId "com.fenix.streaming"
        minSdkVersion 26  // Android 8.0+ for TV
        targetSdkVersion 34  // Android 14
        versionCode 1
        versionName "1.0.0"
    }

    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}

dependencies {
    // Android TV specific
    implementation 'androidx.leanback:leanback:1.2.0-alpha02'
    implementation 'androidx.tvprovider:tvprovider:1.0.0'
}
```

---

## Building for Android TV

### Build APK for Testing

```bash
# Development APK (for testing on emulator/device)
flutter build apk --debug

# Release APK (optimized for Play Store)
flutter build apk --release
```

**Output location:**
```
fenix-flutter/build/app/outputs/apk/release/app-release.apk
```

### Build AAB for Google Play Store

```bash
# Build Android App Bundle (required for Play Store)
flutter build appbundle --release
```

**Output location:**
```
fenix-flutter/build/app/outputs/bundle/release/app-release.aab
```

---

## Testing on Android TV

### Option 1: Test on Physical Device

**Requirements:** USB cable, USB Debugging enabled

```bash
# Connect device via USB
adb devices

# Install APK
adb install build/app/outputs/apk/release/app-release.apk

# Or run directly
flutter run -d <device-id>
```

### Option 2: Test on Android TV Emulator

1. **Open Android Studio**
2. **AVD Manager** → Create Device
3. Select **TV profile** (e.g., "Nexus Player" or "Generic TV")
4. Choose API level 26+ (Android 8.0+)
5. **Run:**
   ```bash
   flutter run -d emulator-5554
   ```

### Option 3: Test on Real TV

**For Nvidia Shield:**
```bash
# Enable Developer Options on Shield
# Settings → Device → Developer Options → USB Debugging

adb connect <shield-ip-address>:5555
adb install app-release.apk
```

---

## Google Play Store Submission (Android TV)

### Step 1: Create Google Play Developer Account

- Go to: https://play.google.com/console
- Cost: $25 one-time fee
- Complete your developer profile

### Step 2: Create App

1. **Google Play Console** → Create app
2. **App name:** "Fenix Streaming"
3. **App type:** Apps
4. **Category:** Entertainment (Movies & TV)

### Step 3: Prepare Store Listing

**Essential for TV apps:**

1. **App title:** Fenix Streaming (60 chars max)
2. **Short description:** (80 chars max)
   ```
   Watch movies and series on your TV
   ```
3. **Full description:** (4000 chars max)
   ```
   Fenix is a premium streaming service delivering movies, 
   series, and live channels directly to your Android TV device.
   
   Features:
   - Browse 70TB+ of content
   - Stream in 4K quality
   - Personalized recommendations
   - Offline downloads
   - Multi-profile support
   ```

4. **Icon:** 512x512 PNG (no transparency)
5. **Screenshots:** 
   - TV screenshots: 1280x720 minimum
   - Upload 2-4 TV interface screenshots
   - NOT phone screenshots (TV apps must show TV UI)
6. **Feature Graphic:** 1024x500 PNG
7. **Video Preview:** 15-30 second MP4 (optional but recommended)

### Step 4: Configure as TV App

**CRITICAL for Android TV:**

1. **Google Play Console** → App content
2. **Target audience:**
   - Audience type: TV
   - Content rating: Select appropriate rating
3. **TV Requirements:**
   - Navigation type: D-pad
   - Required hardware: Check "Has TV"
   - Leanback: Required

### Step 5: Upload APK/AAB

1. **Release management** → App releases
2. **Production track** (for public release)
3. **Upload AAB file:** `app-release.aab`
4. **Review rollout:** 
   - 5% rollout initially
   - Increase to 100% after 24-48 hours if stable

### Step 6: Submit for Review

1. Complete all store listing requirements
2. **Release** → **Review and release**
3. **Submit to Play Store**
4. **Approval time:** 24-48 hours

---

## App Store Requirements for Android TV

### Manifest Requirements

✅ **MUST HAVE:**
- `android.hardware.tv` feature declaration
- `android.software.leanback` for Leanback support
- Internet permission
- Minimum API 26 (Android 8.0)

✅ **TV Navigation:**
- D-pad navigation support (no touch required)
- Focus-based UI (not tap-based)
- Large buttons (48dp minimum)
- Readable text (14sp minimum)

✅ **Content Rating:**
- ESRB or IAMAI rating
- Required for publication

✅ **Screenshots:**
- 1280x720 minimum resolution
- Show actual TV interface
- Not phone/mobile UI

---

## Command Reference

### Quick Commands

```bash
# Check Flutter setup for TV
flutter doctor -v

# Install dependencies
flutter pub get

# Run on TV device
flutter run -d <device-id>

# Build for testing (APK)
flutter build apk --release

# Build for Play Store (AAB)
flutter build appbundle --release

# Clean build
flutter clean
flutter pub get
flutter build appbundle --release
```

---

## Debugging on Android TV

### View Logs

```bash
# Real-time logs
flutter logs

# Filtered logs
adb logcat | grep "flutter"
```

### Common Issues

**App not launching:**
```bash
adb shell monkey -p com.fenix.streaming 1
```

**Permissions denied:**
```bash
adb shell pm grant com.fenix.streaming android.permission.INTERNET
```

**Can't connect to backend:**
- Ensure Android TV device is on same network as backend
- Use actual IP: `192.168.1.x` (not `localhost`)
- Check firewall on backend server

---

## Production Deployment

### Backend Configuration

Update `lib/config/api_config.dart`:

```dart
class ApiConfig {
  // Production backend URL
  static const String apiBaseUrl = 'https://api.fenix.app';
  static const Duration timeoutDuration = Duration(seconds: 30);
}
```

### Android TV Specific Optimizations

```dart
// lib/screens/tv_catalog_screen.dart

final isLargeScreen = screenSize.width > 1200;

// Grid columns: 5 for TV, 3 for mobile
crossAxisCount: isLargeScreen ? 5 : 3,

// Large text for TV
fontSize: isLargeScreen ? 24 : 14,

// Oversized buttons for remote
padding: EdgeInsets.symmetric(
  horizontal: isLargeScreen ? 32 : 16,
  vertical: isLargeScreen ? 16 : 12,
),
```

---

## Monetization Options

### For Android TV Apps

1. **Free with Ads**
   - Google Ad Manager integration
   - Recommended for large audience

2. **Subscription (In-App Billing)**
   - Monthly/yearly plans
   - Requires Google Play Billing integration

3. **Premium Model**
   - One-time purchase
   - Upfront payment

4. **Freemium**
   - Free tier with limited content
   - Premium tier for full access

---

## Performance Tips for Android TV

✅ **Large Screen Optimization:**
- 5-column grid (1280x720 screens typically show 4-5 items)
- 48dp+ button sizes
- 16sp+ text sizes

✅ **Remote Navigation:**
- Optimize for D-pad navigation
- Clear focus indicators
- Logical tab order

✅ **Video Playback:**
- Hardware acceleration enabled
- Adaptive streaming (HLS/DASH)
- Buffering indicators

✅ **Bandwidth:**
- Detect connection speed
- Offer quality selection
- Support offline mode

---

## Troubleshooting

### Build Failures

```bash
# Fix: Clean build
flutter clean
flutter pub get
flutter build appbundle --release

# Fix: Update Gradle
./gradlew wrapper --gradle-version 8.0
```

### Playstore Rejection

**Common reasons:**
- Missing TV screenshots (shows phone UI instead)
- Content rating not set
- Manifest missing TV features
- No Leanback support

**Solution:** Follow "App Store Requirements" section above

### App Crashes on TV Device

1. Check logs: `adb logcat`
2. Ensure backend is reachable
3. Test on emulator first
4. Verify API endpoints work

---

## Next Steps

1. ✅ Install Flutter and Android Studio
2. ✅ Run: `flutter create . --platforms android`
3. ✅ Update AndroidManifest.xml (from above)
4. ✅ Build: `flutter build appbundle --release`
5. ✅ Test on Android TV emulator or device
6. ✅ Submit to Google Play Console
7. ✅ Wait for approval (24-48 hours)
8. ✅ Launch on Play Store

**Your Fenix Android TV app will be live!** 🎬📺
