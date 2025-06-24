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
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useProfile } from '../contexts/ProfileContext';
import RecurringModule from '../modules/RecurringModule';

const RecurringDeductionFormScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { profiles, activeProfile } = useProfile();
  
  const isEditing = route.params?.templateId ? true : false;
  const templateId = route.params?.templateId;
  
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [notes, setNotes] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState(activeProfile ? activeProfile.id : '');
  const [isActive, setIsActive] = useState(true);
  
  const categories = [
    'Office Supplies',
    'Software',
    'Travel',
    'Meals',
    'Utilities',
    'Rent',
    'Insurance',
    'Professional Services',
    'Marketing',
    'Education',
    'Subscriptions',
    'Other'
  ];

  const frequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Every 2 Weeks' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  useEffect(() => {
    if (isEditing && templateId) {
      loadTemplate();
    }
  }, [templateId]);

  const loadTemplate = async () => {
    if (!user || !templateId) return;
    
    setIsLoading(true);
    try {
      const result = await RecurringModule.getTemplate(user.uid, templateId);
      
      if (result.success) {
        const template = result.template;
        setTitle(template.title || '');
        setAmount(template.amount ? template.amount.toString() : '');
        setCategory(template.category || '');
        setFrequency(template.frequency || 'monthly');
        setNotes(template.notes || '');
        setSelectedProfileId(template.profileId || '');
        setIsActive(template.isActive !== undefined ? template.isActive : true);
      } else {
        Alert.alert('Error', result.error || 'Failed to load template details');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', error.message);
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Missing Information', 'Please enter a title for this recurring deduction.');
      return false;
    }
    
    if (!amount.trim() || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than zero.');
      return false;
    }
    
    if (!category) {
      Alert.alert('Missing Information', 'Please select a category.');
      return false;
    }
    
    if (!selectedProfileId) {
      Alert.alert('Missing Information', 'Please select a job profile.');
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    if (!user) {
      Alert.alert('Error', 'You must be logged in to save recurring deductions.');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const selectedProfile = profiles.find(p => p.id === selectedProfileId);
      const templateData = {
        title: title.trim(),
        amount: parseFloat(amount),
        category,
        frequency,
        notes: notes.trim(),
        profileId: selectedProfileId,
        profileName: selectedProfile ? selectedProfile.name : 'Unknown Profile',
        isActive
      };
      
      let result;
      
      if (isEditing && templateId) {
        result = await RecurringModule.updateTemplate(user.uid, templateId, templateData);
      } else {
        result = await RecurringModule.createTemplate(user.uid, templateData);
      }
      
      if (result.success) {
        Alert.alert(
          'Success', 
          isEditing ? 'Recurring deduction updated successfully.' : 'Recurring deduction created successfully.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to save recurring deduction.');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    formGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      marginBottom: 8,
      color: theme.text,
      fontWeight: '500',
    },
    input: {
      backgroundColor: theme.inputBackground,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: theme.text,
      borderWidth: 1,
      borderColor: theme.border,
    },
    pickerContainer: {
      backgroundColor: theme.inputBackground,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: 'hidden',
    },
    picker: {
      color: theme.text,
      height: 50,
    },
    notesInput: {
      backgroundColor: theme.inputBackground,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: theme.text,
      borderWidth: 1,
      borderColor: theme.border,
      height: 100,
      textAlignVertical: 'top',
    },
    buttonContainer: {
      marginTop: 20,
      marginBottom: 30,
    },
    saveButton: {
      backgroundColor: theme.primary,
      borderRadius: 8,
      padding: 16,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    toggleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.inputBackground,
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 20,
    },
    toggleText: {
      fontSize: 16,
      color: theme.text,
    },
    toggleButton: {
      width: 50,
      height: 30,
      borderRadius: 15,
      padding: 2,
      backgroundColor: isActive ? theme.success : theme.textSecondary,
      justifyContent: 'center',
    },
    toggleIndicator: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: '#FFFFFF',
      alignSelf: isActive ? 'flex-end' : 'flex-start',
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Edit Recurring Deduction' : 'New Recurring Deduction'}
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Edit Recurring Deduction' : 'New Recurring Deduction'}
          </Text>
        </View>
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter title"
              placeholderTextColor={theme.textSecondary}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Amount ($)</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={theme.textSecondary}
              keyboardType="decimal-pad"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={category}
                onValueChange={(itemValue) => setCategory(itemValue)}
                style={styles.picker}
                dropdownIconColor={theme.text}
              >
                <Picker.Item label="Select a category" value="" color={theme.textSecondary} />
                {categories.map((cat) => (
                  <Picker.Item key={cat} label={cat} value={cat} color={theme.text} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Frequency</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={frequency}
                onValueChange={(itemValue) => setFrequency(itemValue)}
                style={styles.picker}
                dropdownIconColor={theme.text}
              >
                {frequencies.map((freq) => (
                  <Picker.Item key={freq.value} label={freq.label} value={freq.value} color={theme.text} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Job Profile</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedProfileId}
                onValueChange={(itemValue) => setSelectedProfileId(itemValue)}
                style={styles.picker}
                dropdownIconColor={theme.text}
              >
                <Picker.Item label="Select a job profile" value="" color={theme.textSecondary} />
                {profiles.map((profile) => (
                  <Picker.Item key={profile.id} label={profile.name} value={profile.id} color={theme.text} />
                ))}
              </Picker>
            </View>
          </View>
          
          {isEditing && (
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleText}>Active</Text>
              <TouchableOpacity 
                style={styles.toggleButton}
                onPress={() => setIsActive(!isActive)}
              >
                <View style={styles.toggleIndicator} />
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes here"
              placeholderTextColor={theme.textSecondary}
              multiline
            />
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="save" size={20} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>
                    {isEditing ? 'Update Deduction' : 'Create Deduction'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RecurringDeductionFormScreen;
