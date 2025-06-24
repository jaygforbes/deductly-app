#!/bin/bash

# Exit if any command fails
set -e

echo "📱 Setting up Deductly screenshot capture..."

# Navigate to project directory
cd "$(dirname "$0")/.."

# Create screenshots directory if it doesn't exist
mkdir -p app-store-assets/screenshots

# Launch simulators and capture screenshots
echo "🚀 Launching iOS Simulators..."

# Function to capture screenshots for a specific device
capture_for_device() {
  DEVICE_NAME=$1
  DEVICE_ID=$2
  OUTPUT_DIR="app-store-assets/screenshots/$DEVICE_NAME"
  
  mkdir -p "$OUTPUT_DIR"
  
  echo "📸 Capturing screenshots for $DEVICE_NAME..."
  
  # Launch simulator
  xcrun simctl boot "$DEVICE_ID"
  
  # Install the app (assuming you have a build)
  # xcrun simctl install "$DEVICE_ID" path/to/your/app.app
  
  # Launch the app
  # xcrun simctl launch "$DEVICE_ID" com.forbesyprojects.deductly
  
  # Wait for app to fully load
  sleep 5
  
  # Capture home screen
  xcrun simctl io "$DEVICE_ID" screenshot "$OUTPUT_DIR/01-home.png"
  
  # Navigate to receipt capture (you would need to script UI interactions)
  # ...
  # xcrun simctl io "$DEVICE_ID" screenshot "$OUTPUT_DIR/02-receipt.png"
  
  # Navigate to mileage tracking
  # ...
  # xcrun simctl io "$DEVICE_ID" screenshot "$OUTPUT_DIR/03-mileage.png"
  
  # Navigate to recurring deductions
  # ...
  # xcrun simctl io "$DEVICE_ID" screenshot "$OUTPUT_DIR/04-recurring.png"
  
  # Navigate to reports
  # ...
  # xcrun simctl io "$DEVICE_ID" screenshot "$OUTPUT_DIR/05-reports.png"
  
  # Shutdown the simulator
  xcrun simctl shutdown "$DEVICE_ID"
}

# Get available devices
echo "📋 Available devices:"
xcrun simctl list devices available

echo ""
echo "⚠️ MANUAL STEP REQUIRED ⚠️"
echo "Please use the above list to identify the device IDs for the following devices:"
echo "1. iPhone 13 Pro Max (or similar 6.5\" device)"
echo "2. iPhone 8 Plus (or similar 5.5\" device)"
echo "3. iPad Pro 12.9\""
echo ""
echo "Then edit this script to add the device IDs and uncomment the capture_for_device calls below."
echo ""

# Uncomment and add device IDs
# capture_for_device "iPhone-6.5" "DEVICE_ID_HERE"
# capture_for_device "iPhone-5.5" "DEVICE_ID_HERE"
# capture_for_device "iPad-Pro" "DEVICE_ID_HERE"

echo "✅ Screenshot capture complete!"
echo "📁 Screenshots saved to app-store-assets/screenshots/"
echo ""
echo "Next steps:"
echo "1. Edit screenshots with marketing overlays if desired"
echo "2. Upload screenshots to App Store Connect"
