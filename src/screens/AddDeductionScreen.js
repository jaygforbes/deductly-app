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
    categoriesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 8,
    },
    categoryChip: {
      borderRadius: 16,
      marginBottom: 8,
      marginRight: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    categoryChipSelected: {
      backgroundColor: theme.primary,
    },
    categoryChipUnselected: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderWidth: 1,
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
    container: {
      backgroundColor: theme.background,
      flex: 1,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    datePickerButton: {
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderRadius: 8,
      borderWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 12,
    },
    dateText: {
      color: theme.text,
      fontSize: 16,
    },
    input: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderRadius: 8,
      borderWidth: 1,
      color: theme.text,
      fontSize: 16,
      padding: 12,
    },
    inputGroup: {
      marginBottom: 16,
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
    receiptButton: {
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderRadius: 8,
      borderWidth: 1,
      flex: 1,
      marginHorizontal: 4,
      padding: 12,
    },
    receiptButtonText: {
      color: theme.primary,
      fontWeight: '500',
    },
    receiptButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    receiptImage: {
      height: '100%',
      resizeMode: 'cover',
      width: '100%',
    },
    receiptPreview: {
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: 8,
      height: 200,
      justifyContent: 'center',
      marginTop: 16,
      overflow: 'hidden',
      width: '100%',
    },
    receiptSection: {
      marginBottom: 16,
      marginTop: 16,
    },
    saveButton: {
      alignItems: 'center',
      backgroundColor: theme.primary,
      borderRadius: 12,
      marginTop: 24,
      padding: 16,
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '600',
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
