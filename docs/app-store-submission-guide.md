# Complete App Store Submission Guide for Deductly

This guide provides a step-by-step process for submitting your Deductly app to the Apple App Store.

## Step 1: Final App Preparation

### Update App Version
1. Open `app.json`
2. Update the `version` field (e.g., "1.0.0")
3. Update the `ios.buildNumber` field (e.g., "1")

### Run Final Tests
1. Complete all items in the pre-submission testing checklist
2. Test on multiple iOS devices if possible
3. Fix any bugs or issues discovered

## Step 2: Build Your App for Production

### Option 1: Using the Build Script
```bash
cd /Users/briana/CascadeProjects/deductly-app
./scripts/build-ios.sh
```

### Option 2: Using EAS CLI Directly
```bash
cd /Users/briana/CascadeProjects/deductly-app
eas build --platform ios
```

### After Building
1. Wait for the build to complete (monitor in Expo dashboard)
2. Download the IPA file when ready

## Step 3: App Store Connect Setup

### Log in to App Store Connect
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Sign in with your Apple Developer account

### Complete App Information
1. Navigate to "My Apps" and select Deductly
2. Fill in all required metadata:
   - App name: "Deductly"
   - Subtitle: "Tax Deduction Tracker"
   - Category: "Finance" (Primary) and "Productivity" (Secondary)
   - Keywords: Use the keywords from app-description.md
   - Description: Copy from app-description.md
   - Support URL: https://deductly.com/support
   - Marketing URL: https://deductly.com
   - Privacy Policy URL: https://deductly.com/privacy

### Add App Store Assets
1. Upload app screenshots for all required device sizes
2. Upload your app icon (1024x1024 pixels)
3. Add app preview videos (optional but recommended)

## Step 4: Upload Your Build

### Option 1: Using EAS Submit
```bash
cd /Users/briana/CascadeProjects/deductly-app
npm run submit:ios
```

### Option 2: Using Transporter
1. Open Transporter app
2. Sign in with your Apple ID
3. Click "+" and select your IPA file
4. Click "Upload"

### After Upload
1. Wait for the build to process (15-30 minutes)
2. Check for any issues reported by App Store Connect

## Step 5: Prepare for App Review

### Create a Demo Account
1. Create a reviewer account with sample data
2. Test the account to ensure everything works

### Complete App Review Information
1. In App Store Connect, go to "App Review Information"
2. Add contact information for review team
3. Add demo account credentials:
   - Email: reviewer@deductly.com
   - Password: Deductly2025Review!
4. Add notes for the review team (see app-review-preparation-guide.md)

### Answer Content Rights Questions
1. Answer "No" if your app doesn't contain third-party content
2. If "Yes", provide documentation of your rights to use the content

### Complete Export Compliance
1. Answer "No" if your app doesn't use encryption
2. If "Yes", provide details about the encryption used

## Step 6: Set Pricing and Availability

### Set Your App's Price
1. Go to "Pricing and Availability"
2. Select your price tier
3. Choose availability by territory

### Select Distribution Options
1. Choose between "Automatic release" or "Manual release"
2. For first-time submissions, "Manual release" gives you more control

## Step 7: Submit for Review

### Final Verification
1. Ensure all required fields are completed
2. Check that your build has been processed successfully
3. Verify that your app meets all App Store guidelines

### Submit Your App
1. Click "Submit for Review" button
2. Confirm your submission

## Step 8: Monitor Review Status

### During Review
1. Check App Store Connect daily for status updates
2. Be available to respond to any questions from the review team
3. Review typically takes 1-3 business days

### If Rejected
1. Address all issues mentioned in the rejection
2. Make necessary changes to your app
3. Submit a new build if required
4. Resubmit for review

### If Approved
1. If using manual release, release when ready
2. If using automatic release, your app will go live automatically

## Step 9: Post-Launch Activities

### Monitor Analytics
1. Use App Store Connect analytics to track downloads
2. Monitor user feedback and reviews
3. Address any issues in future updates

### Plan Updates
1. Begin working on bug fixes and improvements
2. Plan feature enhancements based on user feedback
3. Prepare marketing activities to promote your app

## Important Resources

- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [TestFlight Beta Testing](https://developer.apple.com/testflight/)
- [App Store Promotion](https://developer.apple.com/app-store/promote/)

## Contact Information

If you encounter any issues during the submission process, contact:
- Apple Developer Support: https://developer.apple.com/contact/
- Expo Support: https://expo.dev/support
