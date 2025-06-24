#!/bin/bash

# Create a splash screen for Deductly app
# This script creates a simple splash screen with the app icon centered on a white background

echo "Creating splash screen for Deductly..."

# Check if icon exists
if [ ! -f "/Users/briana/CascadeProjects/deductly-app/assets/icon.png" ]; then
  echo "Error: App icon not found at /Users/briana/CascadeProjects/deductly-app/assets/icon.png"
  exit 1
fi

# Create a blank 2732×2732 white canvas
sips -z 2732 2732 "/Users/briana/CascadeProjects/deductly-app/assets/icon.png" --padColor FFFFFF --padToSize 2732 2732 --out "/Users/briana/CascadeProjects/deductly-app/assets/splash.png"

echo "✅ Splash screen created at /Users/briana/CascadeProjects/deductly-app/assets/splash.png"
echo "You can now use this splash screen for your Expo app."
