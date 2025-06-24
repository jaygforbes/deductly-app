# Preparing Deductly for App Store Review

This guide will help you prepare your app for the App Store review process to maximize your chances of approval on the first submission.

## Creating a Demo Account for Reviewers

Apple reviewers need to test all functionality of your app. Create a special account pre-populated with sample data:

### 1. Create a Reviewer Account

```javascript
// Use Firebase Auth to create a dedicated reviewer account
// You can run this in a development environment

import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

// Initialize Firebase (use your actual config)
// firebase.initializeApp(firebaseConfig);

async function createReviewerAccount() {
  try {
    // Create user account
    const userCredential = await firebase.auth().createUserWithEmailAndPassword(
      'reviewer@deductly.com',
      'Deductly2025Review!'
    );
    
    const uid = userCredential.user.uid;
    
    // Add user profile
    await firebase.firestore().collection('users').doc(uid).set({
      email: 'reviewer@deductly.com',
      displayName: 'App Reviewer',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      isReviewerAccount: true
    });
    
    console.log('Reviewer account created successfully!');
    return uid;
  } catch (error) {
    console.error('Error creating reviewer account:', error);
  }
}

// Call the function
createReviewerAccount();
```

### 2. Populate with Sample Data

Add sample data to demonstrate all features:

```javascript
async function populateReviewerData(uid) {
  try {
    const db = firebase.firestore();
    
    // Add sample job profiles
    const freelanceProfileRef = await db.collection('jobProfiles').add({
      userId: uid,
      name: 'Freelance Writing',
      description: 'Writing articles and blog posts',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    const consultingProfileRef = await db.collection('jobProfiles').add({
      userId: uid,
      name: 'Consulting',
      description: 'Business consulting services',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Add sample deductions with receipts
    await db.collection('deductions').add({
      userId: uid,
      title: 'Office Supplies',
      amount: 125.99,
      date: new Date('2025-06-01'),
      category: 'Office Supplies',
      notes: 'Purchased printer ink and paper',
      jobProfileId: freelanceProfileRef.id,
      receiptUrl: 'https://firebasestorage.googleapis.com/sample-receipt-1.jpg',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    await db.collection('deductions').add({
      userId: uid,
      title: 'Business Lunch',
      amount: 45.75,
      date: new Date('2025-06-05'),
      category: 'Meals',
      notes: 'Lunch with client discussing project',
      jobProfileId: consultingProfileRef.id,
      receiptUrl: 'https://firebasestorage.googleapis.com/sample-receipt-2.jpg',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Add sample mileage entries
    await db.collection('mileageEntries').add({
      userId: uid,
      startLocation: '123 Main St, San Francisco, CA',
      endLocation: '456 Market St, San Francisco, CA',
      distance: 5.2,
      date: new Date('2025-06-03'),
      purpose: 'Client meeting',
      jobProfileId: consultingProfileRef.id,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Add recurring deduction templates
    await db.collection('recurringDeductions').add({
      userId: uid,
      title: 'Office Rent',
      amount: 850,
      category: 'Rent',
      frequency: 'monthly',
      nextGenerationDate: new Date('2025-07-01'),
      lastGeneratedDate: new Date('2025-06-01'),
      isActive: true,
      jobProfileId: freelanceProfileRef.id,
      notes: 'Monthly office space rental',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('Sample data created successfully!');
  } catch (error) {
    console.error('Error creating sample data:', error);
  }
}
```

### 3. Test the Reviewer Account

Before submitting, log in with the reviewer account and verify:
- All sample data appears correctly
- All features are accessible
- No errors or crashes occur

## Notes for App Review

In the "Notes for App Review" section in App Store Connect, include:

```
Deductly is a tax deduction and expense tracking app for freelancers and small businesses.

LOGIN CREDENTIALS:
Email: reviewer@deductly.com
Password: Deductly2025Review!

TESTING INSTRUCTIONS:
1. Sign in using the credentials above
2. The account is pre-populated with sample data to demonstrate all features
3. Key features to test:
   - Receipt scanning: Tap "+" > "Scan Receipt" to test the OCR functionality
   - Mileage tracking: Tap "Mileage" tab to view sample trips or record a new one
   - Recurring deductions: In Settings > "Recurring Deductions" to view templates
   - Reports: Tap "Reports" tab to generate tax reports from sample data

PERMISSIONS:
- Camera: Required for receipt scanning
- Location: Required for mileage tracking (please enable when prompted)

If you have any questions during the review, please contact us at appstore@deductly.com
```

## Common Rejection Reasons and How to Avoid Them

### 1. Crashes and Bugs
- Test on multiple devices and iOS versions
- Handle edge cases (no internet, low storage)
- Test with different permission settings

### 2. Incomplete Information
- Ensure all required fields in App Store Connect are completed
- Provide detailed testing instructions
- Include valid contact information

### 3. Privacy Concerns
- Implement proper permission requests with clear explanations
- Ensure your privacy policy is comprehensive and accessible
- Only request necessary permissions

### 4. Metadata Issues
- Ensure screenshots match actual app functionality
- Avoid using terms like "beta" or "test" in your description
- Don't mention other platforms (Android, etc.)

### 5. Payment and Subscription Issues
- Clearly explain any subscription terms
- Ensure all in-app purchases work correctly
- Don't include external payment methods

## Final Pre-Submission Checklist

- [ ] App icon meets Apple's requirements
- [ ] All screenshots are up-to-date and accurate
- [ ] App description is clear and free of errors
- [ ] Privacy policy is complete and accessible
- [ ] Demo account is created and populated with sample data
- [ ] All permissions are properly implemented with usage descriptions
- [ ] App works in airplane mode or with limited connectivity
- [ ] All third-party SDKs are up-to-date
- [ ] No placeholder content or debug information in the app
- [ ] Version number and build number are correct

By following this guide, you'll be well-prepared for the App Store review process and increase your chances of getting approved on the first submission.
