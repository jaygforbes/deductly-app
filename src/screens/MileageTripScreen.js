import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useProfile } from '../contexts/ProfileContext';
import MileageModule from '../modules/MileageModule';

const MileageTripScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { activeProfile, profiles } = useProfile();
  const [isTracking, setIsTracking] = useState(false);
  const [tripStatus, setTripStatus] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [tripPurpose, setTripPurpose] = useState('Business Travel');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [tripPath, setTripPath] = useState([]);
  const [timer, setTimer] = useState(null);

  useEffect(() => {
    // Check if there's an active trip when the component mounts
    checkActiveTrip();
    
    // Clean up timer when component unmounts
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, []);

  const checkActiveTrip = () => {
    const status = MileageModule.getTripStatus();
    
    if (status.isTracking) {
      setIsTracking(true);
      setTripStatus(status);
      setElapsedTime(status.elapsedMinutes);
      
      // Start the timer
      startTimer();
    }
  };

  const startTimer = () => {
    const intervalId = setInterval(() => {
      setElapsedTime(prev => prev + 1/60); // Increment by 1 second (1/60 of a minute)
    }, 1000);
    
    setTimer(intervalId);
  };

  const handleStartTrip = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to track trips');
      return;
    }
    
    if (!activeProfile) {
      Alert.alert('No Profile Selected', 'Please select or create a job profile first');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await MileageModule.startTrip(user.uid, activeProfile.id, tripPurpose);
      
      if (result.success) {
        setIsTracking(true);
        setElapsedTime(0);
        startTimer();
        
        // Update trip status
        const status = MileageModule.getTripStatus();
        setTripStatus(status);
        
        Alert.alert('Success', 'Trip tracking started');
      } else {
        Alert.alert('Error', result.error || 'Failed to start trip');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndTrip = async () => {
    if (!isTracking) return;
    
    setIsLoading(true);
    
    try {
      const result = await MileageModule.endTrip(user.uid);
      
      if (result.success) {
        setIsTracking(false);
        setTripStatus(null);
        
        if (timer) {
          clearInterval(timer);
          setTimer(null);
        }
        
        Alert.alert(
          'Trip Completed',
          `Distance: ${result.tripData.distanceMiles.toFixed(2)} miles\nDuration: ${result.tripData.durationMinutes} minutes`,
          [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to end trip');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    const secs = Math.floor((minutes * 60) % 60);
    
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    mapContainer: {
      height: 200,
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 16,
    },
    map: {
      ...StyleSheet.absoluteFillObject,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: theme.cardShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
    },
    statLabel: {
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 4,
    },
    purposeText: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    profileText: {
      fontSize: 16,
      color: theme.textSecondary,
      marginBottom: 16,
    },
    button: {
      backgroundColor: isTracking ? theme.error : theme.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 16,
    },
    buttonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 18,
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 37.78825,
              longitude: -122.4324,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            {currentLocation && (
              <Marker
                coordinate={{
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                }}
                title="Current Location"
              />
            )}
            {tripPath.length > 0 && (
              <Polyline
                coordinates={tripPath}
                strokeColor={theme.primary}
                strokeWidth={3}
              />
            )}
          </MapView>
        </View>

        <View style={styles.card}>
          <Text style={styles.purposeText}>
            {isTracking ? tripStatus?.purpose || tripPurpose : 'Start New Trip'}
          </Text>
          <Text style={styles.profileText}>
            Profile: {activeProfile ? activeProfile.name : 'No profile selected'}
          </Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {isTracking ? formatDuration(elapsedTime) : '00:00:00'}
              </Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {isTracking && tripStatus ? tripStatus.distanceMiles.toFixed(2) : '0.00'}
              </Text>
              <Text style={styles.statLabel}>Miles</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={isTracking ? handleEndTrip : handleStartTrip}
          disabled={isLoading || (!isTracking && !activeProfile)}
        >
          <Text style={styles.buttonText}>
            {isTracking ? 'End Trip' : 'Start Trip'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}
    </SafeAreaView>
  );
};

export default MileageTripScreen;
