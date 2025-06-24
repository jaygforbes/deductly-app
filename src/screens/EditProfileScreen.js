import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useProfile } from '../contexts/ProfileContext';

const EditProfileScreen = ({ navigation, route }) => {
  const { profileId } = route.params;
  const { user } = useAuth();
  const { theme } = useTheme();
  const { profiles, updateProfile } = useProfile();
  
  const [name, setName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  const businessTypes = [
    'Freelance', 
    'Self-Employed', 
    'Small Business', 
    'Contractor', 
    'Rideshare', 
    'Delivery', 
    'Rental', 
    'Other'
  ];

  useEffect(() => {
    const currentProfile = profiles.find(p => p.id === profileId);
    if (currentProfile) {
      setProfile(currentProfile);
      setName(currentProfile.name || '');
      setBusinessType(currentProfile.businessType || '');
      setDescription(currentProfile.description || '');
    } else {
      Alert.alert('Error', 'Profile not found');
      navigation.goBack();
    }
  }, [profileId, profiles]);

  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Field', 'Please enter a profile name');
      return;
    }

    setIsLoading(true);

    try {
      const updatedProfileData = {
        ...profile,
        name: name.trim(),
        businessType: businessType || 'Other',
        description: description.trim(),
        updatedAt: new Date()
      };

      const result = await updateProfile(profileId, updatedProfileData);
      
      if (result.success) {
        Alert.alert(
          'Success', 
          'Profile updated successfully',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        throw new Error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
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
      marginBottom: 24,
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
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: theme.surface,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: theme.text,
      borderWidth: 1,
      borderColor: theme.border,
    },
    businessTypesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 8,
    },
    typeChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      marginRight: 8,
      marginBottom: 8,
    },
    typeChipSelected: {
      backgroundColor: theme.primary,
    },
    typeChipUnselected: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    typeText: {
      fontSize: 14,
    },
    typeTextSelected: {
      color: '#FFFFFF',
    },
    typeTextUnselected: {
      color: theme.text,
    },
    updateButton: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 24,
    },
    updateButtonText: {
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

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit Job Profile</Text>
            <Text style={styles.subtitle}>
              Update your job profile details
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Profile Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Rideshare Driver, Freelance Design"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Business Type</Text>
            <View style={styles.businessTypesContainer}>
              {businessTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeChip,
                    businessType === type ? styles.typeChipSelected : styles.typeChipUnselected
                  ]}
                  onPress={() => setBusinessType(type)}
                >
                  <Text
                    style={[
                      styles.typeText,
                      businessType === type ? styles.typeTextSelected : styles.typeTextUnselected
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add any additional details about this job profile"
              placeholderTextColor={theme.textSecondary}
              multiline
            />
          </View>

          <TouchableOpacity 
            style={styles.updateButton}
            onPress={handleUpdate}
            disabled={isLoading}
          >
            <Text style={styles.updateButtonText}>Update Profile</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}
    </SafeAreaView>
  );
};

export default EditProfileScreen;
