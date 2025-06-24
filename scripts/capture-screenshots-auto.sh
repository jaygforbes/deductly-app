#!/bin/bash

# Automated Screenshot Capture Script for Deductly App
# This script helps capture screenshots from iOS simulators for App Store submission

echo "🔍 Deductly App Store Screenshot Capture Tool"
echo "============================================="

# Check if xcrun is available
if ! command -v xcrun &> /dev/null; then
    echo "❌ Error: xcrun command not found. Please make sure Xcode is installed."
    exit 1
fi

# Base directory for screenshots
SCREENSHOT_DIR="/Users/briana/CascadeProjects/deductly-app/app-store-assets/screenshots"

# Create directories if they don't exist
mkdir -p "$SCREENSHOT_DIR/6.5-inch"
mkdir -p "$SCREENSHOT_DIR/5.5-inch"
mkdir -p "$SCREENSHOT_DIR/12.9-inch-ipad"

# Function to list available simulators
list_simulators() {
    echo "📱 Available Simulators:"
    xcrun simctl list devices available | grep -v "unavailable" | grep -v "disconnected"
}

# Function to capture a screenshot
capture_screenshot() {
    local device_id=$1
    local output_path=$2
    local screen_name=$3
    
    echo "📸 Capturing screenshot for $screen_name..."
    xcrun simctl io "$device_id" screenshot "$output_path"
    
    if [ $? -eq 0 ]; then
        echo "✅ Screenshot saved to: $output_path"
    else
        echo "❌ Failed to capture screenshot"
    fi
}

# Main menu
echo ""
echo "This script will help you capture screenshots for App Store submission."
echo "Before proceeding, make sure you have:"
echo "  1. Launched your app in the simulator"
echo "  2. Navigated to the screen you want to capture"
echo "  3. Set up the app with demo data"
echo ""

# List available simulators
list_simulators

echo ""
echo "To capture a screenshot:"
echo "1. Note the UDID of the simulator you want to use from the list above"
echo "2. Run the following command (replace with your values):"
echo ""
echo "   xcrun simctl io SIMULATOR_UDID screenshot $SCREENSHOT_DIR/6.5-inch/screenshot1.png"
echo ""
echo "3. Repeat for each screen you want to capture"
echo ""
echo "Required screenshots for each device size:"
echo "- Home/Dashboard screen"
echo "- Receipt scanning feature"
echo "- Mileage tracking with map"
echo "- Expense categories/organization"
echo "- Reports or analytics view"
echo ""
echo "For more detailed instructions, see: $SCREENSHOT_DIR/../screenshot-guide.md"
