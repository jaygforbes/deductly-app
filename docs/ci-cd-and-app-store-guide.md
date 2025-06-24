# Complete CI/CD and App Store Submission Guide for Deductly

This guide provides comprehensive instructions for setting up CI/CD and submitting your Deductly app to the Apple App Store.

## Part 1: CI/CD Setup

### GitHub Actions Configuration

We've set up two GitHub Actions workflows for your project:

1. **CI/CD Workflow** (`ci-cd.yml`): Runs tests and builds the app on every push to main and develop branches.
2. **App Store Submission Workflow** (`app-store-submission.yml`): Manually triggered workflow to submit your app to the App Store.

### Required Secrets

Before you can use these workflows, you need to add the following secrets to your GitHub repository:

1. Go to your GitHub repository → Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `EXPO_TOKEN`: Your Expo access token (get it from https://expo.dev/settings/access-tokens)

### EAS Configuration

Your `eas.json` file needs to be updated with your actual Apple credentials:

1. Open `/Users/briana/CascadeProjects/deductly-app/eas.json`
2. Replace the following placeholders:
   - `YOUR_APPLE_ID`: Your Apple Developer account email
   - `YOUR_APP_STORE_CONNECT_APP_ID`: The App ID from App Store Connect
   - `YOUR_APPLE_TEAM_ID`: Your Apple Developer Team ID

## Part 2: App Store Submission Process

### Step 1: Final App Preparation

1. **Update App Version**
   - Open `app.json`
   - Update the `version` field (e.g., "1.0.0")
   - Update the `ios.buildNumber` field (e.g., "1")

2. **Run Final Tests**
   - Run `npm test` to ensure all tests pass
   - Test on multiple iOS devices if possible
   - Fix any bugs or issues discovered

### Step 2: App Store Connect Setup

1. **Log in to App Store Connect**
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - Sign in with your Apple Developer account

2. **Complete App Information**
   - Navigate to "My Apps" and select Deductly
   - Fill in all required metadata:
     - App name: "Deductly"
     - Subtitle: "Tax Deduction Tracker"
     - Category: "Finance" (Primary) and "Productivity" (Secondary)
     - Keywords: Use the keywords from app-description.md
     - Description: Copy from app-description.md
     - Support URL: https://deductly.com/support
     - Marketing URL: https://deductly.com
     - Privacy Policy URL: https://deductly.com/privacy

3. **Add App Store Assets**
   - Upload app screenshots for all required device sizes (see `/app-store-assets/screenshot-capture-guide.md`)
   - Upload your app icon (1024x1024 pixels) (see `/app-store-assets/app-icon-instructions.md`)
   - Add app preview videos (optional but recommended)

### Step 3: Create a Demo Account for Reviewers

1. **Run the Reviewer Account Script**
   ```bash
   cd /Users/briana/CascadeProjects/deductly-app
   node scripts/create-reviewer-account.js
   ```

2. **Add Demo Account to App Review Information**
   - In App Store Connect, go to "App Review Information"
   - Add demo account credentials:
     - Email: reviewer@deductly.com
     - Password: Deductly2025Review!

### Step 4: Submit Using GitHub Actions

1. **Go to GitHub Actions**
   - Navigate to your repository's Actions tab
   - Select the "App Store Submission" workflow

2. **Run the Workflow**
   - Click "Run workflow"
   - Enter the required information:
     - Version: e.g., "1.0.0"
     - Build number: e.g., "1"
     - Release notes: e.g., "Initial release of Deductly"
   - Click "Run workflow"

3. **Monitor the Submission**
   - The workflow will:
     - Run tests
     - Update app version
     - Build the iOS app
     - Submit to App Store Connect
   - This process may take 30-60 minutes

### Step 5: Manual Submission (Alternative)

If you prefer to submit manually:

1. **Build Your App**
   ```bash
   cd /Users/briana/CascadeProjects/deductly-app
   eas build --platform ios --profile production
   ```

2. **Submit to App Store**
   ```bash
   eas submit --platform ios --profile production
   ```

### Step 6: Monitor Review Status

1. **Check App Store Connect**
   - Log in to App Store Connect
   - Go to "My Apps" → Deductly → "App Store" tab
   - Monitor the "App Status" section

2. **Respond to Reviewer Questions**
   - Be available to respond to any questions from the review team
   - Review typically takes 1-3 business days

3. **If Rejected**
   - Address all issues mentioned in the rejection
   - Make necessary changes to your app
   - Submit a new build if required
   - Resubmit for review

4. **If Approved**
   - If using manual release, release when ready
   - If using automatic release, your app will go live automatically

## Part 3: Post-Launch Activities

1. **Monitor Analytics**
   - Use App Store Connect analytics to track downloads
   - Monitor user feedback and reviews
   - Address any issues in future updates

2. **Plan Updates**
   - Begin working on bug fixes and improvements
   - Plan feature enhancements based on user feedback
   - Prepare marketing activities to promote your app

## Important Resources

- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Expo EAS Documentation](https://docs.expo.dev/eas/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
