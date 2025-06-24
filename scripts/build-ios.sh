#!/bin/bash

# Exit if any command fails
set -e

echo "🚀 Starting Deductly iOS production build process..."

# Check if eas-cli is installed
if ! command -v eas &> /dev/null; then
    echo "❌ Error: eas-cli is not installed. Installing now..."
    npm install -g eas-cli
fi

# Check if logged in to Expo
eas whoami &> /dev/null || {
    echo "❌ Error: Not logged in to Expo. Please run 'eas login' first."
    exit 1
}

# Validate app.json
echo "✅ Validating app configuration..."
if ! jq -e '.expo.ios.bundleIdentifier' app.json &> /dev/null; then
    echo "❌ Error: Bundle identifier not found in app.json"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci || npm install

# Run tests
echo "🧪 Running tests..."
npm test

# Run linting
echo "🔍 Running linter..."
npm run lint

# Check for any git changes that haven't been committed
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️ Warning: You have uncommitted changes. It's recommended to commit all changes before building."
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Build canceled."
        exit 1
    fi
fi

# Update version
read -p "Current version in app.json is $(jq -r '.expo.version' app.json). Do you want to update it? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter new version number: " VERSION
    TMP_FILE=$(mktemp)
    jq --arg version "$VERSION" '.expo.version = $version' app.json > "$TMP_FILE"
    mv "$TMP_FILE" app.json
    echo "✅ Version updated to $VERSION"
fi

# Build the app
echo "🏗️ Building iOS app..."
echo "This may take a while. You can monitor the build status in the Expo dashboard."
eas build --platform ios --non-interactive

echo "\n🎉 iOS build process initiated successfully!"
echo "\nNext steps:"
echo "1. Wait for the build to complete (check the Expo dashboard)"
echo "2. Download the IPA file"
echo "3. Upload to App Store Connect using Transporter or run 'npm run submit:ios'"
echo "4. Complete the App Store submission in App Store Connect"
