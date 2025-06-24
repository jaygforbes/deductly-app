#!/bin/bash

# App Store Submission Helper for Deductly
# This script guides you through each step of the App Store submission process

# Text formatting
BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
BLUE="\033[0;34m"
RED="\033[0;31m"
RESET="\033[0m"

# Function to print section headers
print_header() {
  echo -e "\n${BOLD}${BLUE}=== $1 ===${RESET}\n"
}

# Function to print success messages
print_success() {
  echo -e "${GREEN}✅ $1${RESET}"
}

# Function to print warning messages
print_warning() {
  echo -e "${YELLOW}⚠️  $1${RESET}"
}

# Function to print error messages
print_error() {
  echo -e "${RED}❌ $1${RESET}"
}

# Function to prompt for yes/no
prompt_yes_no() {
  while true; do
    read -p "$1 (y/n): " yn
    case $yn in
      [Yy]* ) return 0;;
      [Nn]* ) return 1;;
      * ) echo "Please answer yes (y) or no (n).";;
    esac
  done
}

# Function to check if a command exists
command_exists() {
  command -v "$1" &> /dev/null
}

# Function to check if a file exists
file_exists() {
  [ -f "$1" ]
}

# Function to check if a directory exists
dir_exists() {
  [ -d "$1" ]
}

# Navigate to project root
cd "$(dirname "$0")/.." || exit

print_header "Deductly App Store Submission Helper"
echo "This script will guide you through the process of submitting Deductly to the App Store."
echo "Follow the prompts and complete each step as instructed."
echo

# Step 1: Check environment
print_header "Step 1: Checking Development Environment"

# Check for required tools
missing_tools=false

if ! command_exists node; then
  print_error "Node.js is not installed"
  missing_tools=true
fi

if ! command_exists npm; then
  print_error "npm is not installed"
  missing_tools=true
fi

if ! command_exists expo; then
  print_error "Expo CLI is not installed"
  missing_tools=true
fi

if ! command_exists eas; then
  print_error "EAS CLI is not installed"
  missing_tools=true
fi

if [ "$missing_tools" = true ]; then
  print_warning "Some required tools are missing. Would you like to run the environment setup script?"
  if prompt_yes_no "Run setup script?"; then
    chmod +x ./scripts/setup-dev-environment.sh
    ./scripts/setup-dev-environment.sh
  else
    print_warning "Please install the missing tools manually before continuing"
    exit 1
  fi
else
  print_success "All required tools are installed"
fi

# Check Expo login status
print_warning "Checking Expo login status..."
if ! eas whoami &> /dev/null; then
  print_warning "You are not logged in to Expo. Please log in now."
  eas login
else
  expo_user=$(eas whoami 2>/dev/null)
  print_success "Logged in to Expo as: $expo_user"
fi

# Step 2: Check app configuration
print_header "Step 2: Checking App Configuration"

# Check app.json
if file_exists "./app.json"; then
  bundle_id=$(grep -o '"bundleIdentifier": *"[^"]*"' ./app.json | grep -o '"[^"]*"$' | tr -d '"')
  version=$(grep -o '"version": *"[^"]*"' ./app.json | grep -o '"[^"]*"$' | tr -d '"')
  
  if [ "$bundle_id" = "com.forbesyprojects.deductly" ]; then
    print_success "Bundle ID is correctly set to $bundle_id"
  else
    print_warning "Bundle ID is set to $bundle_id, should be com.forbesyprojects.deductly"
    if prompt_yes_no "Update bundle ID?"; then
      # This is a simplified version - in reality you'd want to use jq for proper JSON manipulation
      sed -i '' 's/"bundleIdentifier": *"[^"]*"/"bundleIdentifier": "com.forbesyprojects.deductly"/g' ./app.json
      print_success "Bundle ID updated to com.forbesyprojects.deductly"
    fi
  fi
  
  print_success "App version is set to $version"
else
  print_error "app.json not found"
  exit 1
fi

# Step 3: Check assets
print_header "Step 3: Checking App Assets"

# Check if assets directory exists
if ! dir_exists "./assets"; then
  print_warning "Assets directory not found. Creating it now..."
  mkdir -p ./assets
fi

# Check for app icon
if ! file_exists "./assets/icon.png"; then
  print_warning "App icon not found at ./assets/icon.png"
  print_warning "You need to create a 1024×1024 pixel app icon"
  
  if prompt_yes_no "Would you like to prepare the app assets directory structure?"; then
    chmod +x ./scripts/prepare-app-store-assets.sh
    ./scripts/prepare-app-store-assets.sh
  fi
else
  print_success "App icon found at ./assets/icon.png"
fi

# Check for splash screen
if ! file_exists "./assets/splash.png"; then
  print_warning "Splash screen not found at ./assets/splash.png"
  print_warning "You need to create a splash screen (recommended size: 2732×2732 pixels)"
else
  print_success "Splash screen found at ./assets/splash.png"
fi

# Step 4: Check screenshots
print_header "Step 4: Checking Screenshots"

# Check if screenshots directory exists
if ! dir_exists "./app-store-assets/screenshots"; then
  print_warning "Screenshots directory not found"
  print_warning "You need to capture screenshots for the App Store"
  
  if prompt_yes_no "Would you like to prepare the screenshots directory structure?"; then
    mkdir -p ./app-store-assets/screenshots/iphone-6.5
    mkdir -p ./app-store-assets/screenshots/iphone-5.5
    mkdir -p ./app-store-assets/screenshots/ipad-pro-12.9
    print_success "Screenshot directories created"
  fi
else
  # Check if screenshots exist
  iphone_65_count=$(find ./app-store-assets/screenshots/iphone-6.5 -type f | wc -l)
  iphone_55_count=$(find ./app-store-assets/screenshots/iphone-5.5 -type f | wc -l)
  ipad_count=$(find ./app-store-assets/screenshots/ipad-pro-12.9 -type f | wc -l)
  
  if [ "$iphone_65_count" -lt 1 ] || [ "$iphone_55_count" -lt 1 ] || [ "$ipad_count" -lt 1 ]; then
    print_warning "Some screenshots are missing. You need at least 1 screenshot for each device size."
    print_warning "Please refer to ./app-store-assets/screenshot-capture-guide.md for instructions."
  else
    print_success "Screenshots found for all required device sizes"
  fi
fi

# Step 5: Check reviewer account
print_header "Step 5: Checking Reviewer Account"

if prompt_yes_no "Have you created a demo account for App Store reviewers?"; then
  print_success "Demo account created"
else
  print_warning "You need to create a demo account for App Store reviewers"
  print_warning "Please refer to ./docs/reviewer-account-setup-guide.md for instructions"
  
  if prompt_yes_no "Would you like to run the reviewer account creation script now?"; then
    if file_exists "./scripts/create-reviewer-account.js"; then
      node ./scripts/create-reviewer-account.js
    else
      print_error "Reviewer account creation script not found"
      print_warning "Please create a demo account manually following the guide"
    fi
  fi
fi

# Step 6: Build the app
print_header "Step 6: Building the App"

if prompt_yes_no "Are you ready to build the app for production?"; then
  if file_exists "./scripts/build-ios.sh"; then
    chmod +x ./scripts/build-ios.sh
    ./scripts/build-ios.sh
  else
    print_warning "Build script not found. Running EAS build directly..."
    eas build --platform ios
  fi
else
  print_warning "You can build the app later by running './scripts/build-ios.sh'"
fi

# Step 7: Submit to App Store
print_header "Step 7: Submitting to App Store Connect"

if prompt_yes_no "Has your build completed successfully?"; then
  if prompt_yes_no "Are you ready to submit the app to App Store Connect?"; then
    if command_exists eas; then
      print_warning "This will upload your build to App Store Connect"
      print_warning "Make sure you have completed all App Store Connect information"
      if prompt_yes_no "Continue with submission?"; then
        eas submit --platform ios
      fi
    else
      print_error "EAS CLI not found"
      print_warning "Please install EAS CLI or use Apple Transporter to upload your build"
    fi
  else
    print_warning "You can submit the app later by running 'eas submit --platform ios'"
  fi
else
  print_warning "Please complete the build process before submitting to App Store Connect"
fi

# Final instructions
print_header "Next Steps"
echo "1. Complete all information in App Store Connect"
echo "2. Submit your app for review"
echo "3. Monitor the review status"
echo "4. Prepare for launch"
echo
echo "Refer to ./docs/app-store-submission-workflow.md for detailed instructions on each step"
echo
print_success "App Store submission helper completed"
