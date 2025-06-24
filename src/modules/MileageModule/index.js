import * as Location from 'expo-location';
import { getFirestore, collection, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';

class MileageModule {
  constructor() {
    this.db = getFirestore();
    this.isTracking = false;
    this.currentTrip = null;
    this.locationSubscription = null;
    this.tripLocations = [];
    this.startTime = null;
    this.locationAccuracy = Location.Accuracy.Balanced; // Balance between accuracy and battery usage
  }

  /**
   * Request location permissions from the user
   * @returns {Promise} - Result of permission request
   */
  async requestLocationPermissions() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return { success: false, error: 'Location permission not granted' };
      }
      
      const backgroundStatus = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus.status !== 'granted') {
        return { 
          success: true, 
          warning: 'Background location permission not granted. Tracking will stop when app is in background.'
        };
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Start tracking a new trip
   * @param {string} userId - Current user ID
   * @param {string} profileId - Job profile ID for this trip
   * @param {string} purpose - Purpose of the trip
   * @returns {Promise} - Result of starting trip
   */
  async startTrip(userId, profileId, purpose) {
    if (this.isTracking) {
      return { success: false, error: 'A trip is already in progress' };
    }

    try {
      // Request permissions if not already granted
      const permissionResult = await this.requestLocationPermissions();
      if (!permissionResult.success) {
        return permissionResult;
      }

      // Create a new trip document in Firestore
      const tripData = {
        userId,
        profileId,
        purpose,
        startTime: new Date(),
        status: 'in_progress',
        distanceMiles: 0,
        distanceKm: 0,
      };

      const tripsRef = collection(this.db, 'users', userId, 'trips');
      const docRef = await addDoc(tripsRef, tripData);
      
      // Set up tracking
      this.isTracking = true;
      this.currentTrip = docRef.id;
      this.tripLocations = [];
      this.startTime = new Date();
      
      // Start location tracking
      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: this.locationAccuracy,
          timeInterval: 5000,    // Update every 5 seconds
          distanceInterval: 10,  // Or when moved 10 meters
        },
        this.onLocationUpdate.bind(this)
      );
      
      return { success: true, tripId: docRef.id };
    } catch (error) {
      this.isTracking = false;
      this.currentTrip = null;
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle location updates during trip
   * @param {object} location - Location data from Expo Location
   */
  onLocationUpdate(location) {
    if (!this.isTracking || !this.currentTrip) return;
    
    this.tripLocations.push({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      timestamp: new Date(),
      accuracy: location.coords.accuracy,
      altitude: location.coords.altitude,
      speed: location.coords.speed,
    });
  }

  /**
   * Calculate distance between two coordinates in kilometers
   * @param {number} lat1 - Latitude of first point
   * @param {number} lon1 - Longitude of first point
   * @param {number} lat2 - Latitude of second point
   * @param {number} lon2 - Longitude of second point
   * @returns {number} - Distance in kilometers
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  }

  /**
   * Convert degrees to radians
   * @param {number} deg - Degrees
   * @returns {number} - Radians
   */
  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  /**
   * Calculate total distance of the trip
   * @returns {object} - Distance in kilometers and miles
   */
  calculateTotalDistance() {
    if (this.tripLocations.length < 2) {
      return { km: 0, miles: 0 };
    }
    
    let totalDistanceKm = 0;
    
    for (let i = 1; i < this.tripLocations.length; i++) {
      const prevLocation = this.tripLocations[i - 1];
      const currLocation = this.tripLocations[i];
      
      const segmentDistance = this.calculateDistance(
        prevLocation.latitude, prevLocation.longitude,
        currLocation.latitude, currLocation.longitude
      );
      
      totalDistanceKm += segmentDistance;
    }
    
    const totalDistanceMiles = totalDistanceKm * 0.621371;
    
    return {
      km: totalDistanceKm,
      miles: totalDistanceMiles
    };
  }

  /**
   * End the current trip
   * @param {string} userId - Current user ID
   * @returns {Promise} - Result of ending trip with trip data
   */
  async endTrip(userId) {
    if (!this.isTracking || !this.currentTrip) {
      return { success: false, error: 'No trip in progress' };
    }
    
    try {
      // Stop location tracking
      if (this.locationSubscription) {
        this.locationSubscription.remove();
        this.locationSubscription = null;
      }
      
      const endTime = new Date();
      const distance = this.calculateTotalDistance();
      const durationMs = endTime - this.startTime;
      const durationMinutes = Math.round(durationMs / 60000);
      
      // Update trip in Firestore
      const tripRef = doc(this.db, 'users', userId, 'trips', this.currentTrip);
      await updateDoc(tripRef, {
        endTime,
        status: 'completed',
        distanceKm: distance.km,
        distanceMiles: distance.miles,
        durationMinutes,
        locations: this.tripLocations,
      });
      
      // Get the updated trip data
      const tripDoc = await getDoc(tripRef);
      const tripData = { id: tripDoc.id, ...tripDoc.data() };
      
      // Reset tracking state
      const completedTripId = this.currentTrip;
      this.isTracking = false;
      this.currentTrip = null;
      this.tripLocations = [];
      this.startTime = null;
      
      return { 
        success: true, 
        tripId: completedTripId,
        tripData
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get the current trip status
   * @returns {object} - Current trip status
   */
  getTripStatus() {
    if (!this.isTracking) {
      return { isTracking: false };
    }
    
    const currentDistance = this.calculateTotalDistance();
    const elapsedMs = new Date() - this.startTime;
    const elapsedMinutes = Math.round(elapsedMs / 60000);
    
    return {
      isTracking: true,
      tripId: this.currentTrip,
      startTime: this.startTime,
      elapsedMinutes,
      distanceKm: currentDistance.km,
      distanceMiles: currentDistance.miles,
      locationCount: this.tripLocations.length
    };
  }
}

export default new MileageModule();
