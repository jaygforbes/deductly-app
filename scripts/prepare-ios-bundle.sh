#!/bin/bash

# prepare-ios-bundle.sh
# Script to prepare the iOS bundle file for EAS builds
# This script handles all aspects of bundle generation and preparation

set -e # Exit on any error

echo "🚀 Starting iOS bundle preparation process"

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p ios
mkdir -p ios/assets

# Install required dependencies if needed
echo "📦 Checking for required dependencies..."
if ! grep -q "@react-native-picker/picker" package.json; then
  echo "📥 Installing @react-native-picker/picker..."
  npm install @react-native-picker/picker
fi

if ! grep -q "expo-sharing" package.json; then
  echo "📥 Installing expo-sharing..."
  npm install expo-sharing
fi

# Generate the bundle file
echo "🔨 Generating iOS bundle file..."
if [ -f "App.js" ]; then
  echo "📱 Using App.js as entry point"
  npx react-native bundle \
    --platform ios \
    --dev false \
    --entry-file App.js \
    --bundle-output ios/main.jsbundle \
    --assets-dest ios/assets
elif [ -f "index.js" ]; then
  echo "📱 Using index.js as entry point"
  npx react-native bundle \
    --platform ios \
    --dev false \
    --entry-file index.js \
    --bundle-output ios/main.jsbundle \
    --assets-dest ios/assets
else
  echo "❌ No entry file (App.js or index.js) found!"
  exit 1
fi

# Verify the bundle was created
if [ -f "ios/main.jsbundle" ]; then
  echo "✅ Bundle file generated successfully at ios/main.jsbundle"
  echo "📊 Bundle file size: $(du -h ios/main.jsbundle | cut -f1)"
else
  echo "❌ Failed to generate bundle file"
  exit 1
fi

# Create a special .bundle directory that EAS will recognize
echo "📦 Creating special bundle directory for EAS..."
mkdir -p ios/.bundle
cp ios/main.jsbundle ios/.bundle/
cp -R ios/assets/* ios/.bundle/

# Create a manifest file to help EAS find the bundle
echo "📝 Creating bundle manifest..."
cat > ios/.bundle/manifest.json << EOF
{
  "bundleType": "ios",
  "entryFile": "App.js",
  "bundleFile": "main.jsbundle",
  "timestamp": "$(date +%s)",
  "generatedBy": "prepare-ios-bundle.sh"
}
EOF

echo "🎉 Bundle preparation completed successfully!"
echo ""
echo "Next steps:"
echo "1. Run EAS build with: eas build --platform ios --profile production"
echo "2. The bundle file should be automatically included in the build"
