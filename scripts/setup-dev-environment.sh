#!/bin/bash

# Setup Development Environment for Deductly App Store Submission
# This script will install and configure all necessary tools

echo "🚀 Setting up development environment for Deductly App Store submission..."

# Check for Homebrew and install if not present
if ! command -v brew &> /dev/null; then
  echo "Installing Homebrew..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
  echo "✅ Homebrew already installed"
fi

# Check for Node.js and install if not present
if ! command -v node &> /dev/null; then
  echo "Installing Node.js..."
  brew install node
else
  echo "✅ Node.js already installed: $(node --version)"
fi

# Check for npm and install if not present
if ! command -v npm &> /dev/null; then
  echo "Installing npm..."
  brew install npm
else
  echo "✅ npm already installed: $(npm --version)"
fi

# Install or update Expo CLI
if ! command -v expo &> /dev/null; then
  echo "Installing Expo CLI..."
  npm install -g expo-cli
else
  echo "✅ Expo CLI already installed: $(expo --version)"
  echo "Updating Expo CLI..."
  npm update -g expo-cli
fi

# Install or update EAS CLI
if ! command -v eas &> /dev/null; then
  echo "Installing EAS CLI..."
  npm install -g eas-cli
else
  echo "✅ EAS CLI already installed: $(eas --version)"
  echo "Updating EAS CLI..."
  npm update -g eas-cli
fi

# Install project dependencies
echo "Installing project dependencies..."
cd "$(dirname "$0")/.." || exit
npm install

# Check for jq (used in build scripts)
if ! command -v jq &> /dev/null; then
  echo "Installing jq..."
  brew install jq
else
  echo "✅ jq already installed: $(jq --version)"
fi

# Make build scripts executable
chmod +x ./scripts/*.sh

echo "✅ Development environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Run 'eas login' to log in to your Expo account"
echo "2. Follow the App Store submission guides in the docs/ directory"
echo ""
