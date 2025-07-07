import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import AuthModule from '../modules/AuthModule';

const ForgotPasswordScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Missing Field', 'Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      const result = await AuthModule.resetPassword(email.trim());
      
      if (result.success) {
        Alert.alert(
          'Password Reset Email Sent', 
          'Please check your email for instructions to reset your password.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        throw new Error(result.error || 'Failed to send password reset email');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const styles = StyleSheet.create({
    backButton: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 24,
    },
    backButtonText: {
      color: theme.primary,
      fontSize: 16,
      fontWeight: '500',
      marginLeft: 4,
    },
    container: {
      backgroundColor: theme.background,
      flex: 1,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      padding: 24,
    },
    header: {
      alignItems: 'center',
      marginBottom: 32,
    },
    input: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderRadius: 8,
      borderWidth: 1,
      color: theme.text,
      fontSize: 16,
      padding: 16,
    },
    inputGroup: {
      marginBottom: 24,
    },
    label: {
      color: theme.text,
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 8,
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      zIndex: 1000,
    },
    resetButton: {
      alignItems: 'center',
      backgroundColor: theme.primary,
      borderRadius: 12,
      marginTop: 8,
      padding: 16,
    },
    resetButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '600',
    },
    subtitle: {
      color: theme.textSecondary,
      fontSize: 16,
      marginBottom: 24,
      textAlign: 'center',
    },
    title: {
      color: theme.text,
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 12,
      textAlign: 'center',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you instructions to reset your password
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={theme.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity 
            style={styles.resetButton}
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            <Text style={styles.resetButtonText}>Send Reset Link</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Ionicons name="arrow-back" size={18} color={theme.primary} />
            <Text style={styles.backButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;
