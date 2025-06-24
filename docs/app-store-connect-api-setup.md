# Setting Up App Store Connect API Keys

This guide explains how to create and use App Store Connect API keys for automated app submission.

## Prerequisites

- Apple Developer Program membership
- Admin access to App Store Connect

## Creating an API Key

1. **Log in to App Store Connect**
   - Go to [App Store Connect](https://appstoreconnect.apple.com/)
   - Sign in with your Apple ID

2. **Access API Keys**
   - Click on "Users and Access" in the sidebar
   - Select the "Keys" tab

3. **Generate a New Key**
   - Click the "+" button to create a new key
   - Enter a name for your key (e.g., "Deductly CI/CD")
   - Select the appropriate access level:
     - App Manager: Can manage apps but not users
     - Developer: Can upload builds
     - Admin: Full access
   - Click "Generate"

4. **Save Your Key Information**
   - Download the API key file (.p8)
   - Note the Key ID
   - Note your Issuer ID (visible at the top of the page)

## Using the API Key with EAS

1. **Configure EAS**
   - Open your `eas.json` file
   - Update the "submit" section with your API key information:

```json
"submit": {
  "production": {
    "ios": {
      "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID",
      "appleTeamId": "YOUR_APPLE_TEAM_ID"
    }
  }
}
```

2. **Set Up Environment Variables**
   - Add these environment variables to your CI/CD system:
     - `EXPO_APPLE_APP_SPECIFIC_PASSWORD`: Your app-specific password
     - `EXPO_APPLE_ID`: Your Apple ID email
     - `EXPO_ASC_API_KEY_ID`: Your API Key ID
     - `EXPO_ASC_API_KEY_ISSUER_ID`: Your Issuer ID
     - `EXPO_ASC_API_KEY_PATH`: Path to your .p8 file

3. **Secure Storage of API Key**
   - Store your .p8 file securely
   - For GitHub Actions, use Secrets to store sensitive information
   - Never commit API keys to your repository

## Using the API Key for Submission

With EAS:
```bash
eas submit --platform ios --api-key-path /path/to/api-key.p8 --api-key-id YOUR_KEY_ID --api-key-issuer-id YOUR_ISSUER_ID
```

Or using our npm script:
```bash
npm run submit:ios
```

## Troubleshooting

- **Authentication Errors**: Verify your API key has not expired
- **Permission Errors**: Check that your API key has the correct access level
- **Invalid App ID**: Ensure your App Store Connect App ID is correct
- **Build Processing Issues**: Wait until your build is fully processed before submitting
