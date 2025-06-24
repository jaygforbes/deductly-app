import { getFirestore, collection, addDoc, doc, updateDoc, getDoc, getDocs, deleteDoc } from 'firebase/firestore';

class ProfileModule {
  constructor() {
    this.db = getFirestore();
  }

  /**
   * Create a new job profile
   * @param {string} userId - Current user ID
   * @param {object} profileData - Profile data
   * @returns {Promise} - Result with profile ID
   */
  async createProfile(userId, profileData) {
    try {
      const profilesRef = collection(this.db, 'users', userId, 'profiles');
      
      const docData = {
        ...profileData,
        createdAt: new Date(),
      };
      
      const docRef = await addDoc(profilesRef, docData);
      
      return { success: true, profileId: docRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update an existing job profile
   * @param {string} userId - Current user ID
   * @param {string} profileId - Profile ID to update
   * @param {object} profileData - Updated profile data
   * @returns {Promise} - Result of update operation
   */
  async updateProfile(userId, profileId, profileData) {
    try {
      const profileRef = doc(this.db, 'users', userId, 'profiles', profileId);
      
      await updateDoc(profileRef, {
        ...profileData,
        updatedAt: new Date(),
      });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a job profile
   * @param {string} userId - Current user ID
   * @param {string} profileId - Profile ID to delete
   * @returns {Promise} - Result of delete operation
   */
  async deleteProfile(userId, profileId) {
    try {
      const profileRef = doc(this.db, 'users', userId, 'profiles', profileId);
      await deleteDoc(profileRef);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get a profile by ID
   * @param {string} userId - Current user ID
   * @param {string} profileId - Profile ID to retrieve
   * @returns {Promise} - Result with profile data
   */
  async getProfile(userId, profileId) {
    try {
      const profileRef = doc(this.db, 'users', userId, 'profiles', profileId);
      const profileDoc = await getDoc(profileRef);
      
      if (!profileDoc.exists()) {
        return { success: false, error: 'Profile not found' };
      }
      
      return { success: true, profile: { id: profileDoc.id, ...profileDoc.data() } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all profiles for a user
   * @param {string} userId - Current user ID
   * @returns {Promise} - Result with profiles array
   */
  async getProfiles(userId) {
    try {
      const profilesRef = collection(this.db, 'users', userId, 'profiles');
      const querySnapshot = await getDocs(profilesRef);
      
      const profiles = [];
      querySnapshot.forEach((doc) => {
        profiles.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, profiles };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get summary statistics for a profile
   * @param {string} userId - Current user ID
   * @param {string} profileId - Profile ID
   * @returns {Promise} - Result with profile summary data
   */
  async getProfileSummary(userId, profileId) {
    try {
      // Get the profile
      const profileResult = await this.getProfile(userId, profileId);
      if (!profileResult.success) {
        return profileResult;
      }
      
      // Get deductions for this profile
      const deductionsRef = collection(this.db, 'users', userId, 'deductions');
      const querySnapshot = await getDocs(deductionsRef);
      
      const deductions = [];
      let totalDeductions = 0;
      
      querySnapshot.forEach((doc) => {
        const deduction = doc.data();
        if (deduction.profileId === profileId) {
          deductions.push({ id: doc.id, ...deduction });
          totalDeductions += (deduction.amount || 0);
        }
      });
      
      // Get trips for this profile
      const tripsRef = collection(this.db, 'users', userId, 'trips');
      const tripsSnapshot = await getDocs(tripsRef);
      
      const trips = [];
      let totalMiles = 0;
      
      tripsSnapshot.forEach((doc) => {
        const trip = doc.data();
        if (trip.profileId === profileId) {
          trips.push({ id: doc.id, ...trip });
          totalMiles += (trip.distanceMiles || 0);
        }
      });
      
      return {
        success: true,
        summary: {
          profile: profileResult.profile,
          deductionCount: deductions.length,
          totalDeductions,
          tripCount: trips.length,
          totalMiles,
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new ProfileModule();
