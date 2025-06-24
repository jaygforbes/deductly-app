# Building and Submitting Deductly to the App Store

This guide provides detailed instructions for building your Deductly app for production and submitting it to the App Store.

## Prerequisites

Before you begin, make sure you have:

1. **Development Environment**:
   - Node.js and npm installed
   - Expo CLI: `npm install -g expo-cli`
   - EAS CLI: `npm install -g eas-cli`

2. **Accounts and Access**:
   - Apple Developer Program account ($99/year)
   - Expo account
   - Firebase account (for your backend)

3. **Configuration Files**:
   - Updated app.json with correct bundle ID
   - Configured eas.json file
   - App assets (icon, splash screen)

## Step 1: Install Dependencies

First, make sure all dependencies are installed:

```bash
cd /Users/briana/CascadeProjects/deductly-app
npm install
```

## Step 2: Log in to Expo

```bash
eas login
```

Enter your Expo account credentials when prompted.

## Step 3: Configure EAS Build

Ensure your eas.json file is properly configured:

```json
{
  "cli": {
    "version": ">= 0.52.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "ios": {
        "resourceClass": "m1-medium"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID",
        "appleTeamId": "YOUR_APPLE_TEAM_ID",
        "bundleIdentifier": "com.forbesyprojects.deductly"
      }
    }
  }
}
```

## Step 4: Update Your Apple Developer Information

Replace the placeholders in your eas.json file:

1. **appleId**: Your Apple ID email used for the Developer Program
2. **ascAppId**: Your App Store Connect App ID (found in the URL when viewing your app in App Store Connect)
3. **appleTeamId**: Your Apple Developer Team ID (found in the Apple Developer Portal under Membership)

## Step 5: Run Pre-Build Checks

Before building, run these checks:

```bash
# Run linting
npm run lint

# Run tests
npm test
```

Fix any issues that arise before proceeding.

## Step 6: Build Your App for iOS

You have two options for building:

### Option 1: Using the Build Script

```bash
./scripts/build-ios.sh
```

This script will:
- Install dependencies
- Run tests and linting
- Prompt you to update the version if needed
- Build the app using EAS

### Option 2: Using EAS CLI Directly

```bash
eas build --platform ios
```

During the build process:
1. You'll be asked to create or select a provisioning profile
2. EAS will handle the build process on their servers
3. You'll receive a URL to monitor the build progress

## Step 7: Monitor the Build

1. Follow the link provided after starting the build
2. The build typically takes 15-30 minutes
3. You can monitor the logs in real-time

## Step 8: Download the Build

Once the build is complete:
1. Download the IPA file from the EAS dashboard
2. Save it to a location you can easily access

## Step 9: Upload to App Store Connect

### Option 1: Using EAS Submit

```bash
eas submit --platform ios
```

Or use the npm script:

```bash
npm run submit:ios
```

This will:
1. Prompt for your Apple ID credentials
2. Upload the build to App Store Connect
3. Handle the submission process automatically

### Option 2: Using Apple Transporter

1. Download and install [Transporter](https://apps.apple.com/us/app/transporter/id1450874784) from the Mac App Store
2. Open Transporter
3. Sign in with your Apple ID
4. Click the "+" button
5. Select your IPA file
6. Click "Upload"

## Step 10: Wait for Processing

After uploading:
1. Your build will be processed by Apple
2. This typically takes 15-30 minutes
3. You'll receive an email when processing is complete

## Step 11: Complete App Store Connect Information

While waiting for processing:
1. Complete any remaining information in App Store Connect
2. Verify all screenshots and metadata are uploaded
3. Prepare your app review notes

## Step 12: Select Your Build for Review

Once processing is complete:
1. Go to your app in App Store Connect
2. Navigate to the "TestFlight" tab to verify your build is available
3. Go to the "App Store" tab
4. In the "Build" section, click "Select a build"
5. Choose your processed build

## Step 13: Submit for Review

When everything is ready:
1. Click "Submit for Review" at the top of the page
2. Answer the export compliance questions
3. Choose between automatic or manual release
4. Submit your app

## Troubleshooting Common Build Issues

### Build Fails Due to Missing Credentials
- Ensure you're logged in to Expo: `eas login`
- Verify your Apple Developer account is active
- Check that your bundle identifier is registered in the Apple Developer Portal

### Upload Fails
- Ensure your IPA file isn't corrupted
- Verify you have the correct permissions in App Store Connect
- Try using a different upload method (EAS Submit vs. Transporter)

### Processing Issues
- Most processing issues relate to app icons or metadata
- Ensure all required app icons are included
- Verify your app doesn't use private APIs

## Next Steps After Submission

1. **Monitor Review Status**: Check App Store Connect daily
2. **Respond Quickly**: Be ready to address any questions from the review team
3. **Prepare for Launch**: If using manual release, release when ready
4. **Monitor Analytics**: After launch, track downloads and user engagement

Remember that the App Store review process typically takes 1-3 business days. Be patient and be prepared to make any necessary changes if your app is rejected.
