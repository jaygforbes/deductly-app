#!/bin/bash

# Fully automated build script for iOS that skips linting and all prompts
# Based on the original build-ios.sh script

set -e

echo "🚀 Starting automated iOS build process..."

# Check if eas-cli is installed
if ! command -v eas &> /dev/null; then
  echo "📦 eas-cli is not installed. Installing..."
  npm install -g eas-cli
fi

# Check if logged in to EAS
eas whoami &> /dev/null || {
  echo "⚠️ Not logged in to EAS. Please run 'eas login' manually before using this script."
  exit 1
}

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run tests
echo "🧪 Running tests..."
npm test

# Skip linting
echo "🔍 Skipping linting step..."

# Skip git check
echo "📝 Proceeding with build regardless of git status..."

# Skip version update
echo "📋 Keeping current app version..."

# Run the build
echo "🚀 Starting iOS build with EAS..."
eas build --platform ios --profile production --non-interactive

echo "✅ Build command completed! Check EAS dashboard for build status."
