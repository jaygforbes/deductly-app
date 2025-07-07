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
