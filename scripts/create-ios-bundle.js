#!/usr/bin/env node

/**
 * create-ios-bundle.js
 * Script to create the iOS bundle for the Deductly app
 * This script is referenced in app.json and will be used during the EAS build process
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Log with timestamp
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

// Main function
function main() {
  log('Starting iOS bundle creation process');

  try {
    // Create necessary directories
    log('Creating necessary directories');
    if (!fs.existsSync('ios')) {
      fs.mkdirSync('ios', { recursive: true });
    }
    if (!fs.existsSync('ios/bundle')) {
      fs.mkdirSync('ios/bundle', { recursive: true });
    }
    if (!fs.existsSync('ios/bundle/assets')) {
      fs.mkdirSync('ios/bundle/assets', { recursive: true });
    }

    // Check for entry file
    let entryFile = 'App.js';
    if (!fs.existsSync(entryFile)) {
      log(`Entry file ${entryFile} not found, trying index.js`);
      entryFile = 'index.js';
      if (!fs.existsSync(entryFile)) {
        throw new Error('No entry file (App.js or index.js) found');
      }
    }

    // Generate the bundle
    log(`Generating iOS bundle with entry file: ${entryFile}`);
    execSync(
      `npx react-native bundle --platform ios --dev false --entry-file ${entryFile} --bundle-output ios/bundle/main.jsbundle --assets-dest ios/bundle/assets`,
      { stdio: 'inherit' }
    );

    // Verify the bundle was created
    if (fs.existsSync('ios/bundle/main.jsbundle')) {
      const stats = fs.statSync('ios/bundle/main.jsbundle');
      log(`Bundle file generated successfully (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
    } else {
      throw new Error('Failed to generate bundle file');
    }

    // Create a manifest file
    log('Creating bundle manifest');
    const manifest = {
      bundleType: 'ios',
      entryFile,
      bundleFile: 'main.jsbundle',
      timestamp: Date.now(),
      generatedBy: 'create-ios-bundle.js'
    };
    fs.writeFileSync('ios/bundle/manifest.json', JSON.stringify(manifest, null, 2));

    // Create a copy script for Xcode
    log('Creating copy script for Xcode');
    const scriptContent = `
#!/bin/sh
set -e

echo "Copying bundle file to the app bundle..."
mkdir -p "$CONFIGURATION_BUILD_DIR/$UNLOCALIZED_RESOURCES_FOLDER_PATH"
cp "$PROJECT_DIR/../bundle/main.jsbundle" "$CONFIGURATION_BUILD_DIR/$UNLOCALIZED_RESOURCES_FOLDER_PATH/"
cp -R "$PROJECT_DIR/../bundle/assets/"* "$CONFIGURATION_BUILD_DIR/$UNLOCALIZED_RESOURCES_FOLDER_PATH/"
echo "Bundle file copied successfully!"
`;
    fs.writeFileSync('ios/bundle/copy-bundle.sh', scriptContent);
    fs.chmodSync('ios/bundle/copy-bundle.sh', '755');

    log('iOS bundle creation completed successfully');
    return 0;
  } catch (error) {
    log(`Error: ${error.message}`);
    console.error(error);
    return 1;
  }
}

// Run the script
const exitCode = main();
process.exit(exitCode);
