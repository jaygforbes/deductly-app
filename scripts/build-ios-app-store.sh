#!/bin/bash

# build-ios-app-store.sh
# Comprehensive script for building and submitting the Deductly app to the App Store
# This script handles bundle preparation, EAS build, and submission

set -e # Exit on any error

echo "🚀 Starting Deductly iOS App Store build process"
echo "================================================"

# Step 1: Prepare the bundle file
echo "📦 Step 1: Preparing the iOS bundle file..."
./scripts/prepare-ios-bundle.sh

# Step 2: Verify git status
echo "🔍 Step 2: Checking git status..."
if [ -n "$(git status --porcelain)" ]; then
  echo "⚠️  There are uncommitted changes in your repository."
  echo "   Consider committing these changes before building:"
  git status --short
  
  read -p "Do you want to continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Build aborted."
    exit 1
  fi
fi

# Step 3: Run EAS build for App Store
echo "🏗️  Step 3: Running EAS build for App Store submission..."
echo "   This may take 15-30 minutes to complete."
echo "   You can check the build status in the EAS dashboard."
echo

eas build --platform ios --profile app-store --non-interactive

echo
echo "✅ Build command initiated successfully!"
echo "   Monitor your build progress at: https://expo.dev/accounts/jayforbes/projects/deductly-app/builds"
echo

# Step 4: Provide instructions for submission
echo "📱 Next steps after build completes:"
echo "   1. Check the EAS dashboard for build status"
echo "   2. Once the build is successful, run:"
echo "      eas submit -p ios --latest"
echo "   3. Follow the App Store Connect submission process"
echo "      (See docs/app-store-submission-guide.md for details)"
echo
echo "🎉 Build process initiated successfully!"
