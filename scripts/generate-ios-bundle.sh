#!/bin/bash

# Script to generate iOS bundle file for Deductly app
set -e

echo "🚀 Starting iOS bundle generation process"

# Ensure directories exist
echo "📁 Creating necessary directories..."
mkdir -p ios/assets

# Check for and install required dependencies
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

# Try with App.js as entry point
if [ -f "App.js" ]; then
  echo "📱 Using App.js as entry point"
  npx react-native bundle --platform ios --dev false --entry-file App.js --bundle-output ios/main.jsbundle --assets-dest ios/assets
elif [ -f "index.js" ]; then
  # Fall back to index.js if App.js doesn't exist
  echo "📱 Using index.js as entry point"
  npx react-native bundle --platform ios --dev false --entry-file index.js --bundle-output ios/main.jsbundle --assets-dest ios/assets
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

# Create a script to copy the bundle during build
echo "📝 Creating bundle copy script for Xcode..."
cat > ios/copy-bundle.sh << 'EOF'
#!/bin/sh
set -e

echo "Copying bundle file to the app bundle..."
cp "$PROJECT_DIR/../main.jsbundle" "$CONFIGURATION_BUILD_DIR/$UNLOCALIZED_RESOURCES_FOLDER_PATH/"
echo "Bundle file copied successfully!"
EOF

chmod +x ios/copy-bundle.sh

echo "🎉 Bundle generation process completed successfully!"
echo ""
echo "Next steps:"
echo "1. Make sure the bundle file is included in your Xcode project"
echo "2. Update your eas.json to use this bundle file"
echo "3. Run EAS build with: eas build --platform ios --profile production"
