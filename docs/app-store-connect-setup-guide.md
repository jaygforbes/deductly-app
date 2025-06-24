# App Store Connect Setup Guide for Deductly

This guide will walk you through the process of setting up your app in App Store Connect.

## 1. Access App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Sign in with your Apple Developer account credentials
3. If this is your first time, you'll need to accept the Apple Developer Program License Agreement

## 2. Create a New App

1. Click on "My Apps"
2. Click the "+" button in the top-left corner
3. Select "New App"
4. Fill in the required information:
   - Platforms: iOS
   - Name: "Deductly"
   - Primary language: English (U.S.)
   - Bundle ID: Select "com.forbesyprojects.deductly" from the dropdown
   - SKU: "deductly2025" (or any unique identifier for your internal use)
   - User Access: Full Access (default)
5. Click "Create"

## 3. App Information

After creating your app, you'll need to complete the App Information section:

1. Click on your app in the My Apps list
2. Go to the "App Information" tab
3. Fill in the following details:

### App Information
- **Privacy Policy URL**: Enter the URL to your hosted privacy policy (e.g., https://deductly.com/privacy)
- **Subtitle**: "Tax Deduction Tracker" (30 characters max)
- **Category**:
  - Primary: Finance
  - Secondary: Productivity
- **Age Rating**: Complete the questionnaire (likely 4+)
- **App Version**: This should match your app.json version (1.0.0)
- **Copyright**: "© 2025 Forbesy Projects"

## 4. Pricing and Availability

1. Go to the "Pricing and Availability" tab
2. Set your app's price tier (Free or paid)
3. Select availability by territory (typically "All territories")
4. Set your availability date (when your app will be available after approval)
5. Click "Save" at the bottom of the page

## 5. App Privacy

1. Go to the "App Privacy" tab
2. Click "Get Started" to begin the privacy questionnaire
3. Answer all questions about data collection:
   - Data types collected (e.g., Location, User Content, Identifiers)
   - How each data type is used
   - Whether data is linked to the user's identity
   - Whether data is used for tracking purposes
4. Complete the questionnaire and submit

## 6. Add App Store Assets

### Screenshots
1. Go to the "App Store" tab
2. Scroll down to the "App Screenshots" section
3. For each device type (6.5", 5.5", 12.9" iPad Pro):
   - Click "Add Screenshot"
   - Upload your prepared screenshots (3-10 per device type)
   - Add captions to highlight key features

### App Preview Videos (Optional but Recommended)
1. In the same section, click "Add App Preview"
2. Upload your app preview videos for each device type
3. Videos should be 15-30 seconds long

### App Icon
1. Scroll to the "General App Information" section
2. Upload your 1024×1024 pixel app icon

## 7. Description and Keywords

1. In the "General App Information" section:
   - **Description**: Copy your prepared description from app-store-assets/app-description.md (4000 characters max)
   - **Keywords**: Enter your keywords separated by commas (100 characters max)
   - **Support URL**: Enter your support website URL
   - **Marketing URL**: Enter your marketing website URL (optional)
   - **Promotional Text**: Add text that can be updated without submitting a new version (170 characters max)

## 8. Review Information

1. Scroll down to the "Review Information" section
2. Fill in:
   - Contact information for Apple to reach you
   - Notes for the review team explaining how to use your app
   - Demo account login information:
     - Email: reviewer@deductly.com
     - Password: Deductly2025Review!
   - Attachment (optional): You can add a short demo video

## 9. Version Information

1. In the "Version Information" section:
   - **What's New**: For first release, enter "Initial release of Deductly"
   - For future updates, describe what's new in this version

## 10. Build Upload

After completing all the above steps, you'll need to upload your build. This is covered in the app-store-upload-guide.md document.

## 11. Submit for Review

Once your build is uploaded and all information is complete:
1. Select your build in the "Build" section
2. Click "Submit for Review" at the top-right
3. Answer the export compliance questions
4. Choose between automatic or manual release
5. Submit your app

## Important Tips

- **Save Frequently**: App Store Connect doesn't always auto-save your changes
- **Preview Your Listing**: Use the preview option to see how your app will appear on the App Store
- **Check for Errors**: Look for any yellow or red warnings before submission
- **Be Patient**: The review process typically takes 1-3 business days
- **Be Responsive**: Monitor your email for any questions from the review team
