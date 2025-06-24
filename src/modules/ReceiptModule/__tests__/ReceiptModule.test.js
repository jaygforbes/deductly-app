import ReceiptModule from '../index';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';

// Mock dependencies
jest.mock('expo-image-picker');
jest.mock('firebase/storage');
jest.mock('firebase/firestore');

describe('ReceiptModule', () => {
  const mockUserId = 'test-user-123';
  const mockReceiptId = 'test-receipt-123';
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Firebase functions
    getStorage.mockReturnValue({});
    getFirestore.mockReturnValue({});
    collection.mockReturnValue({});
    doc.mockReturnValue({});
    ref.mockReturnValue({});
    
    // Mock fetch for image upload
    global.fetch = jest.fn(() => 
      Promise.resolve({
        blob: () => Promise.resolve(new Blob(['mock-image-data']))
      })
    );
  });

  describe('requestCameraPermissions', () => {
    it('should return success when permissions are granted', async () => {
      ImagePicker.requestCameraPermissionsAsync.mockResolvedValueOnce({ status: 'granted' });
      
      const result = await ReceiptModule.requestCameraPermissions();
      
      expect(ImagePicker.requestCameraPermissionsAsync).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
    
    it('should return error when permissions are denied', async () => {
      // Use mockImplementationOnce for more reliable rejection
      ImagePicker.requestCameraPermissionsAsync.mockImplementationOnce(() => 
        Promise.resolve({ status: 'denied' })
      );
      
      const result = await ReceiptModule.requestCameraPermissions();
      
      // The implementation correctly returns success: false for denied permissions
      expect(result.success).toBe(false);
      expect(result.error).toBe('Camera permission not granted');
    });
    
    it('should handle errors during permission request', async () => {
      const mockError = new Error('Permission error');
      ImagePicker.requestCameraPermissionsAsync.mockRejectedValueOnce(mockError);
      
      const result = await ReceiptModule.requestCameraPermissions();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(mockError.message);
    });
  });

  describe('requestMediaLibraryPermissions', () => {
    it('should return success when permissions are granted', async () => {
      ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValueOnce({ status: 'granted' });
      
      const result = await ReceiptModule.requestMediaLibraryPermissions();
      
      expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
    
    it('should return error when permissions are denied', async () => {
      // Use mockImplementationOnce for more reliable rejection
      ImagePicker.requestMediaLibraryPermissionsAsync.mockImplementationOnce(() => 
        Promise.resolve({ status: 'denied' })
      );
      
      const result = await ReceiptModule.requestMediaLibraryPermissions();
      
      // The implementation correctly returns success: false for denied permissions
      expect(result.success).toBe(false);
      expect(result.error).toBe('Media library permission not granted');
    });
  });

  describe('takePhoto', () => {
    it('should take a photo successfully', async () => {
      // Mock successful permission
      ImagePicker.requestCameraPermissionsAsync.mockImplementationOnce(() => 
        Promise.resolve({ status: 'granted' })
      );
      
      // Mock successful camera launch with the correct asset format
      const mockImageAsset = {
        uri: 'test-uri',
        width: 100,
        height: 100,
        fileName: 'test-image.jpg',
        type: 'image'
      };
      
      ImagePicker.launchCameraAsync.mockImplementationOnce(() => 
        Promise.resolve({
          canceled: false,
          assets: [mockImageAsset]
        })
      );
      
      const result = await ReceiptModule.takePhoto();
      
      expect(ImagePicker.launchCameraAsync).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.image).toEqual(mockImageAsset);
    });
    
    it('should handle user cancellation', async () => {
      // Mock successful permission
      ImagePicker.requestCameraPermissionsAsync.mockImplementationOnce(() => 
        Promise.resolve({ status: 'granted' })
      );
      
      // Mock user cancellation - use mockImplementationOnce for more reliable behavior
      ImagePicker.launchCameraAsync.mockImplementationOnce(() => 
        Promise.resolve({
          canceled: true,
          assets: null
        })
      );
      
      const result = await ReceiptModule.takePhoto();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('User cancelled camera');
    });
    
    it('should handle permission denial', async () => {
      // Reset any previous mocks
      ImagePicker.launchCameraAsync.mockReset();
      
      // Mock permission denial
      ImagePicker.requestCameraPermissionsAsync.mockImplementationOnce(() => 
        Promise.resolve({ status: 'denied' })
      );
      
      const result = await ReceiptModule.takePhoto();
      
      expect(ImagePicker.launchCameraAsync).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Camera permission not granted');
    });
  });

  describe('pickImage', () => {
    it('should pick an image successfully', async () => {
      // Mock successful permission
      ImagePicker.requestMediaLibraryPermissionsAsync.mockImplementationOnce(() => 
        Promise.resolve({ status: 'granted' })
      );
      
      // Create a mock image asset that matches what the implementation expects
      const mockImageAsset = {
        uri: 'test-uri',
        width: 100,
        height: 100,
        fileName: 'test-image.jpg',
        type: 'image'
      };
      
      // Mock successful image picker with the correct asset format
      ImagePicker.launchImageLibraryAsync.mockImplementationOnce(() => 
        Promise.resolve({
          canceled: false,
          assets: [mockImageAsset]
        })
      );
      
      const result = await ReceiptModule.pickImage();
      
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.image).toEqual(mockImageAsset);
    });
    
    it('should handle user cancellation', async () => {
      // Mock successful permission
      ImagePicker.requestMediaLibraryPermissionsAsync.mockImplementationOnce(() => 
        Promise.resolve({ status: 'granted' })
      );
      
      // Mock user cancellation
      ImagePicker.launchImageLibraryAsync.mockImplementationOnce(() => 
        Promise.resolve({
          canceled: true,
          assets: null
        })
      );
      
      const result = await ReceiptModule.pickImage();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('User cancelled image picker');
    });
  });

  describe('uploadReceiptImage', () => {
    it('should upload an image successfully', async () => {
      const mockImageData = {
        uri: 'file://test-image.jpg'
      };
      
      const mockDownloadURL = 'https://firebasestorage.example.com/receipts/test-image.jpg';
      
      uploadBytes.mockResolvedValueOnce({ ref: {} });
      getDownloadURL.mockResolvedValueOnce(mockDownloadURL);
      
      const result = await ReceiptModule.uploadReceiptImage(mockUserId, mockImageData);
      
      expect(fetch).toHaveBeenCalledWith(mockImageData.uri);
      expect(ref).toHaveBeenCalled();
      expect(uploadBytes).toHaveBeenCalled();
      expect(getDownloadURL).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.downloadURL).toBe(mockDownloadURL);
    });
    
    it('should handle upload errors', async () => {
      const mockImageData = {
        uri: 'file://test-image.jpg'
      };
      
      const mockError = new Error('Upload error');
      uploadBytes.mockRejectedValueOnce(mockError);
      
      const result = await ReceiptModule.uploadReceiptImage(mockUserId, mockImageData);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(mockError.message);
    });
  });

  describe('saveReceipt', () => {
    it('should save receipt data successfully', async () => {
      const mockReceiptData = {
        imageUrl: 'https://example.com/receipt.jpg',
        merchant: 'Test Store',
        amount: 125.50,
        date: new Date('2025-06-01'),
        category: 'Office Supplies'
      };
      
      // Use mockImplementationOnce with the correct ID
      addDoc.mockImplementationOnce(() => Promise.resolve({ id: 'test-receipt-123' }));
      
      const result = await ReceiptModule.saveReceipt(mockUserId, mockReceiptData);
      
      expect(addDoc).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.receiptId).toBe(mockReceiptId);
    });
    
    it('should handle errors when saving receipt', async () => {
      const mockReceiptData = {
        imageUrl: 'https://example.com/receipt.jpg'
      };
      
      const mockError = new Error('Save error');
      // Use mockImplementationOnce for more reliable rejection
      addDoc.mockImplementationOnce(() => Promise.reject(mockError));
      
      const result = await ReceiptModule.saveReceipt(mockUserId, mockReceiptData);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(mockError.message);
    });
  });

  describe('updateReceipt', () => {
    it('should update receipt data successfully', async () => {
      const mockUpdateData = {
        merchant: 'Updated Store',
        amount: 150.75
      };
      
      updateDoc.mockResolvedValueOnce({});
      
      const result = await ReceiptModule.updateReceipt(
        mockUserId, 
        mockReceiptId, 
        mockUpdateData
      );
      
      expect(updateDoc).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
    
    it('should handle errors when updating receipt', async () => {
      const mockUpdateData = {
        merchant: 'Updated Store'
      };
      
      const mockError = new Error('Update error');
      // Use mockImplementationOnce for more reliable rejection
      updateDoc.mockImplementationOnce(() => Promise.reject(mockError));
      
      const result = await ReceiptModule.updateReceipt(
        mockUserId, 
        mockReceiptId, 
        mockUpdateData
      );
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(mockError.message);
    });
  });

  describe('getReceipt', () => {
    it('should get a receipt by ID successfully', async () => {
      // Create mock data that matches what the implementation expects
      const mockReceiptData = {
        imageUrl: 'https://example.com/receipt.jpg',
        merchant: 'Test Store',
        amount: 125.50
      };
      
      // Mock the Firestore document with the correct ID
      getDoc.mockImplementationOnce(() => Promise.resolve({
        exists: () => true,
        id: mockReceiptId,
        data: () => mockReceiptData
      }));
      
      const result = await ReceiptModule.getReceipt(mockUserId, mockReceiptId);
      
      expect(getDoc).toHaveBeenCalled();
      expect(result.success).toBe(true);
      // Expect the receipt to match our mock data
      expect(result.receipt).toEqual({
        id: mockReceiptId,
        ...mockReceiptData
      });
    });
    
    it('should handle non-existent receipt', async () => {
      // Use mockImplementationOnce for more reliable mock
      getDoc.mockImplementationOnce(() => Promise.resolve({
        exists: () => false
      }));
      
      const result = await ReceiptModule.getReceipt(mockUserId, mockReceiptId);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Receipt not found');
    });
    
    it('should handle errors when getting a receipt', async () => {
      const mockError = new Error('Get error');
      // Use mockImplementationOnce for more reliable rejection
      getDoc.mockImplementationOnce(() => Promise.reject(mockError));
      
      const result = await ReceiptModule.getReceipt(mockUserId, mockReceiptId);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(mockError.message);
    });
  });
});
