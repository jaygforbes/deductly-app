import React, { useState } from 'react';
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
  Platform,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useProfile } from '../contexts/ProfileContext';
import DeductionModule from '../modules/DeductionModule';
import ReceiptModule from '../modules/ReceiptModule';

const AddDeductionScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { activeProfile, profiles } = useProfile();
  
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [receiptImage, setReceiptImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const categories = DeductionModule.getCategories();

  const handleSave = async () => {
    if (!title || !amount || !category) {
      Alert.alert('Missing Fields', 'Please fill in all required fields');
      return;
    }

    if (!activeProfile) {
      Alert.alert('No Profile Selected', 'Please select or create a job profile first');
      return;
    }

    setIsLoading(true);

    try {
      let receiptUrl = null;

      // Upload receipt image if one was selected
      if (receiptImage) {
        const uploadResult = await ReceiptModule.uploadReceiptImage(user.uid, receiptImage);
        if (uploadResult.success) {
          receiptUrl = uploadResult.downloadURL;
        } else {
          throw new Error('Failed to upload receipt: ' + uploadResult.error);
        }
      }

      // Create deduction
      const deductionData = {
        title,
        amount: parseFloat(amount),
        date,
        category,
        notes,
        profileId: activeProfile.id,
        profileName: activeProfile.name,
        receiptUrl,
        createdAt: new Date()
      };

      const result = await DeductionModule.addDeduction(user.uid, deductionData);

      if (result.success) {
        Alert.alert(
          'Success', 
          'Deduction saved successfully',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        throw new Error('Failed to save deduction: ' + result.error);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTakePhoto = async () => {
    const result = await ReceiptModule.takePhoto();
    if (result.success) {
      setReceiptImage(result.image);
    } else if (result.error !== 'User cancelled camera') {
      Alert.alert('Error', result.error);
    }
  };

  const handlePickImage = async () => {
    const result = await ReceiptModule.pickImage();
    if (result.success) {
      setReceiptImage(result.image);
    } else if (result.error !== 'User cancelled image picker') {
      Alert.alert('Error', result.error);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const formatCurrency = (text) => {
    // Remove non-numeric characters
    const numericValue = text.replace(/[^0-9.]/g, '');
    
    if (numericValue === '') {
      setAmount('');
      return;
    }
    
    // Ensure only one decimal point
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      parts.pop();
    }
    
    const formattedValue = parts.join('.');
    setAmount(formattedValue);
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
    inputGroup: {
      marginBottom: 16,
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
    datePickerButton: {
      backgroundColor: theme.surface,
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: theme.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    dateText: {
      fontSize: 16,
      color: theme.text,
    },
    categoriesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 8,
    },
    categoryChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      marginRight: 8,
      marginBottom: 8,
    },
    categoryChipSelected: {
      backgroundColor: theme.primary,
    },
    categoryChipUnselected: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    categoryText: {
      fontSize: 14,
    },
    categoryTextSelected: {
      color: '#FFFFFF',
    },
    categoryTextUnselected: {
      color: theme.text,
    },
    receiptSection: {
      marginTop: 16,
      marginBottom: 16,
    },
    receiptButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    receiptButton: {
      flex: 1,
      backgroundColor: theme.surface,
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
      marginHorizontal: 4,
      borderWidth: 1,
      borderColor: theme.border,
    },
    receiptButtonText: {
      color: theme.primary,
      fontWeight: '500',
    },
    receiptPreview: {
      width: '100%',
      height: 200,
      backgroundColor: theme.surface,
      borderRadius: 8,
      marginTop: 16,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    receiptImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    saveButton: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 24,
    },
    saveButtonText: {
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., Office Supplies"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={formatCurrency}
              placeholder="0.00"
              placeholderTextColor={theme.textSecondary}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {date.toLocaleDateString()}
              </Text>
              <Ionicons name="calendar" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoriesContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    category === cat ? styles.categoryChipSelected : styles.categoryChipUnselected
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      category === cat ? styles.categoryTextSelected : styles.categoryTextUnselected
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any additional details here"
              placeholderTextColor={theme.textSecondary}
              multiline
            />
          </View>

          <View style={styles.receiptSection}>
            <Text style={styles.label}>Receipt (Optional)</Text>
            <View style={styles.receiptButtons}>
              <TouchableOpacity style={styles.receiptButton} onPress={handleTakePhoto}>
                <Text style={styles.receiptButtonText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.receiptButton} onPress={handlePickImage}>
                <Text style={styles.receiptButtonText}>Choose from Gallery</Text>
              </TouchableOpacity>
            </View>

            {receiptImage && (
              <View style={styles.receiptPreview}>
                <Image source={{ uri: receiptImage.uri }} style={styles.receiptImage} />
              </View>
            )}
          </View>

          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>Save Deduction</Text>
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

export default AddDeductionScreen;
