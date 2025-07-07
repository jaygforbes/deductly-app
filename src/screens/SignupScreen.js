import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const { theme } = useTheme();

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    const result = await signup(email, password);
    setIsLoading(false);

    if (!result.success) {
      Alert.alert('Signup Failed', result.error);
    }
  };

  const styles = StyleSheet.create({
    button: {
      alignItems: 'center',
      backgroundColor: theme.primary,
      borderRadius: 10,
      marginBottom: 15,
      padding: 15,
      width: '100%',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    container: {
      backgroundColor: theme.background,
      flex: 1,
      padding: 20,
    },
    innerContainer: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      width: '100%',
    },
    input: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderRadius: 10,
      borderWidth: 1,
      color: theme.text,
      marginBottom: 15,
      padding: 15,
    },
    inputContainer: {
      marginBottom: 20,
      width: '100%',
    },
    link: {
      color: theme.primary,
      fontSize: 16,
    },
    linkContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 20,
      width: '100%',
    },
    logo: {
      color: theme.primary,
      fontSize: 40,
      fontWeight: 'bold',
      marginBottom: 40,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.innerContainer}
      >
        <Text style={styles.logo}>Create Account</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={theme.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={theme.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor={theme.textSecondary}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          
          <TouchableOpacity 
            style={styles.button}
            onPress={handleSignup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.linkContainer}>
          <Text style={{ color: theme.text }}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignupScreen;
