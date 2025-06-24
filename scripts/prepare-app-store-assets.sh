#!/bin/bash

# Prepare App Store Assets for Deductly
# This script will create directories and placeholder files for App Store submission

echo "🎨 Preparing App Store assets for Deductly..."

# Create necessary directories
mkdir -p ../app-store-assets/screenshots/iphone-6.5
mkdir -p ../app-store-assets/screenshots/iphone-5.5
mkdir -p ../app-store-assets/screenshots/ipad-pro-12.9
mkdir -p ../app-store-assets/app-icon
mkdir -p ../app-store-assets/preview-videos

# Create placeholder files with instructions
cat > ../app-store-assets/screenshots/README.md << 'EOL'
# App Store Screenshots

This directory contains screenshots for the App Store submission.

## Required Screenshot Sizes

1. **6.5" Display** (iPhone 13 Pro Max, 12 Pro Max)
   - 1284 × 2778 pixels portrait
   - 2778 × 1284 pixels landscape

2. **5.5" Display** (iPhone 8 Plus)
   - 1242 × 2208 pixels portrait
   - 2208 × 1242 pixels landscape

3. **12.9" iPad Pro**
   - 2048 × 2732 pixels portrait
   - 2732 × 2048 pixels landscape

## Screenshot Naming Convention

Name your screenshots using this format:
`<device>_<feature>_<number>.png`

Example: `iphone-6.5_home_01.png`

## Required Screenshots

For each device size, create at least these screenshots:
1. Home screen with summary dashboard
2. Receipt scanning feature
3. Mileage tracking with map
4. Recurring deductions management
5. Reports and analytics

See the screenshot-capture-guide.md for detailed instructions.
EOL

cat > ../app-store-assets/app-icon/README.md << 'EOL'
# App Icon Requirements

## App Store Icon
- 1024×1024 pixels
- RGB color space
- Flattened with no transparency
- No rounded corners (App Store will add rounding)
- PNG or JPEG format

Place your App Store icon in this directory named `app-store-icon.png`.
EOL

cat > ../app-store-assets/preview-videos/README.md << 'EOL'
# App Preview Videos

App Preview videos appear in the App Store and give users a better sense of your app's experience.

## Video Requirements

- 15-30 seconds in length
- Captured at device native resolution
- H.264 compression, 30 fps
- No people interacting with the device
- App UI and functionality only

Place your preview videos in this directory using this naming convention:
`<device>_preview.mp4`

Example: `iphone-6.5_preview.mp4`

See the screenshot-capture-guide.md for detailed instructions on creating effective preview videos.
EOL

echo "✅ App Store asset directories and instructions created!"
echo ""
echo "Next steps:"
echo "1. Create your app icon following the instructions in app-store-assets/app-icon/README.md"
echo "2. Capture screenshots following the instructions in app-store-assets/screenshots/README.md"
echo "3. Create preview videos (optional) following the instructions in app-store-assets/preview-videos/README.md"
echo ""
