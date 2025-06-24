import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import * as SecureStore from 'expo-secure-store';

class AuthModule {
  constructor() {
    this.auth = getAuth();
  }

  /**
   * Sign in a user with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise} - Result of sign in attempt
   */
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      await this.storeUserSession(userCredential.user.uid);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a new user account with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise} - Result of sign up attempt
   */
  async signUp(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      await this.storeUserSession(userCredential.user.uid);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Sign out the current user
   * @returns {Promise} - Result of sign out attempt
   */
  async signOut() {
    try {
      await this.auth.signOut();
      await this.clearUserSession();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Send password reset email
   * @param {string} email - User's email
   * @returns {Promise} - Result of password reset attempt
   */
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(this.auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Store user session securely in device keychain
   * @param {string} uid - User ID to store
   * @returns {Promise} - Result of storage attempt
   */
  async storeUserSession(uid) {
    try {
      await SecureStore.setItemAsync('userToken', uid);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear user session from device keychain
   * @returns {Promise} - Result of clear attempt
   */
  async clearUserSession() {
    try {
      await SecureStore.deleteItemAsync('userToken');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if user has a stored session
   * @returns {Promise} - User ID if session exists, null otherwise
   */
  async checkUserSession() {
    try {
      const userToken = await SecureStore.getItemAsync('userToken');
      return userToken;
    } catch (error) {
      console.error('Error checking user session:', error);
      return null;
    }
  }
}

export default new AuthModule();
