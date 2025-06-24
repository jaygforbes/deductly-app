# Deductly App Store Submission Workflow

This document provides a step-by-step workflow to guide you through the entire App Store submission process for Deductly.

## Phase 1: Preparation (2-3 days)

### Day 1: Environment Setup and Asset Creation

1. **Set up your development environment**
   ```bash
   # Make the setup script executable
   chmod +x /Users/briana/CascadeProjects/deductly-app/scripts/setup-dev-environment.sh
   
   # Run the setup script
   /Users/briana/CascadeProjects/deductly-app/scripts/setup-dev-environment.sh
   
   # Log in to Expo
   eas login
   ```

2. **Prepare app assets directory structure**
   ```bash
   # Make the asset preparation script executable
   chmod +x /Users/briana/CascadeProjects/deductly-app/scripts/prepare-app-store-assets.sh
   
   # Run the asset preparation script
   /Users/briana/CascadeProjects/deductly-app/scripts/prepare-app-store-assets.sh
   ```

3. **Create your app icon**
   - Create a 1024×1024 pixel app icon following the guidelines in `/app-store-assets/app-icon/README.md`
   - Place it in the `/app-store-assets/app-icon/` directory
   - Also place it at `/assets/icon.png` for the Expo build

4. **Create your splash screen**
   - Create a 2732×2732 pixel splash screen with your logo centered
   - Place it at `/assets/splash.png` for the Expo build

### Day 2: Screenshot Capture and App Store Connect Setup

1. **Capture screenshots for all required device sizes**
   - Follow the instructions in `/app-store-assets/screenshot-capture-guide.md`
   - Use the Xcode simulator to capture screenshots for:
     - iPhone 6.5" Display
     - iPhone 5.5" Display
     - iPad Pro 12.9" Display
   - Add marketing overlays and captions to highlight key features

2. **Create app preview videos (optional but recommended)**
   - Follow the instructions in `/app-store-assets/preview-videos/README.md`
   - Create 15-30 second videos showcasing key features

3. **Set up your app in App Store Connect**
   - Follow the instructions in `/docs/app-store-connect-setup-guide.md`
   - Create a new app with bundle ID `com.forbesyprojects.deductly`
   - Fill in basic information (name, privacy policy URL, etc.)

### Day 3: Demo Account Creation and Final Testing

1. **Create a demo account for reviewers**
   ```bash
   # Run the reviewer account creation script
   node /Users/briana/CascadeProjects/deductly-app/scripts/create-reviewer-account.js
   ```

2. **Verify the demo account**
   - Log in with the reviewer credentials
   - Check that all sample data appears correctly
   - Test all app features with the sample data

3. **Perform final testing**
   - Use the checklist in `/docs/final-submission-checklist.md`
   - Test on multiple devices if possible
   - Test in both online and offline modes
   - Verify all permissions work correctly

## Phase 2: Build and Submit (1-2 days)

### Day 4: Build Your App

1. **Verify your eas.json configuration**
   - Check that your Apple credentials are correctly configured
   - Verify the bundle identifier is set to `com.forbesyprojects.deductly`

2. **Build your app for production**
   ```bash
   # Make the build script executable
   chmod +x /Users/briana/CascadeProjects/deductly-app/scripts/build-ios.sh
   
   # Run the build script
   /Users/briana/CascadeProjects/deductly-app/scripts/build-ios.sh
   ```

3. **Monitor the build process**
   - Follow the link provided after starting the build
   - Wait for the build to complete (15-30 minutes)
   - Download the IPA file when ready

### Day 5: Submit to App Store Connect

1. **Upload your build**
   ```bash
   # Using EAS Submit
   npm run submit:ios
   ```
   
   Or use Apple Transporter:
   - Download Transporter from the Mac App Store
   - Open Transporter and sign in with your Apple ID
   - Upload your IPA file

2. **Wait for processing**
   - Your build will be processed by Apple (15-30 minutes)
   - You'll receive an email when processing is complete

3. **Complete App Store Connect information**
   - Upload screenshots and preview videos
   - Complete all metadata (description, keywords, etc.)
   - Add review information including demo account credentials
   - Answer all compliance questions

4. **Submit for review**
   - Select your build in the "Build" section
   - Click "Submit for Review"
   - Choose between automatic or manual release
   - Submit your app

## Phase 3: Review and Launch (3-7 days)

### During Review (1-3 days)

1. **Monitor review status**
   - Check App Store Connect daily
   - Be ready to respond to any questions from the review team

2. **Prepare for launch**
   - Finalize marketing materials
   - Prepare social media announcements
   - Set up analytics tracking

### After Approval

1. **If using manual release**
   - Release when ready by clicking "Release This Version"
   - Monitor the rollout process

2. **If using automatic release**
   - Your app will go live automatically
   - Monitor the App Store for your app's appearance

### First Week After Launch

1. **Monitor user feedback**
   - Respond to App Store reviews
   - Address any critical issues

2. **Analyze performance**
   - Check download statistics
   - Review analytics data
   - Identify areas for improvement

3. **Plan your first update**
   - Prioritize bug fixes and improvements
   - Begin work on the next version

## Helpful Resources

- **Apple Developer Documentation**: [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- **Expo Documentation**: [Publishing to App Store](https://docs.expo.dev/submit/ios/)
- **Firebase Documentation**: [Security Rules](https://firebase.google.com/docs/rules)

## Troubleshooting Common Issues

### Build Fails
- Verify your Expo account is active
- Check that all dependencies are compatible
- Ensure your bundle identifier is registered in the Apple Developer Portal

### Upload Fails
- Check your Apple Developer Program membership is active
- Verify you have the correct permissions in App Store Connect
- Try using a different upload method (EAS Submit vs. Transporter)

### App Rejected
- Carefully read the rejection reason
- Address all issues mentioned
- Resubmit with detailed notes explaining the changes

Remember to refer to the detailed guides in the `/docs` directory for specific instructions on each step of the process.
