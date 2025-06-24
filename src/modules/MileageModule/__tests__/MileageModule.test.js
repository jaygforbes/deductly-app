import MileageModule from '../index';
import * as Location from 'expo-location';
import { getFirestore, collection, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';

// Mock dependencies
jest.mock('expo-location');
jest.mock('firebase/firestore');

describe('MileageModule', () => {
  const mockUserId = 'test-user-123';
  const mockProfileId = 'test-profile-123';
  const mockTripId = 'test-trip-123';
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset MileageModule state
    MileageModule.isTracking = false;
    MileageModule.currentTrip = null;
    MileageModule.tripLocations = [];
    MileageModule.startTime = null;
    
    // Create a mock locationSubscription with a remove method
    const mockLocationSubscription = { remove: jest.fn() };
    MileageModule.locationSubscription = mockLocationSubscription;
    
    // Mock Firestore functions
    getFirestore.mockReturnValue({});
    collection.mockReturnValue({});
    doc.mockReturnValue({});
    
    // Mock Location functions
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    Location.requestBackgroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    Location.watchPositionAsync.mockResolvedValue(mockLocationSubscription);
    
    // Reset updateDoc to default success behavior
    updateDoc.mockImplementation(() => Promise.resolve());
  });

  describe('requestLocationPermissions', () => {
    it('should return success when permissions are granted', async () => {
      const result = await MileageModule.requestLocationPermissions();
      
      expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
      expect(Location.requestBackgroundPermissionsAsync).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
    
    it('should return error when foreground permission is denied', async () => {
      // Use mockImplementationOnce for more reliable mock
      Location.requestForegroundPermissionsAsync.mockImplementationOnce(() => 
        Promise.resolve({ status: 'denied' })
      );
      
      const result = await MileageModule.requestLocationPermissions();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Location permission not granted');
    });
    
    it('should return warning when background permission is denied', async () => {
      // Mock foreground permission granted but background denied
      Location.requestForegroundPermissionsAsync.mockImplementationOnce(() => 
        Promise.resolve({ status: 'granted' })
      );
      Location.requestBackgroundPermissionsAsync.mockImplementationOnce(() => 
        Promise.resolve({ status: 'denied' })
      );
      
      const result = await MileageModule.requestLocationPermissions();
      
      expect(result.success).toBe(true);
      expect(result.warning).toContain('Background location permission not granted');
    });
    
    it('should handle errors during permission request', async () => {
      const mockError = new Error('Permission error');
      // Use mockImplementationOnce for more reliable rejection
      Location.requestForegroundPermissionsAsync.mockImplementationOnce(() => 
        Promise.reject(mockError)
      );
      
      const result = await MileageModule.requestLocationPermissions();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(mockError.message);
    });
  });

  describe('startTrip', () => {
    it('should start a trip successfully', async () => {
      // Reset tracking state before test
      MileageModule.isTracking = false;
      MileageModule.currentTrip = null;
      
      // Create a custom mock that returns the expected ID
      addDoc.mockImplementationOnce(() => Promise.resolve({ id: mockTripId }));
      
      // Mock the location subscription
      const mockRemove = jest.fn();
      Location.watchPositionAsync.mockImplementationOnce(() => Promise.resolve({
        remove: mockRemove
      }));
      
      const result = await MileageModule.startTrip(
        mockUserId, 
        mockProfileId, 
        'Business meeting'
      );
      
      expect(addDoc).toHaveBeenCalled();
      expect(Location.watchPositionAsync).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.tripId).toBe(mockTripId);
      expect(MileageModule.isTracking).toBe(true);
      expect(MileageModule.currentTrip).toBe(mockTripId);
    });
    
    it('should not start a trip if one is already in progress', async () => {
      // Set tracking state to simulate trip in progress
      MileageModule.isTracking = true;
      MileageModule.currentTrip = 'existing-trip';
      
      const result = await MileageModule.startTrip(
        mockUserId, 
        mockProfileId, 
        'Business meeting'
      );
      
      expect(addDoc).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.error).toBe('A trip is already in progress');
    });
    
    it('should handle permission denial', async () => {
      // Reset tracking state before test
      MileageModule.isTracking = false;
      MileageModule.currentTrip = null;
      
      // Mock permission denial with a more reliable implementation
      Location.requestForegroundPermissionsAsync.mockImplementationOnce(() => 
        Promise.resolve({ status: 'denied' })
      );
      
      const result = await MileageModule.startTrip(
        mockUserId, 
        mockProfileId, 
        'Business meeting'
      );
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Location permission not granted');
      expect(MileageModule.isTracking).toBe(false);
    });
    
    it('should handle errors when starting a trip', async () => {
      const mockError = new Error('Start trip error');
      // Use mockImplementationOnce for more reliable rejection
      addDoc.mockImplementationOnce(() => Promise.reject(mockError));
      
      // Reset tracking state before test
      MileageModule.isTracking = false;
      MileageModule.currentTrip = null;
      
      const result = await MileageModule.startTrip(
        mockUserId, 
        mockProfileId, 
        'Business meeting'
      );
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(mockError.message);
      expect(MileageModule.isTracking).toBe(false);
    });
  });

  describe('onLocationUpdate', () => {
    it('should add location to tripLocations when tracking', () => {
      // Set up tracking state
      MileageModule.isTracking = true;
      MileageModule.currentTrip = mockTripId;
      MileageModule.tripLocations = [];
      
      const mockLocation = {
        coords: {
          latitude: 37.7749,
          longitude: -122.4194,
          accuracy: 5,
          altitude: 10,
          speed: 20
        }
      };
      
      MileageModule.onLocationUpdate(mockLocation);
      
      expect(MileageModule.tripLocations.length).toBe(1);
      expect(MileageModule.tripLocations[0].latitude).toBe(mockLocation.coords.latitude);
      expect(MileageModule.tripLocations[0].longitude).toBe(mockLocation.coords.longitude);
    });
    
    it('should not add location when not tracking', () => {
      // Ensure tracking is off
      MileageModule.isTracking = false;
      MileageModule.tripLocations = [];
      
      const mockLocation = {
        coords: {
          latitude: 37.7749,
          longitude: -122.4194
        }
      };
      
      MileageModule.onLocationUpdate(mockLocation);
      
      expect(MileageModule.tripLocations.length).toBe(0);
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance between two points correctly', () => {
      // San Francisco to Los Angeles (approximate)
      const lat1 = 37.7749;
      const lon1 = -122.4194;
      const lat2 = 34.0522;
      const lon2 = -118.2437;
      
      // Expected distance is approximately 559 km
      const distance = MileageModule.calculateDistance(lat1, lon1, lat2, lon2);
      
      expect(distance).toBeCloseTo(559, -1); // Within 10 km
    });
    
    it('should return zero for identical points', () => {
      const lat = 37.7749;
      const lon = -122.4194;
      
      const distance = MileageModule.calculateDistance(lat, lon, lat, lon);
      
      expect(distance).toBe(0);
    });
  });

  describe('calculateTotalDistance', () => {
    it('should return zero for less than 2 locations', () => {
      MileageModule.tripLocations = [];
      
      const distance = MileageModule.calculateTotalDistance();
      
      expect(distance.km).toBe(0);
      expect(distance.miles).toBe(0);
    });
    
    it('should calculate total distance correctly for multiple points', () => {
      // Mock the calculateDistance method to return predictable values
      const originalCalculateDistance = MileageModule.calculateDistance;
      MileageModule.calculateDistance = jest.fn()
        .mockReturnValueOnce(77) // Distance from SF to San Jose
        .mockReturnValueOnce(28); // Distance from San Jose to Palo Alto
      
      // Create a simple path with known distances
      MileageModule.tripLocations = [
        { latitude: 37.7749, longitude: -122.4194 }, // San Francisco
        { latitude: 37.3382, longitude: -121.8863 }, // San Jose
        { latitude: 37.4419, longitude: -122.1430 }  // Palo Alto
      ];
      
      const distance = MileageModule.calculateTotalDistance();
      
      // Total should be exactly 105 km / 65.24 miles
      expect(distance.km).toBe(105);
      expect(distance.miles).toBeCloseTo(65.24, 1); // Within 0.1 miles
      
      // Restore the original method
      MileageModule.calculateDistance = originalCalculateDistance;
    });
  });

  describe('endTrip', () => {
    it('should end a trip successfully', async () => {
      // Set up tracking state
      MileageModule.isTracking = true;
      MileageModule.currentTrip = mockTripId;
      MileageModule.startTime = new Date(Date.now() - 30 * 60000); // 30 minutes ago
      MileageModule.tripLocations = [
        { latitude: 37.7749, longitude: -122.4194 },
        { latitude: 37.3382, longitude: -121.8863 }
      ];
      
      // Ensure locationSubscription is properly mocked before the test
      const mockRemove = jest.fn();
      MileageModule.locationSubscription = { remove: mockRemove };
      
      // Mock Firestore responses with more reliable implementation
      updateDoc.mockImplementationOnce(() => Promise.resolve({}));
      getDoc.mockImplementationOnce(() => Promise.resolve({
        id: mockTripId,
        data: () => ({
          distanceMiles: 50,
          distanceKm: 80.5,
          status: 'completed'
        })
      }));
      
      const result = await MileageModule.endTrip(mockUserId);
      
      expect(mockRemove).toHaveBeenCalled();
      expect(updateDoc).toHaveBeenCalled();
      expect(getDoc).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.tripId).toBe(mockTripId);
      expect(result.tripData).toBeDefined();
      expect(result.tripData.status).toBe('completed');
      
      // Verify tracking state was reset
      expect(MileageModule.isTracking).toBe(false);
      expect(MileageModule.currentTrip).toBeNull();
      expect(MileageModule.tripLocations).toEqual([]);
    });
    
    it('should return error if no trip is in progress', async () => {
      // Ensure tracking is off
      MileageModule.isTracking = false;
      MileageModule.currentTrip = null;
      
      const result = await MileageModule.endTrip(mockUserId);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('No trip in progress');
      expect(updateDoc).not.toHaveBeenCalled();
    });
    
    it('should handle errors when ending a trip', async () => {
      // Set up tracking state
      MileageModule.isTracking = true;
      MileageModule.currentTrip = mockTripId;
      MileageModule.tripLocations = [
        { latitude: 37.7749, longitude: -122.4194 },
        { latitude: 37.3382, longitude: -121.8863 }
      ];
      
      // Ensure locationSubscription is properly mocked
      const mockRemove = jest.fn();
      MileageModule.locationSubscription = { remove: mockRemove };
      
      // Force updateDoc to reject with an error
      const mockError = new Error('End trip error');
      updateDoc.mockImplementationOnce(() => Promise.reject(mockError));
      
      const result = await MileageModule.endTrip(mockUserId);
      
      // Even with error, remove should be called
      expect(mockRemove).toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.error).toBe(mockError.message);
    });
  });

  describe('getTripStatus', () => {
    it('should return not tracking when no trip is in progress', () => {
      MileageModule.isTracking = false;
      
      const status = MileageModule.getTripStatus();
      
      expect(status.isTracking).toBe(false);
    });
    
    it('should return current trip status when tracking', () => {
      // Set up tracking state
      MileageModule.isTracking = true;
      MileageModule.currentTrip = mockTripId;
      MileageModule.startTime = new Date(Date.now() - 15 * 60000); // 15 minutes ago
      MileageModule.tripLocations = [
        { latitude: 37.7749, longitude: -122.4194 },
        { latitude: 37.3382, longitude: -121.8863 }
      ];
      
      const status = MileageModule.getTripStatus();
      
      expect(status.isTracking).toBe(true);
      expect(status.tripId).toBe(mockTripId);
      expect(status.elapsedMinutes).toBeCloseTo(15, 0);
      expect(status.distanceKm).toBeGreaterThan(0);
      expect(status.distanceMiles).toBeGreaterThan(0);
      expect(status.locationCount).toBe(2);
    });
  });
});
