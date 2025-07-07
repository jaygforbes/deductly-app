#!/bin/bash

# generate-ios-bundle-complete.sh
# Comprehensive script to generate iOS bundle file for Deductly app
# This script handles all aspects of bundle generation and verification

set -e # Exit on any error

echo "🚀 Starting iOS bundle generation process"
echo "========================================="

# Step 1: Create necessary directories
echo "📁 Step 1: Creating necessary directories..."
mkdir -p ios
mkdir -p ios/assets
mkdir -p ios/bundle

# Step 2: Install required dependencies
echo "📦 Step 2: Checking for required dependencies..."
if ! grep -q "@react-native-picker/picker" package.json; then
  echo "📥 Installing @react-native-picker/picker..."
  npm install @react-native-picker/picker
fi

if ! grep -q "expo-sharing" package.json; then
  echo "📥 Installing expo-sharing..."
  npm install expo-sharing
fi

# Step 3: Generate the bundle file
echo "🔨 Step 3: Generating iOS bundle file..."

# Determine entry file
if [ -f "App.js" ]; then
  ENTRY_FILE="App.js"
  echo "📱 Using App.js as entry file"
elif [ -f "index.js" ]; then
  ENTRY_FILE="index.js"
  echo "📱 Using index.js as entry file"
else
  echo "❌ No entry file (App.js or index.js) found!"
  exit 1
fi

# Generate the bundle
echo "📦 Generating bundle with entry file: $ENTRY_FILE"
npx react-native bundle \
  --platform ios \
  --dev false \
  --entry-file $ENTRY_FILE \
  --bundle-output ios/main.jsbundle \
  --assets-dest ios/assets

# Verify the bundle was created
if [ -f "ios/main.jsbundle" ]; then
  BUNDLE_SIZE=$(du -h ios/main.jsbundle | cut -f1)
  echo "✅ Bundle file generated successfully at ios/main.jsbundle"
  echo "📊 Bundle file size: $BUNDLE_SIZE"
else
  echo "❌ Failed to generate bundle file"
  exit 1
fi

# Step 4: Create multiple copies of the bundle in different locations for redundancy
echo "📋 Step 4: Creating redundant copies of the bundle..."

# Copy to ios/bundle directory
cp ios/main.jsbundle ios/bundle/
cp -R ios/assets/* ios/bundle/
echo "✅ Copied bundle to ios/bundle/"

# Copy to project root
cp ios/main.jsbundle ./
echo "✅ Copied bundle to project root"

# Create a special .bundle directory that EAS might recognize
mkdir -p ios/.bundle
cp ios/main.jsbundle ios/.bundle/
cp -R ios/assets/* ios/.bundle/
echo "✅ Copied bundle to ios/.bundle/"

# Step 5: Create a manifest file
echo "📝 Step 5: Creating bundle manifest..."
cat > ios/bundle/manifest.json << EOF
{
  "bundleType": "ios",
  "entryFile": "$ENTRY_FILE",
  "bundleFile": "main.jsbundle",
  "timestamp": "$(date +%s)",
  "generatedBy": "generate-ios-bundle-complete.sh"
}
EOF
echo "✅ Created manifest file at ios/bundle/manifest.json"

# Step 6: Create a copy script for Xcode
echo "📜 Step 6: Creating copy script for Xcode..."
cat > ios/copy-bundle.sh << 'EOF'
#!/bin/sh
set -e

echo "Copying bundle file to the app bundle..."

# Try multiple possible locations for the bundle file
if [ -f "$PROJECT_DIR/../ios/main.jsbundle" ]; then
  BUNDLE_PATH="$PROJECT_DIR/../ios/main.jsbundle"
  ASSETS_PATH="$PROJECT_DIR/../ios/assets"
elif [ -f "$PROJECT_DIR/../ios/bundle/main.jsbundle" ]; then
  BUNDLE_PATH="$PROJECT_DIR/../ios/bundle/main.jsbundle"
  ASSETS_PATH="$PROJECT_DIR/../ios/bundle"
elif [ -f "$PROJECT_DIR/../main.jsbundle" ]; then
  BUNDLE_PATH="$PROJECT_DIR/../main.jsbundle"
  ASSETS_PATH="$PROJECT_DIR/../ios/assets"
else
  echo "Error: Could not find main.jsbundle in any location"
  exit 1
fi

# Create the destination directory if it doesn't exist
mkdir -p "$CONFIGURATION_BUILD_DIR/$UNLOCALIZED_RESOURCES_FOLDER_PATH"

# Copy the bundle file
echo "Copying bundle from $BUNDLE_PATH"
cp "$BUNDLE_PATH" "$CONFIGURATION_BUILD_DIR/$UNLOCALIZED_RESOURCES_FOLDER_PATH/"

# Copy assets if they exist
if [ -d "$ASSETS_PATH" ]; then
  echo "Copying assets from $ASSETS_PATH"
  cp -R "$ASSETS_PATH" "$CONFIGURATION_BUILD_DIR/$UNLOCALIZED_RESOURCES_FOLDER_PATH/"
fi

echo "Bundle file copied successfully!"
EOF

chmod +x ios/copy-bundle.sh
echo "✅ Created copy script at ios/copy-bundle.sh"

# Step 7: Verify all files exist
echo "🔍 Step 7: Verifying all files exist..."
FILES_TO_CHECK=(
  "ios/main.jsbundle"
  "ios/bundle/main.jsbundle"
  "ios/bundle/manifest.json"
  "ios/copy-bundle.sh"
  "main.jsbundle"
)

ALL_FILES_EXIST=true
for file in "${FILES_TO_CHECK[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file exists"
  else
    echo "❌ $file does not exist"
    ALL_FILES_EXIST=false
  fi
done

if [ "$ALL_FILES_EXIST" = true ]; then
  echo "✅ All required files exist"
else
  echo "⚠️ Some files are missing"
fi

echo ""
echo "🎉 iOS bundle generation process completed successfully!"
echo ""
echo "Next steps:"
echo "1. Update eas.json to use the bundle file"
echo "2. Run EAS build with: eas build --platform ios --profile production"
