#!/bin/bash

# Fixed build script for iOS that ensures the bundle is created correctly
# Based on the original build-ios.sh script

set -e

echo "🚀 Starting fixed iOS build process..."

# Check if eas-cli is installed
if ! command -v eas &> /dev/null; then
  echo "📦 eas-cli is not installed. Installing..."
  npm install -g eas-cli
fi

# Check if logged in to EAS
eas whoami &> /dev/null || {
  echo "⚠️ Not logged in to EAS. Please login first."
  eas login
}

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run tests
echo "🧪 Running tests..."
npm test

# Skip linting
echo "🔍 Skipping linting step..."

# Create the ios directory if it doesn't exist
echo "📁 Ensuring iOS directories exist..."
mkdir -p ios/assets

# Pre-generate the bundle file locally to ensure it works
echo "📦 Pre-generating bundle file..."
npx react-native bundle --entry-file index.js --platform ios --dev false --bundle-output ios/main.jsbundle --assets-dest ios/assets

# Verify the bundle was created
if [ ! -f "ios/main.jsbundle" ]; then
  echo "❌ Failed to generate bundle file. Exiting."
  exit 1
else
  echo "✅ Bundle file generated successfully."
fi

# Run the build
echo "🚀 Starting iOS build..."
eas build --platform ios --profile production --non-interactive

echo "✅ Build command completed!"
