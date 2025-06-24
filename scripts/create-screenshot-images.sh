#!/bin/bash

# Script to create screenshot images for App Store submission using sips
# These can be replaced with actual screenshots later

echo "📱 Creating screenshot images for App Store submission..."

# Create directories if they don't exist
SCREENSHOT_DIR="/Users/briana/CascadeProjects/deductly-app/app-store-assets/screenshots"
mkdir -p "$SCREENSHOT_DIR/6.5-inch"
mkdir -p "$SCREENSHOT_DIR/5.5-inch"
mkdir -p "$SCREENSHOT_DIR/12.9-inch-ipad"

# Use the app icon as a base for our screenshots
ICON_PATH="/Users/briana/CascadeProjects/deductly-app/assets/icon.png"

if [ ! -f "$ICON_PATH" ]; then
    echo "❌ Error: App icon not found at $ICON_PATH"
    exit 1
fi

# Function to create a screenshot from the app icon
create_screenshot() {
    local width="$1"
    local height="$2"
    local output_path="$3"
    local feature="$4"
    
    # Copy the icon to a temp file
    cp "$ICON_PATH" "$output_path"
    
    # Resize to the required dimensions
    sips -z "$height" "$width" "$output_path"
    
    echo "✅ Created: $output_path"
}

# iPhone 6.5" Display (1284 × 2778 pixels)
echo "Creating iPhone 6.5\" screenshots..."
create_screenshot 1284 2778 "$SCREENSHOT_DIR/6.5-inch/dashboard.png" "Dashboard"
create_screenshot 1284 2778 "$SCREENSHOT_DIR/6.5-inch/receipts.png" "Receipt Scanning"
create_screenshot 1284 2778 "$SCREENSHOT_DIR/6.5-inch/mileage.png" "Mileage Tracking"
create_screenshot 1284 2778 "$SCREENSHOT_DIR/6.5-inch/categories.png" "Categories"
create_screenshot 1284 2778 "$SCREENSHOT_DIR/6.5-inch/reports.png" "Reports"

# iPhone 5.5" Display (1242 × 2208 pixels)
echo "Creating iPhone 5.5\" screenshots..."
create_screenshot 1242 2208 "$SCREENSHOT_DIR/5.5-inch/dashboard.png" "Dashboard"
create_screenshot 1242 2208 "$SCREENSHOT_DIR/5.5-inch/receipts.png" "Receipt Scanning"
create_screenshot 1242 2208 "$SCREENSHOT_DIR/5.5-inch/mileage.png" "Mileage Tracking"
create_screenshot 1242 2208 "$SCREENSHOT_DIR/5.5-inch/categories.png" "Categories"
create_screenshot 1242 2208 "$SCREENSHOT_DIR/5.5-inch/reports.png" "Reports"

# iPad Pro 12.9" (2048 × 2732 pixels)
echo "Creating iPad Pro 12.9\" screenshots..."
create_screenshot 2048 2732 "$SCREENSHOT_DIR/12.9-inch-ipad/dashboard.png" "Dashboard"
create_screenshot 2048 2732 "$SCREENSHOT_DIR/12.9-inch-ipad/receipts.png" "Receipt Scanning"
create_screenshot 2048 2732 "$SCREENSHOT_DIR/12.9-inch-ipad/mileage.png" "Mileage Tracking"
create_screenshot 2048 2732 "$SCREENSHOT_DIR/12.9-inch-ipad/categories.png" "Categories"
create_screenshot 2048 2732 "$SCREENSHOT_DIR/12.9-inch-ipad/reports.png" "Reports"

echo "✅ All screenshot images created in $SCREENSHOT_DIR"
echo "Note: These are placeholder images. Replace them with actual screenshots before final submission."
