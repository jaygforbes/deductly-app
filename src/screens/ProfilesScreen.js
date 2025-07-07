import React, { useState } from 'react';
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
import { useTheme } from '../contexts/ThemeContext';
import { useProfile } from '../contexts/ProfileContext';

const ProfilesScreen = ({ navigation }) => {
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
    actionButton: {
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: 18,
      height: 36,
      justifyContent: 'center',
      marginLeft: 8,
      width: 36,
    },
    activeIndicator: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: 12,
      marginRight: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    activeProfileCard: {
      backgroundColor: theme.primary,
    },
    activeProfileText: {
      color: '#FFFFFF',
    },
    activeText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
    container: {
      backgroundColor: theme.background,
      flex: 1,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    createButton: {
      alignItems: 'center',
      backgroundColor: theme.primary,
      borderRadius: 12,
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 24,
      padding: 16,
    },
    createButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    emptyContainer: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      padding: 24,
    },
    emptyText: {
      color: theme.textSecondary,
      fontSize: 16,
      marginTop: 16,
      textAlign: 'center',
    },
    header: {
      marginBottom: 16,
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      zIndex: 1000,
    },
    profileActions: {
      alignItems: 'center',
      flexDirection: 'row',
    },
    profileCard: {
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 12,
      elevation: 2,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
      padding: 16,
      shadowColor: theme.cardShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    profileDetails: {
      color: theme.textSecondary,
      fontSize: 14,
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      color: theme.text,
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 4,
    },
    subtitle: {
      color: theme.textSecondary,
      fontSize: 16,
      marginTop: 4,
    },
    title: {
      color: theme.text,
      fontSize: 24,
      fontWeight: 'bold',
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
              You don&apos;t have any job profiles yet. Create one to start tracking your deductions.
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
