# Deductly - Tax Deduction Tracker for iOS

Deductly is a React Native mobile application designed to help freelancers, contractors, and small business owners track their tax deductions, mileage, and receipts. Built with Expo and Firebase, this app provides an easy way to manage business expenses and maximize tax savings.

## Features

- **Authentication**: Secure email/password login and signup
- **Mileage Tracking**: GPS-based trip tracking with start/stop functionality
- **Receipt Capture**: Take photos of receipts and link them to deductions
- **Manual Deduction Entry**: Add, edit, and categorize deductions
- **Job Profiles**: Manage multiple business profiles for different income streams
- **Reporting**: View summaries and breakdowns of deductions by category and time period
- **Data Export**: Export deduction and mileage data as CSV files
- **Dark Mode**: Toggle between light and dark themes

## Tech Stack

- **React Native**: Cross-platform mobile framework
- **Expo**: Development platform for React Native
- **Firebase**: Backend services
- **CI/CD with GitHub Actions**: Automation for testing and deployment
- **EAS Build**: Expo Application Services for building iOS and Android apps

## CI/CD Workflows

This project uses GitHub Actions for continuous integration and deployment:

1. **Deductly CI/CD**: Runs tests and builds Android/iOS apps on pushes to main/develop branches
2. **App Store Submission**: Manual workflow for submitting builds to the App Store

## Firebase Services

- **Authentication**: User management
- **Firestore**: Database for storing deductions, trips, profiles
- **Storage**: For receipt images
- **React Navigation**: Navigation and routing
- **Expo Location**: GPS tracking
- **Expo Camera & Image Picker**: Receipt capture functionality
- **React Native Chart Kit**: Data visualization for reports

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- Expo CLI
- Firebase account

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/deductly-app.git
cd deductly-app
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Create a Firebase project
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Enable Storage

4. Configure Firebase
   - Create a file at `/src/firebase.js` with your Firebase configuration:
   ```javascript
   import { initializeApp } from 'firebase/app';
   import { getAuth } from 'firebase/auth';
   import { getFirestore } from 'firebase/firestore';
   import { getStorage } from 'firebase/storage';

   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };

   const app = initializeApp(firebaseConfig);
   const auth = getAuth(app);
   const firestore = getFirestore(app);
   const storage = getStorage(app);

   export { app, auth, firestore, storage, firebase };
   ```

5. Start the development server
```bash
expo start
```

6. Run on iOS simulator or device
   - Press `i` in the terminal or click "Run on iOS simulator" in the Expo DevTools

## Project Structure

```
deductly-app/
├── App.js                  # Main app component
├── src/
│   ├── contexts/           # React Context providers
│   │   ├── AuthContext.js  # Authentication state
│   │   ├── ThemeContext.js # Theme (dark/light) state
│   │   └── ProfileContext.js # Profile management
│   ├── modules/            # Business logic modules
│   │   ├── AuthModule/     # Authentication logic
│   │   ├── DeductionModule/ # Deduction management
│   │   ├── MileageModule/  # Trip tracking
│   │   ├── ReceiptModule/  # Receipt handling
│   │   ├── ProfileModule/  # Profile management
│   │   └── ReportModule/   # Reporting and exports
│   ├── navigation/         # Navigation configuration
│   │   ├── AuthNavigator.js # Auth flow
│   │   └── MainNavigator.js # Main app navigation
│   ├── screens/            # UI screens
│   │   ├── LoginScreen.js
│   │   ├── SignupScreen.js
│   │   ├── HomeScreen.js
│   │   └── ...
│   └── firebase.js         # Firebase configuration
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Icons provided by Ionicons
- Charts powered by React Native Chart Kit
