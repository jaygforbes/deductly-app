#!/usr/bin/env node
/**
 * EAS Build prebuild hook to ensure the bundle file is properly included
 * This script runs before the EAS build process starts
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ensure directories exist
console.log('Creating necessary directories...');
if (!fs.existsSync('ios')) {
  fs.mkdirSync('ios', { recursive: true });
}
if (!fs.existsSync('ios/assets')) {
  fs.mkdirSync('ios/assets', { recursive: true });
}

// Generate the bundle file
console.log('Generating iOS bundle file...');
try {
  execSync('npx react-native bundle --platform ios --dev false --entry-file App.js --bundle-output ios/main.jsbundle --assets-dest ios/assets', 
    { stdio: 'inherit' }
  );
  
  // Verify the bundle was created
  if (fs.existsSync('ios/main.jsbundle')) {
    const stats = fs.statSync('ios/main.jsbundle');
    console.log(`Bundle file generated successfully (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
  } else {
    console.error('Failed to generate bundle file');
    process.exit(1);
  }
} catch (error) {
  console.error('Error generating bundle file:', error);
  process.exit(1);
}

// Create a simple script to copy the bundle file during the build process
console.log('Creating bundle copy script...');
const scriptContent = `
#!/bin/sh
set -e

echo "Copying bundle file to the app bundle..."
cp "$PROJECT_DIR/../main.jsbundle" "$CONFIGURATION_BUILD_DIR/$UNLOCALIZED_RESOURCES_FOLDER_PATH/"
echo "Bundle file copied successfully!"
`;

const scriptPath = path.join('ios', 'copy-bundle.sh');
fs.writeFileSync(scriptPath, scriptContent);
fs.chmodSync(scriptPath, '755');

console.log('Prebuild hook completed successfully!');
