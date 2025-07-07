// app.config.js
// Dynamic configuration for Expo
// This file takes precedence over app.json

const fs = require('fs');
const path = require('path');

// Check if the bundle file exists
const bundleExists = fs.existsSync(path.join(__dirname, 'main.jsbundle'));
const iosBundleExists = fs.existsSync(path.join(__dirname, 'ios', 'main.jsbundle'));

// Base configuration from app.json
const config = require('./app.json');

// Add hooks configuration for iOS
if (config.expo.hooks === undefined) {
  config.expo.hooks = {};
}

// Add postPublish hook to copy the bundle file
config.expo.hooks.postPublish = [
  {
    file: "scripts/xcode-bundle-phase.sh",
    config: {}
  }
];

// Modify iOS configuration to include bundle
if (config.expo.ios) {
  // Set jsEngine to hermes for better performance
  config.expo.ios.jsEngine = 'hermes';
  
  // Add bundleCommand if bundle exists
  if (bundleExists || iosBundleExists) {
    console.log('Bundle file found, configuring iOS build to use it');
    config.expo.ios.bundleCommand = 'echo "Using pre-generated bundle"';
  }
}

// Export the modified configuration
module.exports = config;
