import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useProfile } from '../contexts/ProfileContext';
import MileageModule from '../modules/MileageModule';

const MileageScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { activeProfile } = useProfile();
  
  const [isLoading, setIsLoading] = useState(true);
  const [trips, setTrips] = useState([]);
  const [stats, setStats] = useState({
    totalMiles: 0,
    totalTrips: 0,
    totalDuration: 0
  });
  const [filterPeriod, setFilterPeriod] = useState('month');

  useEffect(() => {
    loadTrips();
  }, [user, activeProfile, filterPeriod]);

  const loadTrips = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const result = await MileageModule.getTrips(
        user.uid,
        filterPeriod,
        activeProfile?.id
      );
      
      if (result.success) {
        setTrips(result.trips);
        
        // Calculate stats
        const totalMiles = result.trips.reduce((sum, trip) => sum + (trip.distance || 0), 0);
        const totalTrips = result.trips.length;
        const totalDuration = result.trips.reduce((sum, trip) => {
          const duration = (trip.endTime - trip.startTime) / (1000 * 60); // in minutes
          return sum + duration;
        }, 0);
        
        setStats({
          totalMiles,
          totalTrips,
          totalDuration
        });
      } else {
        Alert.alert('Error', result.error || 'Failed to load trips');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTrip = () => {
    navigation.navigate('MileageTrip');
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const renderTripItem = ({ item }) => {
    const startDate = new Date(item.startTime);
    const endDate = new Date(item.endTime);
    const duration = (endDate - startDate) / (1000 * 60); // in minutes
    
    return (
      <TouchableOpacity 
        style={styles.tripCard}
        onPress={() => {
          // Navigate to trip details (could be implemented in future)
        }}
      >
        <View style={styles.tripHeader}>
          <Text style={styles.tripDate}>
            {startDate.toLocaleDateString()} • {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          <Text style={styles.tripDistance}>{item.distance.toFixed(1)} mi</Text>
        </View>
        
        <View style={styles.tripDetails}>
          <View style={styles.locationContainer}>
            <View style={styles.locationDot} />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.startAddress || 'Start location'}
            </Text>
          </View>
          
          <View style={styles.locationLine} />
          
          <View style={styles.locationContainer}>
            <View style={[styles.locationDot, styles.endDot]} />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.endAddress || 'End location'}
            </Text>
          </View>
        </View>
        
        <View style={styles.tripFooter}>
          <Text style={styles.tripProfile}>
            {item.profileName || 'No profile'}
          </Text>
          <Text style={styles.tripDuration}>
            {formatDuration(duration)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterOptions = () => {
    const options = [
      { label: 'This Month', value: 'month' },
      { label: 'This Year', value: 'year' },
      { label: 'All Time', value: 'all' }
    ];
    
    return (
      <View style={styles.filterContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.filterChip,
              filterPeriod === option.value ? styles.filterChipSelected : styles.filterChipUnselected
            ]}
            onPress={() => setFilterPeriod(option.value)}
          >
            <Text
              style={[
                styles.filterText,
                filterPeriod === option.value ? styles.filterTextSelected : styles.filterTextUnselected
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
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
    header: {
      marginBottom: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
    },
    subtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      marginTop: 4,
    },
    filterContainer: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    filterChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      marginRight: 8,
    },
    filterChipSelected: {
      backgroundColor: theme.primary,
    },
    filterChipUnselected: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    filterText: {
      fontSize: 14,
    },
    filterTextSelected: {
      color: '#FFFFFF',
    },
    filterTextUnselected: {
      color: theme.text,
    },
    statsCard: {
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
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    statsLabel: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    statsValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
    },
    totalMiles: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 8,
    },
    tripCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: theme.cardShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    tripHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    tripDate: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    tripDistance: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.primary,
    },
    tripDetails: {
      marginBottom: 12,
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 4,
    },
    locationDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: '#4CAF50',
      marginRight: 8,
    },
    endDot: {
      backgroundColor: '#F44336',
    },
    locationText: {
      fontSize: 14,
      color: theme.text,
      flex: 1,
    },
    locationLine: {
      width: 2,
      height: 16,
      backgroundColor: theme.border,
      marginLeft: 5,
    },
    tripFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    tripProfile: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    tripDuration: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    startButton: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 8,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    startButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 16,
      marginLeft: 8,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    emptyText: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: 16,
      marginBottom: 24,
    },
    loadingContainer: {
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Mileage Tracking</Text>
          <Text style={styles.subtitle}>
            Track business miles for tax deductions
          </Text>
        </View>

        {renderFilterOptions()}

        <View style={styles.statsCard}>
          <Text style={styles.totalMiles}>
            {stats.totalMiles.toFixed(1)} miles
          </Text>
          
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Total Trips</Text>
            <Text style={styles.statsValue}>{stats.totalTrips}</Text>
          </View>
          
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Total Duration</Text>
            <Text style={styles.statsValue}>{formatDuration(stats.totalDuration)}</Text>
          </View>
          
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Profile</Text>
            <Text style={styles.statsValue}>{activeProfile?.name || 'All Profiles'}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.startButton}
          onPress={handleStartTrip}
        >
          <Ionicons name="car" size={20} color="#FFFFFF" />
          <Text style={styles.startButtonText}>Start New Trip</Text>
        </TouchableOpacity>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : trips.length > 0 ? (
          <FlatList
            data={trips}
            renderItem={renderTripItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingTop: 16 }}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="car-outline" size={64} color={theme.textSecondary} />
            <Text style={styles.emptyText}>
              No trips recorded yet. Start tracking your business miles to maximize your tax deductions.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default MileageScreen;
