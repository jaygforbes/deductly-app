import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useProfile } from '../contexts/ProfileContext';

const SettingsScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { activeProfile } = useProfile();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    const result = await logout();
    setIsLoading(false);
    
    if (!result.success) {
      Alert.alert('Error', result.error || 'Failed to log out');
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: handleLogout, style: 'destructive' }
      ]
    );
  };

  const styles = StyleSheet.create({
    button: {
      alignItems: 'center',
      backgroundColor: theme.primary,
      borderRadius: 12,
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 8,
      padding: 16,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 12,
      elevation: 2,
      marginBottom: 16,
      padding: 16,
      shadowColor: theme.cardShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    container: {
      backgroundColor: theme.background,
      flex: 1,
    },
    content: {
      padding: 16,
    },
    email: {
      color: theme.textSecondary,
      fontSize: 16,
    },
    header: {
      marginBottom: 24,
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      zIndex: 1000,
    },
    logoutButton: {
      backgroundColor: theme.error,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      color: theme.text,
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 16,
    },
    settingLabel: {
      color: theme.text,
      fontSize: 16,
    },
    settingRow: {
      alignItems: 'center',
      borderBottomColor: theme.border,
      borderBottomWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 12,
    },
    settingRowLast: {
      borderBottomWidth: 0,
    },
    settingValue: {
      color: theme.textSecondary,
      fontSize: 16,
    },
    title: {
      color: theme.text,
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 8,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Profiles</Text>
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.settingRow}
              onPress={() => navigation.navigate('Profiles')}
            >
              <Text style={styles.settingLabel}>Manage Profiles</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.settingValue}>
                  {activeProfile ? activeProfile.name : 'None selected'}
                </Text>
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color={theme.textSecondary} 
                  style={{ marginLeft: 8 }}
                />
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('CreateProfile')}
          >
            <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Create New Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: '#767577', true: theme.primary }}
                thumbColor={'#f4f3f4'}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recurring Deductions</Text>
          <View style={styles.card}>
            <TouchableOpacity 
              style={[styles.settingRow, styles.settingRowLast]}
              onPress={() => navigation.navigate('RecurringDeductions')}
            >
              <Text style={styles.settingLabel}>Manage Recurring Deductions</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color={theme.textSecondary} 
                  style={{ marginLeft: 8 }}
                />
              </View>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('AddRecurringDeduction')}
          >
            <Ionicons name="repeat" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Create Recurring Deduction</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingLabel}>Export Data (CSV)</Text>
              <Ionicons name="download-outline" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.settingRow, styles.settingRowLast]}>
              <Text style={styles.settingLabel}>Backup to Cloud</Text>
              <Ionicons name="cloud-upload-outline" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.button, styles.logoutButton]}
          onPress={confirmLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Log Out</Text>
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

export default SettingsScreen;
