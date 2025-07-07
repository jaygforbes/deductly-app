#!/bin/bash

# Build script for iOS that skips linting
# Based on the original build-ios.sh script

set -e

# Check if eas-cli is installed
if ! command -v eas &> /dev/null; then
  echo "❌ eas-cli is not installed. Installing..."
  npm install -g eas-cli
fi

# Check if logged in to EAS
eas whoami &> /dev/null || {
  echo "❌ Not logged in to EAS. Please login first."
  eas login
}

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run tests
echo "🧪 Running tests..."
npm test

# Skip linting
echo "🔍 Skipping linting as requested..."

# Check for any git changes that haven't been committed
if [ -n "$(git status --porcelain)" ]; then
  echo "⚠️ You have uncommitted changes. It's recommended to commit before building."
  read -p "Continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Build cancelled."
    exit 1
  fi
fi

# Ask user if they want to update the version
read -p "Do you want to update the app version? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  # Get current version from app.json
  CURRENT_VERSION=$(node -e "console.log(require('./app.json').expo.version)")
  echo "Current version: $CURRENT_VERSION"
  
  # Ask for new version
  read -p "Enter new version (or leave blank to keep current): " NEW_VERSION
  if [ -n "$NEW_VERSION" ]; then
    # Update version in app.json
    node -e "const fs=require('fs');const app=require('./app.json');app.expo.version='$NEW_VERSION';fs.writeFileSync('./app.json',JSON.stringify(app,null,2))"
    echo "✅ Updated version to $NEW_VERSION"
  fi
fi

# Run the build
echo "🚀 Starting iOS build..."
eas build --platform ios --profile production

echo "✅ Build command completed!"
