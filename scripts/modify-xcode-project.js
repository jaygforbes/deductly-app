// modify-xcode-project.js
// This script modifies the Xcode project to include a custom build phase for bundling
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Function to generate the bundle
function generateBundle() {
  console.log('Generating iOS bundle...');
  
  try {
    // Create directories if they don't exist
    if (!fs.existsSync('ios/bundle')) {
      fs.mkdirSync('ios/bundle', { recursive: true });
    }
    
    // Generate the bundle
    execSync(
      'npx react-native bundle --platform ios --dev false --entry-file App.js --bundle-output ios/bundle/main.jsbundle --assets-dest ios/bundle',
      { stdio: 'inherit' }
    );
    
    console.log('Bundle generated successfully!');
    return true;
  } catch (error) {
    console.error('Error generating bundle:', error);
    return false;
  }
}

// Function to create a build phase script
function createBuildPhaseScript() {
  const scriptContent = `
#!/bin/sh
set -e

# Create bundle directory if it doesn't exist
mkdir -p "$CONFIGURATION_BUILD_DIR/$UNLOCALIZED_RESOURCES_FOLDER_PATH"

# Copy the bundle file
echo "Copying bundle file to the app bundle..."
cp "$PROJECT_DIR/../bundle/main.jsbundle" "$CONFIGURATION_BUILD_DIR/$UNLOCALIZED_RESOURCES_FOLDER_PATH/"

# Copy assets
echo "Copying assets to the app bundle..."
cp -R "$PROJECT_DIR/../bundle/assets" "$CONFIGURATION_BUILD_DIR/$UNLOCALIZED_RESOURCES_FOLDER_PATH/"

echo "Bundle files copied successfully!"
`;

  // Write the script to a file
  const scriptPath = path.join('ios', 'copy-bundle.sh');
  fs.writeFileSync(scriptPath, scriptContent);
  fs.chmodSync(scriptPath, '755');
  
  console.log('Build phase script created at ios/copy-bundle.sh');
}

// Main function
async function main() {
  console.log('Starting Xcode project modification...');
  
  // Generate the bundle
  const bundleGenerated = generateBundle();
  if (!bundleGenerated) {
    console.error('Failed to generate bundle. Exiting.');
    process.exit(1);
  }
  
  // Create the build phase script
  createBuildPhaseScript();
  
  console.log('Xcode project modification completed successfully!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Update eas.json to include the bundle in the build process');
  console.log('2. Run EAS build with: eas build --platform ios --profile production');
}

// Run the script
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
