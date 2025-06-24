# App Store Submission Checklist for Deductly

## Before Building Your App

- [ ] Update app version and build number in app.json
- [ ] Test app thoroughly on multiple iOS devices/simulators
- [ ] Run all unit and integration tests
- [ ] Fix any linting errors or warnings
- [ ] Ensure all Firebase security rules are properly configured
- [ ] Verify all app permissions are correctly implemented
- [ ] Test OCR functionality with various receipt types
- [ ] Test recurring deductions feature
- [ ] Verify mileage tracking works correctly
- [ ] Check that all UI elements display correctly in both light and dark mode
- [ ] Optimize app performance and reduce bundle size

## Apple Developer Account Setup

- [ ] Enroll in the Apple Developer Program ($99/year)
- [ ] Create App ID in the Apple Developer Portal
- [ ] Configure app capabilities (Push Notifications, Background Modes, etc.)
- [ ] Create distribution certificate
- [ ] Create provisioning profile for App Store distribution

## App Store Connect Setup

- [ ] Create a new app in App Store Connect
- [ ] Verify bundle ID matches your app configuration
- [ ] Complete app information:
  - [ ] App name
  - [ ] Subtitle
  - [ ] Category
  - [ ] Keywords
  - [ ] Description
  - [ ] Support URL
  - [ ] Marketing URL
  - [ ] Privacy Policy URL

## App Store Assets

- [ ] Create app icon (1024x1024 pixels)
- [ ] Prepare screenshots for all required device sizes:
  - [ ] iPhone 6.5" Display (1242 x 2688 pixels)
  - [ ] iPhone 5.5" Display (1242 x 2208 pixels)
  - [ ] iPad Pro 12.9" Display (2048 x 2732 pixels)
- [ ] Optional: Create app preview videos
- [ ] Write compelling promotional text (170 characters max)
- [ ] Prepare app description (4000 characters max)

## Building and Uploading

- [ ] Run `npm run build:ios` to build the app
- [ ] Download the IPA file from Expo's servers
- [ ] Use Apple Transporter or Application Loader to upload the build
- [ ] Wait for the build to process (can take up to an hour)
- [ ] Resolve any issues reported by App Store Connect

## App Review Submission

- [ ] Select the build version to submit
- [ ] Provide test account credentials for Apple reviewers
- [ ] Add notes for the review team explaining app functionality
- [ ] Answer the Content Rights questions
- [ ] Complete the Export Compliance information
- [ ] Verify app pricing and availability
- [ ] Set the release type (Automatic or Manual)
- [ ] Submit for review

## Post-Submission

- [ ] Monitor review status in App Store Connect
- [ ] Be prepared to respond quickly to any questions from the review team
- [ ] If rejected, address all issues and resubmit
- [ ] Once approved, verify the app appears correctly on the App Store
- [ ] Monitor analytics after release

## Additional Considerations

- [ ] Set up App Store analytics
- [ ] Configure in-app purchases (if applicable)
- [ ] Prepare marketing materials for launch
- [ ] Plan for future updates and maintenance
