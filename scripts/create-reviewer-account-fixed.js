/**
 * Script to create and populate a demo account for App Store reviewers
 * Run this script in your development environment before submission
 */

import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import { firebaseConfig } from './firebase-config.js';

// Initialize Firebase
const initializeApp = () => {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  return firebase;
};

// Initialize Firebase
initializeApp();

/**
 * Creates a reviewer account and populates it with sample data
 */
async function createReviewerAccount() {
  try {
    console.log('Creating reviewer account...');
    
    // Check if account already exists
    try {
      const userCredential = await firebase.auth().signInWithEmailAndPassword(
        'reviewer@deductly.com',
        'Deductly2025Review!'
      );
      console.log('Reviewer account already exists. Signed in.');
      await populateReviewerData(userCredential.user.uid);
      return;
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
      // User doesn't exist, continue with creation
    }
    
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
    
    // Populate with sample data
    await populateReviewerData(uid);
    
  } catch (error) {
    console.error('Error creating reviewer account:', error);
  }
}

/**
 * Populates the reviewer account with sample data
 */
async function populateReviewerData(uid) {
  try {
    console.log('Populating reviewer account with sample data...');
    
    const db = firebase.firestore();
    const today = new Date();
    
    // Add sample job profiles
    console.log('Creating job profiles...');
    
    // Check if profiles already exist
    const existingProfiles = await db.collection('jobProfiles')
      .where('userId', '==', uid)
      .get();
    
    let freelanceProfileId, consultingProfileId;
    
    if (!existingProfiles.empty) {
      console.log('Job profiles already exist, using existing ones');
      existingProfiles.forEach(doc => {
        const profile = doc.data();
        if (profile.name === 'Freelance Writing') {
          freelanceProfileId = doc.id;
        } else if (profile.name === 'Consulting') {
          consultingProfileId = doc.id;
        }
      });
    }
    
    if (!freelanceProfileId) {
      const freelanceProfileRef = await db.collection('jobProfiles').add({
        userId: uid,
        name: 'Freelance Writing',
        description: 'Writing articles and blog posts',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      freelanceProfileId = freelanceProfileRef.id;
    }
    
    if (!consultingProfileId) {
      const consultingProfileRef = await db.collection('jobProfiles').add({
        userId: uid,
        name: 'Consulting',
        description: 'Business consulting services',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      consultingProfileId = consultingProfileRef.id;
    }
    
    // Add sample deductions with receipts
    console.log('Creating sample deductions...');
    
    // Check if deductions already exist
    const existingDeductions = await db.collection('deductions')
      .where('userId', '==', uid)
      .get();
    
    if (existingDeductions.empty) {
      // Create dates for the past 3 months
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(today.getMonth() - 3);
      
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(today.getMonth() - 2);
      
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(today.getMonth() - 1);
      
      const lastWeek = new Date();
      lastWeek.setDate(today.getDate() - 7);
      
      // Sample deductions
      await db.collection('deductions').add({
        userId: uid,
        title: 'Office Supplies',
        amount: 125.99,
        date: threeMonthsAgo,
        category: 'Office Supplies',
        notes: 'Purchased printer ink and paper',
        jobProfileId: freelanceProfileId,
        receiptUrl: 'https://firebasestorage.googleapis.com/v0/b/deductly-app.appspot.com/o/sample-receipts%2Foffice-supplies.jpg?alt=media',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      await db.collection('deductions').add({
        userId: uid,
        title: 'Business Lunch',
        amount: 45.75,
        date: twoMonthsAgo,
        category: 'Meals',
        notes: 'Lunch with client discussing project',
        jobProfileId: consultingProfileId,
        receiptUrl: 'https://firebasestorage.googleapis.com/v0/b/deductly-app.appspot.com/o/sample-receipts%2Fbusiness-lunch.jpg?alt=media',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      await db.collection('deductions').add({
        userId: uid,
        title: 'Software Subscription',
        amount: 29.99,
        date: oneMonthAgo,
        category: 'Software',
        notes: 'Monthly Adobe Creative Cloud subscription',
        jobProfileId: freelanceProfileId,
        receiptUrl: 'https://firebasestorage.googleapis.com/v0/b/deductly-app.appspot.com/o/sample-receipts%2Fsoftware.jpg?alt=media',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      await db.collection('deductions').add({
        userId: uid,
        title: 'Conference Registration',
        amount: 299.00,
        date: lastWeek,
        category: 'Professional Development',
        notes: 'Annual industry conference registration fee',
        jobProfileId: consultingProfileId,
        receiptUrl: 'https://firebasestorage.googleapis.com/v0/b/deductly-app.appspot.com/o/sample-receipts%2Fconference.jpg?alt=media',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } else {
      console.log('Deductions already exist, skipping creation');
    }
    
    // Add sample mileage entries
    console.log('Creating sample mileage entries...');
    
    // Check if mileage entries already exist
    const existingMileage = await db.collection('mileageEntries')
      .where('userId', '==', uid)
      .get();
    
    if (existingMileage.empty) {
      // Create dates for mileage entries
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(today.getDate() - 14);
      
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(today.getDate() - 10);
      
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(today.getDate() - 5);
      
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      
      await db.collection('mileageEntries').add({
        userId: uid,
        startLocation: '123 Main St, San Francisco, CA',
        endLocation: '456 Market St, San Francisco, CA',
        distance: 5.2,
        date: twoWeeksAgo,
        purpose: 'Client meeting',
        jobProfileId: consultingProfileId,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      await db.collection('mileageEntries').add({
        userId: uid,
        startLocation: '456 Market St, San Francisco, CA',
        endLocation: '123 Main St, San Francisco, CA',
        distance: 5.2,
        date: twoWeeksAgo,
        purpose: 'Return from client meeting',
        jobProfileId: consultingProfileId,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      await db.collection('mileageEntries').add({
        userId: uid,
        startLocation: '123 Main St, San Francisco, CA',
        endLocation: '789 Howard St, San Francisco, CA',
        distance: 3.8,
        date: tenDaysAgo,
        purpose: 'Meeting with potential client',
        jobProfileId: freelanceProfileId,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      await db.collection('mileageEntries').add({
        userId: uid,
        startLocation: '123 Main St, San Francisco, CA',
        endLocation: '555 Mission St, San Francisco, CA',
        distance: 2.5,
        date: fiveDaysAgo,
        purpose: 'Networking event',
        jobProfileId: consultingProfileId,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      await db.collection('mileageEntries').add({
        userId: uid,
        startLocation: '123 Main St, San Francisco, CA',
        endLocation: '200 California St, San Francisco, CA',
        distance: 4.1,
        date: yesterday,
        purpose: 'Client presentation',
        jobProfileId: consultingProfileId,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } else {
      console.log('Mileage entries already exist, skipping creation');
    }
    
    // Add recurring deduction templates
    console.log('Creating recurring deduction templates...');
    
    // Check if recurring deductions already exist
    const existingRecurring = await db.collection('recurringDeductions')
      .where('userId', '==', uid)
      .get();
    
    if (existingRecurring.empty) {
      // Next month date for recurring deductions
      const nextMonth = new Date();
      nextMonth.setMonth(today.getMonth() + 1);
      nextMonth.setDate(1); // First day of next month
      
      // This month date for last generated
      const thisMonth = new Date();
      thisMonth.setDate(1); // First day of this month
      
      await db.collection('recurringDeductions').add({
        userId: uid,
        title: 'Office Rent',
        amount: 850,
        category: 'Rent',
        frequency: 'monthly',
        nextGenerationDate: nextMonth,
        lastGeneratedDate: thisMonth,
        isActive: true,
        jobProfileId: freelanceProfileId,
        notes: 'Monthly office space rental',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      await db.collection('recurringDeductions').add({
        userId: uid,
        title: 'Software Subscription',
        amount: 29.99,
        category: 'Software',
        frequency: 'monthly',
        nextGenerationDate: nextMonth,
        lastGeneratedDate: thisMonth,
        isActive: true,
        jobProfileId: freelanceProfileId,
        notes: 'Adobe Creative Cloud subscription',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      await db.collection('recurringDeductions').add({
        userId: uid,
        title: 'Cell Phone',
        amount: 75.00,
        category: 'Utilities',
        frequency: 'monthly',
        nextGenerationDate: nextMonth,
        lastGeneratedDate: thisMonth,
        isActive: true,
        jobProfileId: null, // Applies to all profiles
        notes: 'Business portion of cell phone bill',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      // Quarterly expense
      const nextQuarter = new Date();
      nextQuarter.setMonth(Math.floor((today.getMonth() + 3) / 3) * 3);
      nextQuarter.setDate(1);
      
      const lastQuarter = new Date();
      lastQuarter.setMonth(Math.floor(today.getMonth() / 3) * 3);
      lastQuarter.setDate(1);
      
      await db.collection('recurringDeductions').add({
        userId: uid,
        title: 'Professional Membership',
        amount: 120.00,
        category: 'Dues & Subscriptions',
        frequency: 'quarterly',
        nextGenerationDate: nextQuarter,
        lastGeneratedDate: lastQuarter,
        isActive: true,
        jobProfileId: consultingProfileId,
        notes: 'Professional association membership fee',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      // Yearly expense
      const nextYear = new Date();
      nextYear.setFullYear(today.getFullYear() + 1);
      nextYear.setMonth(0);
      nextYear.setDate(1);
      
      const lastYear = new Date();
      lastYear.setFullYear(today.getFullYear());
      lastYear.setMonth(0);
      lastYear.setDate(1);
      
      await db.collection('recurringDeductions').add({
        userId: uid,
        title: 'Business Insurance',
        amount: 500.00,
        category: 'Insurance',
        frequency: 'yearly',
        nextGenerationDate: nextYear,
        lastGeneratedDate: lastYear,
        isActive: true,
        jobProfileId: null, // Applies to all profiles
        notes: 'Annual business liability insurance premium',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } else {
      console.log('Recurring deductions already exist, skipping creation');
    }
    
    console.log('Sample data created successfully!');
  } catch (error) {
    console.error('Error creating sample data:', error);
  }
}

// Execute the script
createReviewerAccount()
  .then(() => {
    console.log('Reviewer account setup completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error setting up reviewer account:', error);
    process.exit(1);
  });
