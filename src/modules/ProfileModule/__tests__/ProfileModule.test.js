import ProfileModule from '../index';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  deleteDoc 
} from 'firebase/firestore';

// Mock Firestore
jest.mock('firebase/firestore');

describe('ProfileModule', () => {
  const mockUserId = 'test-user-123';
  const mockProfileId = 'test-profile-123';
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Firestore functions
    getFirestore.mockReturnValue({});
    collection.mockReturnValue({});
    doc.mockReturnValue({});
  });

  describe('createProfile', () => {
    it('should create a profile successfully', async () => {
      const mockProfileData = {
        name: 'Freelance Design',
        type: 'Self-employed',
        description: 'Graphic design work'
      };
      
      // Use mockImplementationOnce for more reliable mock with the correct ID
      addDoc.mockImplementationOnce(() => Promise.resolve({ id: 'test-profile-123' }));
      
      const result = await ProfileModule.createProfile(mockUserId, mockProfileData);
      
      expect(addDoc).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.profileId).toBe(mockProfileId);
      
      // Verify the data passed to addDoc includes the original data plus createdAt
      const addDocArgs = addDoc.mock.calls[0][1];
      expect(addDocArgs.name).toBe(mockProfileData.name);
      expect(addDocArgs.type).toBe(mockProfileData.type);
      expect(addDocArgs.createdAt).toBeInstanceOf(Date);
    });
    
    it('should handle errors when creating a profile', async () => {
      const mockProfileData = {
        name: 'Freelance Design'
      };
      
      const mockError = new Error('Create profile error');
      // Use mockImplementationOnce for more reliable rejection
      addDoc.mockImplementationOnce(() => Promise.reject(mockError));
      
      const result = await ProfileModule.createProfile(mockUserId, mockProfileData);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(mockError.message);
    });
  });

  describe('updateProfile', () => {
    it('should update a profile successfully', async () => {
      const mockUpdateData = {
        name: 'Updated Design Business',
        description: 'Updated description'
      };
      
      updateDoc.mockResolvedValueOnce({});
      
      const result = await ProfileModule.updateProfile(
        mockUserId, 
        mockProfileId, 
        mockUpdateData
      );
      
      expect(updateDoc).toHaveBeenCalled();
      expect(result.success).toBe(true);
      
      // Verify the data passed to updateDoc includes the original data plus updatedAt
      const updateDocArgs = updateDoc.mock.calls[0][1];
      expect(updateDocArgs.name).toBe(mockUpdateData.name);
      expect(updateDocArgs.description).toBe(mockUpdateData.description);
      expect(updateDocArgs.updatedAt).toBeInstanceOf(Date);
    });
    
    it('should handle errors when updating a profile', async () => {
      const mockUpdateData = {
        name: 'Updated Design Business'
      };
      
      const mockError = new Error('Update profile error');
      // Use mockImplementationOnce for more reliable rejection
      updateDoc.mockImplementationOnce(() => Promise.reject(mockError));
      
      const result = await ProfileModule.updateProfile(
        mockUserId, 
        mockProfileId, 
        mockUpdateData
      );
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(mockError.message);
    });
  });

  describe('deleteProfile', () => {
    it('should delete a profile successfully', async () => {
      deleteDoc.mockResolvedValueOnce({});
      
      const result = await ProfileModule.deleteProfile(mockUserId, mockProfileId);
      
      expect(deleteDoc).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
    
    it('should handle errors when deleting a profile', async () => {
      const mockError = new Error('Delete profile error');
      // Use mockImplementationOnce for more reliable rejection
      deleteDoc.mockImplementationOnce(() => Promise.reject(mockError));
      
      const result = await ProfileModule.deleteProfile(mockUserId, mockProfileId);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(mockError.message);
    });
  });

  describe('getProfile', () => {
    it('should get a profile by ID successfully', async () => {
      // Define profile data that matches what's expected
      const mockProfileData = {
        name: 'Freelance Design',
        type: 'Self-employed',
        createdAt: new Date()
      };
      
      // Create a custom mock for this test
      getDoc.mockImplementationOnce(() => Promise.resolve({
        exists: () => true,
        id: mockProfileId,
        data: () => mockProfileData
      }));
      
      const result = await ProfileModule.getProfile(mockUserId, mockProfileId);
      
      expect(getDoc).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.profile).toEqual({
        id: mockProfileId,
        ...mockProfileData
      });
    });
    
    it('should handle non-existent profile', async () => {
      // Create a custom mock that returns a document that doesn't exist
      getDoc.mockImplementationOnce(() => Promise.resolve({
        exists: () => false,
        id: mockProfileId
      }));
      
      const result = await ProfileModule.getProfile(mockUserId, mockProfileId);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Profile not found');
    });
    
    it('should handle errors when getting a profile', async () => {
      const mockError = new Error('Get profile error');
      // Use mockImplementationOnce for more reliable rejection
      getDoc.mockImplementationOnce(() => Promise.reject(mockError));
      
      const result = await ProfileModule.getProfile(mockUserId, mockProfileId);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(mockError.message);
    });
  });

  describe('getProfiles', () => {
    it('should get all profiles for a user', async () => {
      // Create mock profile data with correct IDs
      const mockProfiles = [
        { name: 'Profile 1', category: 'Business' },
        { name: 'Profile 2', category: 'Personal' }
      ];
      
      // Use withCustomForEach to create a custom forEach implementation
      getDocs.withCustomForEach((callback) => {
        mockProfiles.forEach((profile, index) => {
          callback({
            id: `profile-${index + 1}`,
            data: () => profile
          });
        });
      });
      
      const result = await ProfileModule.getProfiles(mockUserId);
      
      expect(getDocs).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.profiles.length).toBe(2);
      expect(result.profiles[0].id).toBe('profile-1');
      expect(result.profiles[1].id).toBe('profile-2');
    });
    
    it('should handle errors when getting profiles', async () => {
      const mockError = new Error('Get profiles error');
      // Use failNextCall helper method for more reliable rejection
      getDocs.failNextCall(mockError.message);
      
      const result = await ProfileModule.getProfiles(mockUserId);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(mockError.message);
    });
  });

  describe('getProfileSummary', () => {
    it('should get profile summary successfully', async () => {
      // Mock profile data
      const mockProfileData = {
        name: 'Freelance Design',
        type: 'Self-employed'
      };
      
      // Mock getProfile result
      jest.spyOn(ProfileModule, 'getProfile').mockResolvedValueOnce({
        success: true,
        profile: { id: mockProfileId, ...mockProfileData }
      });
      
      // Mock deductions for this profile
      const mockDeductions = [
        { id: 'deduction-1', profileId: mockProfileId, amount: 100 },
        { id: 'deduction-2', profileId: mockProfileId, amount: 200 },
        { id: 'deduction-3', profileId: 'other-profile', amount: 300 } // Different profile
      ];
      
      const mockDeductionsForEach = jest.fn((callback) => {
        mockDeductions.forEach((item) => {
          callback({
            id: item.id,
            data: () => item
          });
        });
      });
      
      // Mock trips for this profile
      const mockTrips = [
        { id: 'trip-1', profileId: mockProfileId, distanceMiles: 50 },
        { id: 'trip-2', profileId: mockProfileId, distanceMiles: 75 },
        { id: 'trip-3', profileId: 'other-profile', distanceMiles: 100 } // Different profile
      ];
      
      const mockTripsForEach = jest.fn((callback) => {
        mockTrips.forEach((item) => {
          callback({
            id: item.id,
            data: () => item
          });
        });
      });
      
      // Set up mock getDocs calls using our helper methods
      getDocs
        .withCustomForEach(mockDeductionsForEach)
        .withCustomForEach(mockTripsForEach);
      
      const result = await ProfileModule.getProfileSummary(mockUserId, mockProfileId);
      
      expect(result.success).toBe(true);
      expect(result.summary.profile).toEqual({ id: mockProfileId, ...mockProfileData });
      expect(result.summary.deductionCount).toBe(2); // Only deductions for this profile
      expect(result.summary.totalDeductions).toBe(300); // 100 + 200
      expect(result.summary.tripCount).toBe(2); // Only trips for this profile
      expect(result.summary.totalMiles).toBe(125); // 50 + 75
    });
    
    it('should handle profile not found', async () => {
      // Mock profile not found
      jest.spyOn(ProfileModule, 'getProfile').mockResolvedValueOnce({
        success: false,
        error: 'Profile not found'
      });
      
      const result = await ProfileModule.getProfileSummary(mockUserId, mockProfileId);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Profile not found');
      expect(getDocs).not.toHaveBeenCalled();
    });
    
    it('should handle errors when getting profile summary', async () => {
      // Mock successful profile retrieval
      jest.spyOn(ProfileModule, 'getProfile').mockResolvedValueOnce({
        success: true,
        profile: { id: mockProfileId, name: 'Test Profile' }
      });
      
      // Mock error in getDocs using our failNextCall helper
      const mockError = new Error('Get summary error');
      getDocs.failNextCall(mockError.message);
      
      const result = await ProfileModule.getProfileSummary(mockUserId, mockProfileId);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(mockError.message);
    });
  });
});
