@echo off
REM Fenix Flutter App - Automated Setup for Windows
REM This script sets up the entire Flutter project

setlocal enabledelayedexpansion
cd /d "%~dp0"

echo.
echo ============================================
echo FENIX FLUTTER APP - SETUP WIZARD
echo ============================================
echo.

REM Check if Flutter is installed
flutter --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Flutter SDK not found!
    echo.
    echo Please install Flutter first:
    echo 1. Download from: https://flutter.dev/docs/get-started/install/windows
    echo 2. Extract to: C:\flutter
    echo 3. Add to PATH: C:\flutter\bin
    echo 4. Restart PowerShell/Command Prompt
    echo 5. Run this script again
    echo.
    pause
    exit /b 1
)

echo [✓] Flutter SDK found
flutter --version

REM Check if in correct directory
if not exist "pubspec.yaml" (
    echo.
    echo ERROR: pubspec.yaml not found!
    echo This script must be run from the Flutter project root directory.
    echo.
    echo Current directory: %cd%
    echo.
    pause
    exit /b 1
)

echo [✓] Found Flutter project

REM Clean previous builds
echo.
echo [1/4] Cleaning previous builds...
flutter clean
if exist ".dart_tool" rmdir /s /q ".dart_tool"
if exist "pubspec.lock" del "pubspec.lock"

REM Get dependencies
echo.
echo [2/4] Installing dependencies...
flutter pub get
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo [✓] Dependencies installed

REM Run on Chrome
echo.
echo [3/4] Starting Flutter app on Chrome...
echo.
echo The app will open in Chrome. You should see:
echo   1. Login screen
echo   2. Try login with: admin@fenix.local / Admin@123456
echo.
echo Press any key to continue...
pause

echo.
echo [4/4] Launching app...
flutter run -d chrome

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to run app
    echo.
    echo Troubleshooting:
    echo - Make sure Chrome is installed
    echo - Run: flutter clean
    echo - Run: flutter pub get
    echo - Try: flutter run -d chrome
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================
echo [✓] SETUP COMPLETE!
echo ============================================
echo.
echo The Fenix Flutter app is now running!
echo.
pause
