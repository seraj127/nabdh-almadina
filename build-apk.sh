#!/bin/bash
# Build APK script - builds a clean mobile app without download archives
# Usage: ./build-apk.sh

set -e

PROJECT_DIR="/home/z/my-project"
export ANDROID_HOME="/home/z/android-sdk"
export ANDROID_SDK_ROOT="/home/z/android-sdk"
export JAVA_HOME="/home/z/jdk-21"

echo "🏗️  Building نبض المدينة APK..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Step 1: Build Next.js static export
echo ""
echo "📦 Step 1/4: Building web app..."
cd "$PROJECT_DIR"

# Temporarily remove files that shouldn't be in the APK
BACKUP_DIR="/tmp/nabd-build-backup"
mkdir -p "$BACKUP_DIR"

# Move download archives out of public (they bloat the APK)
for f in nabd-al-madina-mobile.tar.gz nabd-al-madina-mobile-lite.tar.gz nabd-al-madina-app.zip nabd-al-madina.apk; do
  if [ -f "public/$f" ]; then
    mv "public/$f" "$BACKUP_DIR/"
    echo "  ⏩ Excluded from APK: $f"
  fi
done

# Move dynamic routes that don't work with static export
for f in src/app/api src/app/download-apk src/app/icon.tsx src/app/robots.ts src/app/sitemap.ts src/middleware.ts; do
  if [ -e "$PROJECT_DIR/$f" ]; then
    mv "$PROJECT_DIR/$f" "$BACKUP_DIR/"
    echo "  ⏩ Excluded from build: $f"
  fi
done

# Create static icon placeholder
cp "$PROJECT_DIR/public/logo.png" "$PROJECT_DIR/src/app/icon.png" 2>/dev/null || true

# Build
BUILD_MOBILE=1 JWT_SECRET=build-time-secret npx next build

# Clean up: restore backed up files
echo ""
echo "🔄 Restoring project files..."
for f in api download-apk icon.tsx robots.ts sitemap.ts; do
  if [ -e "$BACKUP_DIR/$f" ]; then
    mv "$BACKUP_DIR/$f" "$PROJECT_DIR/src/app/"
  fi
done
if [ -e "$BACKUP_DIR/middleware.ts" ]; then
  mv "$BACKUP_DIR/middleware.ts" "$PROJECT_DIR/src/"
fi
rm -f "$PROJECT_DIR/src/app/icon.png"

# Restore public files
for f in nabd-al-madina-mobile.tar.gz nabd-al-madina-mobile-lite.tar.gz nabd-al-madina-app.zip nabd-al-madina.apk; do
  if [ -e "$BACKUP_DIR/$f" ]; then
    mv "$BACKUP_DIR/$f" "$PROJECT_DIR/public/"
  fi
done

# Remove archives from out directory (safety check)
rm -f "$PROJECT_DIR/out/nabd-al-madina-mobile.tar.gz"
rm -f "$PROJECT_DIR/out/nabd-al-madina-mobile-lite.tar.gz"
rm -f "$PROJECT_DIR/out/nabd-al-madina-app.zip"
rm -f "$PROJECT_DIR/out/nabd-al-madina.apk"

rmdir "$BACKUP_DIR" 2>/dev/null || true

# Step 2: Sync with Capacitor
echo ""
echo "📱 Step 2/4: Syncing with Capacitor..."
cd "$PROJECT_DIR"
npx cap sync android

# Step 3: Build APK
echo ""
echo "🔨 Step 3/4: Building APK..."
cd "$PROJECT_DIR/android"
./gradlew assembleRelease

# Step 4: Copy APK to public
echo ""
echo "✅ Step 4/4: Copying APK..."
mkdir -p "$PROJECT_DIR/public"
cp "$PROJECT_DIR/android/app/build/outputs/apk/release/app-release.apk" "$PROJECT_DIR/public/nabd-al-madina.apk"

APK_SIZE=$(du -h "$PROJECT_DIR/public/nabd-al-madina.apk" | cut -f1)

# Clean up build intermediates
rm -rf "$PROJECT_DIR/android/app/build/intermediates" 2>/dev/null
rm -rf "$PROJECT_DIR/android/app/build/tmp" 2>/dev/null

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 APK Built Successfully!"
echo "📱 Size: $APK_SIZE"
echo "📂 Path: public/nabd-al-madina.apk"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
