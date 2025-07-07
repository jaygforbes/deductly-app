#!/bin/bash

# build-ios-with-bundle.sh
# Script to build the iOS app with a pre-generated bundle file

set -e # Exit on any error

echo "🚀 Starting iOS build process with pre-generated bundle"
echo "======================================================"

# Step 1: Check if the bundle file exists
echo "🔍 Step 1: Checking for bundle file..."
if [ ! -f "main.jsbundle" ]; then
  echo "❌ Bundle file not found in project root!"
  echo "Generating bundle file..."
  ./scripts/generate-ios-bundle-complete.sh
else
  echo "✅ Bundle file found in project root"
  BUNDLE_SIZE=$(du -h main.jsbundle | cut -f1)
  echo "📊 Bundle file size: $BUNDLE_SIZE"
fi

# Step 2: Check for uncommitted changes
echo "🔍 Step 2: Checking for uncommitted changes..."
if [ -n "$(git status --porcelain)" ]; then
  echo "⚠️ You have uncommitted changes in your repository."
  echo "It's recommended to commit all changes before building."
  
  read -p "Do you want to continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Build aborted."
    exit 1
  fi
else
  echo "✅ No uncommitted changes found"
fi

# Step 3: Run EAS build
echo "🏗️ Step 3: Running EAS build with app-store profile..."
echo "This will use the pre-generated bundle file."
echo "Starting build in 3 seconds..."
sleep 3

eas build --platform ios --profile app-store --non-interactive

echo ""
echo "🎉 Build process initiated!"
echo ""
echo "Next steps after successful build:"
echo "1. Download the IPA file from the EAS dashboard"
echo "2. Submit to App Store using: eas submit -p ios --path /path/to/your-app.ipa"
echo "   or use App Store Connect to upload the IPA file"
