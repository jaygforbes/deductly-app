# Uploading Your Deductly App to App Store Connect

This guide walks you through the process of uploading your built Deductly app to App Store Connect.

## Prerequisites

- Completed iOS build (.ipa file)
- Apple Developer account with access to App Store Connect
- App listing created in App Store Connect
- Transporter app (available on Mac App Store) or Apple Developer account credentials for EAS Submit

## Option 1: Using EAS Submit (Recommended)

EAS Submit is the easiest way to upload your build to App Store Connect directly from the command line.

### 1. Configure EAS Submit

Ensure your `eas.json` file is properly configured with your Apple credentials:

```json
{
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

### 2. Find Your App Store Connect App ID

1. Log in to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to "Apps" and select your Deductly app
3. In the URL, you'll see a string of numbers - this is your `ascAppId`
   Example: `https://appstoreconnect.apple.com/apps/1234567890/...`
   In this example, `1234567890` is your `ascAppId`

### 3. Find Your Apple Team ID

1. Log in to the [Apple Developer Portal](https://developer.apple.com/account)
2. Click on "Membership" in the sidebar
3. Your Team ID is listed under "Team ID"

### 4. Run EAS Submit

Once your `eas.json` is configured, run:

```bash
npm run submit:ios
```

This will:
1. Prompt you for your Apple ID password or app-specific password
2. Upload your build to App Store Connect
3. Provide status updates during the process

## Option 2: Using Transporter

Apple's Transporter app provides a graphical interface for uploading builds.

### 1. Download Transporter

Download and install Transporter from the Mac App Store if you haven't already.

### 2. Launch Transporter

1. Open Transporter
2. Sign in with your Apple ID associated with your developer account

### 3. Add Your Build

1. Click the "+" button
2. Navigate to and select your .ipa file
3. Click "Open"

### 4. Upload Your Build

1. Your app details will be displayed
2. Click "Upload" to begin the upload process
3. Wait for the upload to complete

## After Upload

Regardless of which method you use, after uploading:

1. **Wait for Processing**: Your build will be processed by Apple, which typically takes 15-30 minutes
2. **Check for Issues**: Apple will run automated tests on your build and notify you of any issues
3. **TestFlight Availability**: If you've enabled TestFlight, your build will be available for testing after processing
4. **Prepare for Submission**: Once processing is complete, you can select this build for App Store submission

## Troubleshooting Common Issues

### Invalid Binary
- Ensure your bundle identifier in the build matches what's registered in App Store Connect
- Verify your provisioning profile and certificates are valid
- Check that your app's version and build numbers are higher than any previous uploads

### Authentication Issues
- For EAS Submit: Use an app-specific password instead of your Apple ID password
- For Transporter: Ensure you're using the correct Apple ID with developer access

### Upload Failures
- Check your internet connection
- Verify the .ipa file isn't corrupted
- Try uploading during off-peak hours if Apple's servers are busy

### Processing Issues
- Most processing issues are related to missing or invalid app icons
- Ensure all required app icons are included in your build
- Check that your app doesn't use private APIs

## Next Steps

After your build is successfully uploaded and processed:
1. Complete any remaining App Store Connect information
2. Submit your app for review
3. Monitor the review status in App Store Connect
