#!/bin/bash

# xcode-bundle-phase.sh
# This script is designed to be added as a Run Script Build Phase in Xcode
# It will copy the main.jsbundle file to the app bundle during the build process

set -e # Exit on any error

echo "📦 Deductly iOS Bundle Copy Script"
echo "=================================="

# Define possible locations for the bundle file
POSSIBLE_BUNDLE_LOCATIONS=(
  "$PROJECT_DIR/../main.jsbundle"
  "$PROJECT_DIR/../ios/main.jsbundle"
  "$PROJECT_DIR/../ios/bundle/main.jsbundle"
  "$PROJECT_DIR/main.jsbundle"
  "$PROJECT_DIR/bundle/main.jsbundle"
)

# Find the bundle file
BUNDLE_FOUND=false
for BUNDLE_PATH in "${POSSIBLE_BUNDLE_LOCATIONS[@]}"; do
  if [ -f "$BUNDLE_PATH" ]; then
    echo "✅ Found bundle at: $BUNDLE_PATH"
    BUNDLE_FOUND=true
    break
  fi
done

if [ "$BUNDLE_FOUND" = false ]; then
  echo "❌ Could not find main.jsbundle in any location!"
  echo "Attempting to generate bundle..."
  
  # Determine entry file
  if [ -f "$PROJECT_DIR/../App.js" ]; then
    ENTRY_FILE="$PROJECT_DIR/../App.js"
  elif [ -f "$PROJECT_DIR/../index.js" ]; then
    ENTRY_FILE="$PROJECT_DIR/../index.js"
  else
    echo "❌ No entry file found!"
    exit 1
  fi
  
  # Generate bundle on the fly
  echo "Generating bundle with entry file: $ENTRY_FILE"
  cd "$PROJECT_DIR/.."
  npx react-native bundle \
    --platform ios \
    --dev false \
    --entry-file $(basename $ENTRY_FILE) \
    --bundle-output ios/main.jsbundle \
    --assets-dest ios/assets
  
  if [ -f "ios/main.jsbundle" ]; then
    BUNDLE_PATH="$PROJECT_DIR/../ios/main.jsbundle"
    echo "✅ Generated bundle at: $BUNDLE_PATH"
  else
    echo "❌ Failed to generate bundle!"
    exit 1
  fi
fi

# Create the destination directory
echo "Creating destination directory..."
mkdir -p "$CONFIGURATION_BUILD_DIR/$UNLOCALIZED_RESOURCES_FOLDER_PATH"

# Copy the bundle file
echo "Copying bundle to: $CONFIGURATION_BUILD_DIR/$UNLOCALIZED_RESOURCES_FOLDER_PATH/"
cp "$BUNDLE_PATH" "$CONFIGURATION_BUILD_DIR/$UNLOCALIZED_RESOURCES_FOLDER_PATH/"

# Copy assets if they exist
ASSETS_DIR="${BUNDLE_PATH%/*}/assets"
if [ -d "$ASSETS_DIR" ]; then
  echo "Copying assets from: $ASSETS_DIR"
  cp -R "$ASSETS_DIR" "$CONFIGURATION_BUILD_DIR/$UNLOCALIZED_RESOURCES_FOLDER_PATH/"
else
  echo "No assets directory found at: $ASSETS_DIR"
  
  # Try alternative assets locations
  ALT_ASSETS_DIR="$PROJECT_DIR/../ios/assets"
  if [ -d "$ALT_ASSETS_DIR" ]; then
    echo "Copying assets from alternative location: $ALT_ASSETS_DIR"
    cp -R "$ALT_ASSETS_DIR" "$CONFIGURATION_BUILD_DIR/$UNLOCALIZED_RESOURCES_FOLDER_PATH/"
  fi
fi

echo "✅ Bundle copy completed successfully!"
