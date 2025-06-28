/**
 * Script to create and populate a demo account for App Store reviewers
 * Run this script in your development environment before submission
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { firebaseConfig } from './firebase-config.js';

// IMPORTANT: Before running this script, make sure to update the firebase-config.js file
// with your actual Firebase configuration values from your Firebase console

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

/**
 * Creates a reviewer account and populates it with sample data
 */
async function createReviewerAccount() {
  try {
    console.log('Creating reviewer account...');
    console.log('Using Firebase project:', firebaseConfig.projectId);
    
    // Check if account already exists
    try {
      console.log('Attempting to sign in with existing reviewer account...');
      const userCredential = await signInWithEmailAndPassword(
        auth,
        'reviewer@deductly.com',
        'Deductly2025Review!'
      );
      console.log('Reviewer account already exists. Signed in successfully.');
      await populateReviewerData(userCredential.user.uid);
      return;
    } catch (error) {
      console.log('Sign-in error:', error.code);
      // Continue with account creation if user not found
      // Otherwise, only throw if it's not an expected error
      if (error.code !== 'auth/user-not-found' && 
          error.code !== 'auth/invalid-credential' && 
          error.code !== 'auth/invalid-email') {
        throw error;
      }
      // User doesn't exist, continue with creation
    }
    
    // Create user account
    console.log('Creating new reviewer account...');
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        'reviewer@deductly.com',
        'Deductly2025Review!'
      );
      
      console.log('Reviewer account created successfully!');
      const uid = userCredential.user.uid;
      console.log('User ID:', uid);
      
      // Populate the account with sample data
      await populateReviewerData(uid);
      return;
    } catch (createError) {
      console.error('Error creating account:', createError.code);
      
      // If account already exists but we couldn't sign in earlier, try signing in again
      if (createError.code === 'auth/email-already-in-use') {
        console.log('Account already exists. Attempting to sign in again...');
        try {
          const signInCredential = await signInWithEmailAndPassword(
            auth,
            'reviewer@deductly.com',
            'Deductly2025Review!'
          );
          console.log('Successfully signed in to existing account.');
          await populateReviewerData(signInCredential.user.uid);
          return;
        } catch (signInError) {
          console.error('Failed to sign in to existing account:', signInError.code);
          throw signInError;
        }
      } else {
        throw createError;
      }
    }
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
    
    const today = new Date();
    
    // Add sample job profiles
    console.log('Creating job profiles...');
    
    // Check if profiles already exist
    const profilesRef = collection(db, 'jobProfiles');
    const profilesQuery = query(profilesRef, where('userId', '==', uid));
    const existingProfiles = await getDocs(profilesQuery);
    
    let freelanceProfileId, consultingProfileId;
    
    if (!existingProfiles.empty) {
      console.log('Job profiles already exist, using existing ones');
      existingProfiles.forEach(docSnapshot => {
        const profile = docSnapshot.data();
        if (profile.name === 'Freelance Writing') {
          freelanceProfileId = docSnapshot.id;
        } else if (profile.name === 'Consulting') {
          consultingProfileId = docSnapshot.id;
        }
      });
    }
    
    if (!freelanceProfileId) {
      const jobProfilesRef = collection(db, 'jobProfiles');
      const freelanceProfileData = {
        userId: uid,
        name: 'Freelance Writing',
        description: 'Writing articles and blog posts',
        createdAt: serverTimestamp()
      };
      const freelanceProfileRef = await addDoc(jobProfilesRef, freelanceProfileData);
      freelanceProfileId = freelanceProfileRef.id;
    }
    
    if (!consultingProfileId) {
      const jobProfilesRef = collection(db, 'jobProfiles');
      const consultingProfileData = {
        userId: uid,
        name: 'Consulting',
        description: 'Business consulting services',
        createdAt: serverTimestamp()
      };
      const consultingProfileRef = await addDoc(jobProfilesRef, consultingProfileData);
      consultingProfileId = consultingProfileRef.id;
    }
    
    // Add sample deductions with receipts
    console.log('Creating sample deductions...');
    
    // Check if deductions already exist
    const deductionsRef = collection(db, 'deductions');
    const deductionsQuery = query(deductionsRef, where('userId', '==', uid));
    const existingDeductions = await getDocs(deductionsQuery);
    
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
      const deductionsRef = collection(db, 'deductions');
      
      await addDoc(deductionsRef, {
        userId: uid,
        title: 'Office Supplies',
        amount: 125.99,
        date: threeMonthsAgo,
        category: 'Office Supplies',
        notes: 'Purchased printer ink and paper',
        jobProfileId: freelanceProfileId,
        receiptUrl: 'https://firebasestorage.googleapis.com/v0/b/deductly-app.appspot.com/o/sample-receipts%2Foffice-supplies.jpg?alt=media',
        createdAt: serverTimestamp()
      });
      
      await addDoc(deductionsRef, {
        userId: uid,
        title: 'Business Lunch',
        amount: 45.75,
        date: twoMonthsAgo,
        category: 'Meals',
        notes: 'Lunch with client discussing project',
        jobProfileId: consultingProfileId,
        receiptUrl: 'https://firebasestorage.googleapis.com/v0/b/deductly-app.appspot.com/o/sample-receipts%2Fbusiness-lunch.jpg?alt=media',
        createdAt: serverTimestamp()
      });
      
      await addDoc(deductionsRef, {
        userId: uid,
        title: 'Software Subscription',
        amount: 29.99,
        date: oneMonthAgo,
        category: 'Software',
        notes: 'Monthly Adobe Creative Cloud subscription',
        jobProfileId: freelanceProfileId,
        receiptUrl: 'https://firebasestorage.googleapis.com/v0/b/deductly-app.appspot.com/o/sample-receipts%2Fsoftware.jpg?alt=media',
        createdAt: serverTimestamp()
      });
      
      await addDoc(deductionsRef, {
        userId: uid,
        title: 'Conference Registration',
        amount: 299.00,
        date: lastWeek,
        category: 'Professional Development',
        notes: 'Annual industry conference registration fee',
        jobProfileId: consultingProfileId,
        receiptUrl: 'https://firebasestorage.googleapis.com/v0/b/deductly-app.appspot.com/o/sample-receipts%2Fconference.jpg?alt=media',
        createdAt: serverTimestamp()
      });
    } else {
      console.log('Deductions already exist, skipping creation');
    }
    
    // Add sample mileage entries
    console.log('Creating sample mileage entries...');
    
    // Check if mileage entries already exist
    const mileageRef = collection(db, 'mileageEntries');
    const mileageQuery = query(mileageRef, where('userId', '==', uid));
    const existingMileage = await getDocs(mileageQuery);
    
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
      
      const mileageEntriesRef = collection(db, 'mileageEntries');
      
      await addDoc(mileageEntriesRef, {
        userId: uid,
        startLocation: '123 Main St, San Francisco, CA',
        endLocation: '456 Market St, San Francisco, CA',
        distance: 5.2,
        date: twoWeeksAgo,
        purpose: 'Client meeting',
        jobProfileId: consultingProfileId,
        createdAt: serverTimestamp()
      });
      
      await addDoc(mileageEntriesRef, {
        userId: uid,
        startLocation: '456 Market St, San Francisco, CA',
        endLocation: '123 Main St, San Francisco, CA',
        distance: 5.2,
        date: twoWeeksAgo,
        purpose: 'Return from client meeting',
        jobProfileId: consultingProfileId,
        createdAt: serverTimestamp()
      });
      
      await addDoc(mileageEntriesRef, {
        userId: uid,
        startLocation: '123 Main St, San Francisco, CA',
        endLocation: '789 Howard St, San Francisco, CA',
        distance: 3.8,
        date: tenDaysAgo,
        purpose: 'Meeting with potential client',
        jobProfileId: freelanceProfileId,
        createdAt: serverTimestamp()
      });
      
      await addDoc(mileageEntriesRef, {
        userId: uid,
        startLocation: '123 Main St, San Francisco, CA',
        endLocation: '555 Mission St, San Francisco, CA',
        distance: 2.5,
        date: fiveDaysAgo,
        purpose: 'Networking event',
        jobProfileId: consultingProfileId,
        createdAt: serverTimestamp()
      });
      
      await addDoc(mileageEntriesRef, {
        userId: uid,
        startLocation: '123 Main St, San Francisco, CA',
        endLocation: '200 California St, San Francisco, CA',
        distance: 4.1,
        date: yesterday,
        purpose: 'Client presentation',
        jobProfileId: consultingProfileId,
        createdAt: serverTimestamp()
      });
    } else {
      console.log('Mileage entries already exist, skipping creation');
    }
    
    // Add recurring deduction templates
    console.log('Creating recurring deduction templates...');
    
    // Check if recurring deductions already exist
    const recurringRef = collection(db, 'recurringDeductions');
    const recurringQuery = query(recurringRef, where('userId', '==', uid));
    const existingRecurring = await getDocs(recurringQuery);
    
    if (existingRecurring.empty) {
      // Next month date for recurring deductions
      const nextMonth = new Date();
      nextMonth.setMonth(today.getMonth() + 1);
      nextMonth.setDate(1); // First day of next month
      
      // This month date for last generated
      const thisMonth = new Date();
      thisMonth.setDate(1); // First day of this month
      
      const recurringDeductionsRef = collection(db, 'recurringDeductions');
      
      await addDoc(recurringDeductionsRef, {
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
        createdAt: serverTimestamp()
      });
      
      await addDoc(recurringDeductionsRef, {
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
        createdAt: serverTimestamp()
      });
      
      await addDoc(recurringDeductionsRef, {
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
        createdAt: serverTimestamp()
      });
      
      // Quarterly expense
      const nextQuarter = new Date();
      nextQuarter.setMonth(Math.floor((today.getMonth() + 3) / 3) * 3);
      nextQuarter.setDate(1);
      
      const lastQuarter = new Date();
      lastQuarter.setMonth(Math.floor(today.getMonth() / 3) * 3);
      lastQuarter.setDate(1);
      
      await addDoc(recurringDeductionsRef, {
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
        createdAt: serverTimestamp()
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
      
      await addDoc(recurringDeductionsRef, {
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
        createdAt: serverTimestamp()
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
