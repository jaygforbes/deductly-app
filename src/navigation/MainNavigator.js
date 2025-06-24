import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import AddDeductionScreen from '../screens/AddDeductionScreen';
import MileageScreen from '../screens/MileageScreen';
import ReportsScreen from '../screens/ReportsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfilesScreen from '../screens/ProfilesScreen';
import CreateProfileScreen from '../screens/CreateProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ReceiptCaptureScreen from '../screens/ReceiptCaptureScreen';
import MileageTripScreen from '../screens/MileageTripScreen';
import DeductionDetailsScreen from '../screens/DeductionDetailsScreen';
import RecurringDeductionsScreen from '../screens/RecurringDeductionsScreen';
import RecurringDeductionFormScreen from '../screens/RecurringDeductionFormScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const AddStack = createStackNavigator();
const MileageStack = createStackNavigator();
const ReportsStack = createStackNavigator();
const SettingsStack = createStackNavigator();

// Home Stack
const HomeStackNavigator = () => {
  const { theme } = useTheme();
  
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.background,
          shadowColor: theme.cardShadow,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <HomeStack.Screen name="Dashboard" component={HomeScreen} />
      <HomeStack.Screen name="DeductionDetails" component={DeductionDetailsScreen} options={{ title: 'Deduction Details' }} />
    </HomeStack.Navigator>
  );
};

// Add Stack
const AddStackNavigator = () => {
  const { theme } = useTheme();
  
  return (
    <AddStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.background,
          shadowColor: theme.cardShadow,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <AddStack.Screen name="AddDeduction" component={AddDeductionScreen} options={{ title: 'Add Deduction' }} />
      <AddStack.Screen name="ReceiptCapture" component={ReceiptCaptureScreen} options={{ title: 'Capture Receipt' }} />
    </AddStack.Navigator>
  );
};

// Mileage Stack
const MileageStackNavigator = () => {
  const { theme } = useTheme();
  
  return (
    <MileageStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.background,
          shadowColor: theme.cardShadow,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <MileageStack.Screen name="MileageHome" component={MileageScreen} options={{ title: 'Mileage' }} />
      <MileageStack.Screen name="MileageTrip" component={MileageTripScreen} options={{ title: 'Trip Tracking' }} />
    </MileageStack.Navigator>
  );
};

// Reports Stack
const ReportsStackNavigator = () => {
  const { theme } = useTheme();
  
  return (
    <ReportsStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.background,
          shadowColor: theme.cardShadow,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <ReportsStack.Screen name="ReportsHome" component={ReportsScreen} options={{ title: 'Reports' }} />
    </ReportsStack.Navigator>
  );
};

// Settings Stack
const SettingsStackNavigator = () => {
  const { theme } = useTheme();
  
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.background,
          shadowColor: theme.cardShadow,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <SettingsStack.Screen name="SettingsHome" component={SettingsScreen} options={{ title: 'Settings' }} />
      <SettingsStack.Screen name="Profiles" component={ProfilesScreen} options={{ title: 'Job Profiles' }} />
      <SettingsStack.Screen name="CreateProfile" component={CreateProfileScreen} options={{ title: 'Create Profile' }} />
      <SettingsStack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
      <SettingsStack.Screen name="RecurringDeductions" component={RecurringDeductionsScreen} options={{ title: 'Recurring Deductions' }} />
      <SettingsStack.Screen name="AddRecurringDeduction" component={RecurringDeductionFormScreen} options={{ title: 'Add Recurring Deduction' }} />
      <SettingsStack.Screen name="EditRecurringDeduction" component={RecurringDeductionFormScreen} options={{ title: 'Edit Recurring Deduction' }} />
    </SettingsStack.Navigator>
  );
};

// Main Tab Navigator
const MainNavigator = () => {
  const { theme } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Add') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Mileage') {
            iconName = focused ? 'car' : 'car-outline';
          } else if (route.name === 'Reports') {
            iconName = focused ? 'pie-chart' : 'pie-chart-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="Add" component={AddStackNavigator} />
      <Tab.Screen name="Mileage" component={MileageStackNavigator} />
      <Tab.Screen name="Reports" component={ReportsStackNavigator} />
      <Tab.Screen name="Settings" component={SettingsStackNavigator} />
    </Tab.Navigator>
  );
};

export default MainNavigator;
