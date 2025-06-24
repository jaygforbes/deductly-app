import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AuthNavigator from './src/navigation/AuthNavigator';
import MainNavigator from './src/navigation/MainNavigator';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { ProfileProvider } from './src/contexts/ProfileContext';

// Initialize Firebase
import './src/firebase';

const AppContent = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // We could show a splash screen here
    return null;
  }

  return (
    <NavigationContainer>
      {user ? <MainNavigator /> : <AuthNavigator />}
      <StatusBar style="auto" />
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <ProfileProvider>
            <AppContent />
          </ProfileProvider>
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
