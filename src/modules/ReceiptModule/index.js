import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';

class ReceiptModule {
  constructor() {
    this.storage = getStorage();
    this.db = getFirestore();
  }

  /**
   * Request camera permissions from the user
   * @returns {Promise} - Result of permission request
   */
  async requestCameraPermissions() {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        return { success: false, error: 'Camera permission not granted' };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Request media library permissions from the user
   * @returns {Promise} - Result of permission request
   */
  async requestMediaLibraryPermissions() {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        return { success: false, error: 'Media library permission not granted' };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Take a photo using the device camera
   * @returns {Promise} - Result with image data
   */
  async takePhoto() {
    try {
      const permissionResult = await this.requestCameraPermissions();
      if (!permissionResult.success) {
        return permissionResult;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled) {
        return { success: false, error: 'User cancelled camera' };
      }

      return { success: true, image: result.assets[0] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Pick an image from the device's media library
   * @returns {Promise} - Result with image data
   */
  async pickImage() {
    try {
      const permissionResult = await this.requestMediaLibraryPermissions();
      if (!permissionResult.success) {
        return permissionResult;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled) {
        return { success: false, error: 'User cancelled image picker' };
      }

      return { success: true, image: result.assets[0] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Upload a receipt image to Firebase Storage
   * @param {string} userId - Current user ID
   * @param {object} imageData - Image data from camera or picker
   * @returns {Promise} - Result with download URL
   */
  async uploadReceiptImage(userId, imageData) {
    try {
      const timestamp = new Date().getTime();
      const filename = `${userId}_${timestamp}.jpg`;
      const storageRef = ref(this.storage, `receipts/${userId}/${filename}`);

      // Fetch the image data
      const response = await fetch(imageData.uri);
      const blob = await response.blob();

      // Upload to Firebase Storage
      const snapshot = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(snapshot.ref);

      return { success: true, downloadURL };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Save receipt data to Firestore
   * @param {string} userId - Current user ID
   * @param {object} receiptData - Receipt data including image URL
   * @returns {Promise} - Result with receipt ID
   */
  async saveReceipt(userId, receiptData) {
    try {
      const receiptsRef = collection(this.db, 'users', userId, 'receipts');
      
      const docData = {
        ...receiptData,
        timestamp: new Date(),
        createdAt: new Date(),
      };
      
      const docRef = await addDoc(receiptsRef, docData);
      
      return { success: true, receiptId: docRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update an existing receipt
   * @param {string} userId - Current user ID
   * @param {string} receiptId - Receipt ID to update
   * @param {object} receiptData - Updated receipt data
   * @returns {Promise} - Result of update operation
   */
  async updateReceipt(userId, receiptId, receiptData) {
    try {
      const receiptRef = doc(this.db, 'users', userId, 'receipts', receiptId);
      
      await updateDoc(receiptRef, {
        ...receiptData,
        updatedAt: new Date(),
      });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get a receipt by ID
   * @param {string} userId - Current user ID
   * @param {string} receiptId - Receipt ID to retrieve
   * @returns {Promise} - Result with receipt data
   */
  async getReceipt(userId, receiptId) {
    try {
      const receiptRef = doc(this.db, 'users', userId, 'receipts', receiptId);
      const receiptDoc = await getDoc(receiptRef);
      
      if (!receiptDoc.exists()) {
        return { success: false, error: 'Receipt not found' };
      }
      
      return { success: true, receipt: { id: receiptDoc.id, ...receiptDoc.data() } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new ReceiptModule();
