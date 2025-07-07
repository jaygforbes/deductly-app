#!/bin/bash

# Script to generate the iOS bundle file for Expo/React Native
set -e

echo "📦 Generating iOS bundle file for Expo/React Native..."

# Create directories if they don't exist
mkdir -p ios/assets

# Check for required tools
if ! command -v npx &> /dev/null; then
  echo "⚠️ npx not found. Please install Node.js and npm."
  exit 1
fi

# For Expo apps, we need to use the react-native-cli directly with the correct entry point
echo "🔨 Generating bundle using react-native bundle command..."

# The entry point for Expo apps is typically App.js
if [ -f "App.js" ]; then
  echo "📱 Using App.js as entry file"
  npx react-native bundle --platform ios --dev false --entry-file App.js --bundle-output ios/main.jsbundle --assets-dest ios/assets
else
  echo "⚠️ App.js not found, trying index.js"
  
  if [ -f "index.js" ]; then
    echo "📱 Using index.js as entry file"
    npx react-native bundle --platform ios --dev false --entry-file index.js --bundle-output ios/main.jsbundle --assets-dest ios/assets
  else
    echo "⚠️ No entry file found. Please create an App.js or index.js file."
    exit 1
  fi
fi

# Verify the bundle was created
if [ -f "ios/main.jsbundle" ]; then
  echo "✅ Bundle file generated successfully at ios/main.jsbundle"
  echo "📊 Bundle file size: $(du -h ios/main.jsbundle | cut -f1)"
else
  echo "❌ Failed to generate bundle file"
  exit 1
fi

echo "🎉 Bundle generation complete!"
