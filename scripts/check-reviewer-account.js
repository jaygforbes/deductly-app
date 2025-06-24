// CommonJS version of the script to check for reviewer account
const firebase = require('firebase/app');
require('firebase/auth');

// Firebase configuration from firebase-config.js
const firebaseConfig = {
    apiKey: "AIzaSyC1a8pzYsJyxft1nX7LRMSgXkVyoJhQHaA",
    authDomain: "deductly-demo.firebaseapp.com",
    projectId: "deductly-demo",
    storageBucket: "deductly-demo.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abc123def456ghi789jkl"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

async function checkReviewerAccount() {
  try {
    console.log('Checking for reviewer account...');
    
    try {
      // Try to sign in with reviewer credentials
      const userCredential = await firebase.auth().signInWithEmailAndPassword(
        'reviewer@deductly.com',
        'Deductly2025Review!'
      );
      console.log('✅ Reviewer account exists and credentials are valid.');
      console.log('Account UID:', userCredential.user.uid);
      return true;
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('❌ Reviewer account does not exist.');
      } else if (error.code === 'auth/wrong-password') {
        console.log('⚠️ Reviewer account exists but password is incorrect.');
      } else {
        console.error('Error checking reviewer account:', error);
      }
      return false;
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return false;
  }
}

// Execute the script
checkReviewerAccount()
  .then(() => {
    console.log('Check completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
