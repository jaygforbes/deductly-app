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

const ProfilesScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { profiles, activeProfile, setActiveProfile, deleteProfile } = useProfile();
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectProfile = (profile) => {
    setActiveProfile(profile);
    navigation.goBack();
  };

  const handleEditProfile = (profile) => {
    navigation.navigate('EditProfile', { profileId: profile.id });
  };

  const handleDeleteProfile = async (profile) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete "${profile.name}"? This will not delete any associated deductions or trips.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: async () => {
            setIsLoading(true);
            const result = await deleteProfile(profile.id);
            setIsLoading(false);
            
            if (!result.success) {
              Alert.alert('Error', result.error || 'Failed to delete profile');
            }
          },
          style: 'destructive' 
        }
      ]
    );
  };

  const renderProfileItem = ({ item }) => {
    const isActive = activeProfile && activeProfile.id === item.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.profileCard,
          isActive && styles.activeProfileCard
        ]}
        onPress={() => handleSelectProfile(item)}
      >
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, isActive && styles.activeProfileText]}>
            {item.name}
          </Text>
          <Text style={[styles.profileDetails, isActive && styles.activeProfileText]}>
            {item.businessType || 'Business'} • Created {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={styles.profileActions}>
          {isActive && (
            <View style={styles.activeIndicator}>
              <Text style={styles.activeText}>Active</Text>
            </View>
          )}
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditProfile(item)}
          >
            <Ionicons name="pencil-outline" size={20} color={theme.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteProfile(item)}
          >
            <Ionicons name="trash-outline" size={20} color={theme.error} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      padding: 16,
      flex: 1,
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
    profileCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      shadowColor: theme.cardShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    activeProfileCard: {
      backgroundColor: theme.primary,
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
    },
    profileDetails: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    activeProfileText: {
      color: '#FFFFFF',
    },
    profileActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 8,
    },
    activeIndicator: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      marginRight: 8,
    },
    activeText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
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
    },
    createButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.primary,
      borderRadius: 12,
      padding: 16,
      marginTop: 24,
    },
    createButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 16,
      marginLeft: 8,
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
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Job Profiles</Text>
          <Text style={styles.subtitle}>
            Select a profile to track deductions and mileage
          </Text>
        </View>

        {profiles.length > 0 ? (
          <FlatList
            data={profiles}
            renderItem={renderProfileItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={64} color={theme.textSecondary} />
            <Text style={styles.emptyText}>
              You don't have any job profiles yet. Create one to start tracking your deductions.
            </Text>
          </View>
        )}

        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateProfile')}
        >
          <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.createButtonText}>Create New Profile</Text>
        </TouchableOpacity>
      </View>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}
    </SafeAreaView>
  );
};

export default ProfilesScreen;
