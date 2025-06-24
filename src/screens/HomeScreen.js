import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useProfile } from '../contexts/ProfileContext';
import DeductionModule from '../modules/DeductionModule';
import MileageModule from '../modules/MileageModule';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { activeProfile } = useProfile();
  const [recentDeductions, setRecentDeductions] = useState([]);
  const [recentTrips, setRecentTrips] = useState([]);
  const [summary, setSummary] = useState({
    totalDeductions: 0,
    totalMiles: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Get recent deductions
      const deductionsResult = await DeductionModule.getDeductions(user.uid, {
        profileId: activeProfile?.id,
        limit: 5
      });
      
      if (deductionsResult.success) {
        setRecentDeductions(deductionsResult.deductions);
      }
      
      // Get recent trips
      // This would be implemented in the MileageModule
      // For now, we'll use placeholder data
      setRecentTrips([]);
      
      // Get summary data
      const summaryData = {
        totalDeductions: deductionsResult.success 
          ? deductionsResult.deductions.reduce((sum, item) => sum + (item.amount || 0), 0)
          : 0,
        totalMiles: 0 // Would come from MileageModule
      };
      
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, activeProfile]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString();
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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    profileName: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
    },
    summaryContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    summaryCard: {
      flex: 1,
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 4,
      shadowColor: theme.cardShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    summaryLabel: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 8,
    },
    summaryValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 12,
      marginTop: 16,
    },
    card: {
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
    cardRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.text,
    },
    cardAmount: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.primary,
    },
    cardSubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 4,
    },
    cardCategory: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 8,
      backgroundColor: theme.surface,
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    actionButton: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginBottom: 12,
    },
    actionButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 16,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    emptyStateText: {
      color: theme.textSecondary,
      fontSize: 16,
      textAlign: 'center',
      marginTop: 12,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={() => (
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.profileName}>
                {activeProfile ? activeProfile.name : 'All Profiles'}
              </Text>
            </View>

            <View style={styles.summaryContainer}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Total Deductions</Text>
                <Text style={styles.summaryValue}>{formatCurrency(summary.totalDeductions)}</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Total Miles</Text>
                <Text style={styles.summaryValue}>{summary.totalMiles.toFixed(1)}</Text>
              </View>
            </View>

            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <TouchableOpacity 
                style={[styles.actionButton, {flex: 1, marginRight: 8}]}
                onPress={() => navigation.navigate('Add', { screen: 'AddDeduction' })}
              >
                <Text style={styles.actionButtonText}>Add Deduction</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, {flex: 1, marginLeft: 8}]}
                onPress={() => navigation.navigate('Mileage', { screen: 'MileageTrip' })}
              >
                <Text style={styles.actionButtonText}>Start Trip</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Recent Deductions</Text>
            
            {recentDeductions.length > 0 ? (
              recentDeductions.map(deduction => (
                <TouchableOpacity 
                  key={deduction.id} 
                  style={styles.card}
                  onPress={() => navigation.navigate('DeductionDetails', { deductionId: deduction.id })}
                >
                  <View style={styles.cardRow}>
                    <Text style={styles.cardTitle}>{deduction.title}</Text>
                    <Text style={styles.cardAmount}>{formatCurrency(deduction.amount)}</Text>
                  </View>
                  <Text style={styles.cardSubtitle}>{formatDate(deduction.date)}</Text>
                  <Text style={styles.cardCategory}>{deduction.category}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={48} color={theme.textSecondary} />
                <Text style={styles.emptyStateText}>No recent deductions. Add one to get started!</Text>
              </View>
            )}

            <Text style={styles.sectionTitle}>Recent Trips</Text>
            
            {recentTrips.length > 0 ? (
              recentTrips.map(trip => (
                <TouchableOpacity 
                  key={trip.id} 
                  style={styles.card}
                >
                  <View style={styles.cardRow}>
                    <Text style={styles.cardTitle}>{trip.purpose}</Text>
                    <Text style={styles.cardAmount}>{trip.distanceMiles.toFixed(1)} mi</Text>
                  </View>
                  <Text style={styles.cardSubtitle}>{formatDate(trip.startTime)}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="car-outline" size={48} color={theme.textSecondary} />
                <Text style={styles.emptyStateText}>No recent trips. Start tracking a trip to log your mileage!</Text>
              </View>
            )}
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
      />
    </SafeAreaView>
  );
};

export default HomeScreen;
