#!/bin/bash

# Script to create placeholder screenshots for App Store submission
# These can be replaced with actual screenshots later

echo "📱 Creating placeholder screenshots for App Store submission..."

# Create directories if they don't exist
SCREENSHOT_DIR="/Users/briana/CascadeProjects/deductly-app/app-store-assets/screenshots"
mkdir -p "$SCREENSHOT_DIR/6.5-inch"
mkdir -p "$SCREENSHOT_DIR/5.5-inch"
mkdir -p "$SCREENSHOT_DIR/12.9-inch-ipad"

# Function to create a placeholder image with text
create_placeholder() {
    local size="$1"
    local output_path="$2"
    local feature="$3"
    
    # Use the convert command if available, otherwise create a text file with instructions
    if command -v convert &> /dev/null; then
        convert -size "$size" canvas:white -font Arial -pointsize 40 -fill black -gravity center \
        -annotate 0 "Deductly\n$feature" "$output_path"
        echo "✅ Created: $output_path"
    else
        echo "⚠️ ImageMagick not installed. Creating placeholder text file instead."
        echo "Placeholder for: Deductly - $feature ($size)" > "${output_path%.png}.txt"
        echo "✅ Created: ${output_path%.png}.txt"
    fi
}

# iPhone 6.5" Display (1284 × 2778 pixels)
echo "Creating iPhone 6.5\" screenshots..."
create_placeholder "1284x2778" "$SCREENSHOT_DIR/6.5-inch/dashboard.png" "Dashboard"
create_placeholder "1284x2778" "$SCREENSHOT_DIR/6.5-inch/receipts.png" "Receipt Scanning"
create_placeholder "1284x2778" "$SCREENSHOT_DIR/6.5-inch/mileage.png" "Mileage Tracking"
create_placeholder "1284x2778" "$SCREENSHOT_DIR/6.5-inch/categories.png" "Categories"
create_placeholder "1284x2778" "$SCREENSHOT_DIR/6.5-inch/reports.png" "Reports"

# iPhone 5.5" Display (1242 × 2208 pixels)
echo "Creating iPhone 5.5\" screenshots..."
create_placeholder "1242x2208" "$SCREENSHOT_DIR/5.5-inch/dashboard.png" "Dashboard"
create_placeholder "1242x2208" "$SCREENSHOT_DIR/5.5-inch/receipts.png" "Receipt Scanning"
create_placeholder "1242x2208" "$SCREENSHOT_DIR/5.5-inch/mileage.png" "Mileage Tracking"
create_placeholder "1242x2208" "$SCREENSHOT_DIR/5.5-inch/categories.png" "Categories"
create_placeholder "1242x2208" "$SCREENSHOT_DIR/5.5-inch/reports.png" "Reports"

# iPad Pro 12.9" (2048 × 2732 pixels)
echo "Creating iPad Pro 12.9\" screenshots..."
create_placeholder "2048x2732" "$SCREENSHOT_DIR/12.9-inch-ipad/dashboard.png" "Dashboard"
create_placeholder "2048x2732" "$SCREENSHOT_DIR/12.9-inch-ipad/receipts.png" "Receipt Scanning"
create_placeholder "2048x2732" "$SCREENSHOT_DIR/12.9-inch-ipad/mileage.png" "Mileage Tracking"
create_placeholder "2048x2732" "$SCREENSHOT_DIR/12.9-inch-ipad/categories.png" "Categories"
create_placeholder "2048x2732" "$SCREENSHOT_DIR/12.9-inch-ipad/reports.png" "Reports"

echo "✅ All placeholder screenshots created in $SCREENSHOT_DIR"
echo "Note: These are placeholder images. Replace them with actual screenshots before final submission."
