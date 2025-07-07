import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useProfile } from '../contexts/ProfileContext';
import DeductionModule from '../modules/DeductionModule';
import ReceiptModule from '../modules/ReceiptModule';

const DeductionDetailsScreen = ({ navigation, route }) => {
  const { deductionId } = route.params;
  const { user } = useAuth();
  const { theme } = useTheme();
  const { profiles } = useProfile();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deduction, setDeduction] = useState(null);
  const [editedDeduction, setEditedDeduction] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    loadDeduction();
  }, [deductionId]);

  const loadDeduction = async () => {
    if (!user || !deductionId) return;
    
    setIsLoading(true);
    
    try {
      const result = await DeductionModule.getDeductionById(user.uid, deductionId);
      
      if (result.success) {
        setDeduction(result.deduction);
        setEditedDeduction(result.deduction);
      } else {
        Alert.alert('Error', result.error || 'Failed to load deduction');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', error.message);
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editedDeduction) return;
    
    setIsSaving(true);
    
    try {
      const result = await DeductionModule.updateDeduction(
        user.uid,
        deductionId,
        editedDeduction
      );
      
      if (result.success) {
        setDeduction(editedDeduction);
        setIsEditing(false);
        Alert.alert('Success', 'Deduction updated successfully');
      } else {
        throw new Error(result.error || 'Failed to update deduction');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this deduction? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            
            try {
              const result = await DeductionModule.deleteDeduction(user.uid, deductionId);
              
              if (result.success) {
                Alert.alert(
                  'Success',
                  'Deduction deleted successfully',
                  [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
              } else {
                throw new Error(result.error || 'Failed to delete deduction');
              }
            } catch (error) {
              Alert.alert('Error', error.message);
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleCaptureReceipt = () => {
    navigation.navigate('ReceiptCapture', { deductionId });
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setEditedDeduction({
        ...editedDeduction,
        date: selectedDate
      });
    }
  };

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString();
  };

  const renderEditForm = () => {
    if (!editedDeduction) return null;
    
    const categories = DeductionModule.getCategories();
    
    return (
      <View style={styles.editForm}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={editedDeduction.title}
            onChangeText={(text) => setEditedDeduction({...editedDeduction, title: text})}
            placeholder="Deduction title"
            placeholderTextColor={theme.textSecondary}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.input}
            value={editedDeduction.amount.toString()}
            onChangeText={(text) => {
              const numericValue = text.replace(/[^0-9.]/g, '');
              setEditedDeduction({...editedDeduction, amount: numericValue});
            }}
            placeholder="0.00"
            placeholderTextColor={theme.textSecondary}
            keyboardType="decimal-pad"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity 
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {formatDate(editedDeduction.date)}
            </Text>
            <Ionicons name="calendar" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={new Date(editedDeduction.date)}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoriesContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  editedDeduction.category === cat ? styles.categoryChipSelected : styles.categoryChipUnselected
                ]}
                onPress={() => setEditedDeduction({...editedDeduction, category: cat})}
              >
                <Text
                  style={[
                    styles.categoryText,
                    editedDeduction.category === cat ? styles.categoryTextSelected : styles.categoryTextUnselected
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
            value={editedDeduction.notes || ''}
            onChangeText={(text) => setEditedDeduction({...editedDeduction, notes: text})}
            placeholder="Add notes here"
            placeholderTextColor={theme.textSecondary}
            multiline
          />
        </View>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]}
            onPress={() => {
              setEditedDeduction(deduction);
              setIsEditing(false);
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderViewMode = () => {
    if (!deduction) return null;
    
    return (
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Amount</Text>
          <Text style={styles.detailAmount}>{formatCurrency(deduction.amount)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date</Text>
          <Text style={styles.detailValue}>{formatDate(deduction.date)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Category</Text>
          <View style={[styles.categoryChip, styles.categoryChipSelected]}>
            <Text style={styles.categoryTextSelected}>{deduction.category}</Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Profile</Text>
          <Text style={styles.detailValue}>{deduction.profileName || 'None'}</Text>
        </View>
        
        {deduction.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.detailLabel}>Notes</Text>
            <Text style={styles.notesText}>{deduction.notes}</Text>
          </View>
        )}
        
        {deduction.receiptUrl ? (
          <View style={styles.receiptContainer}>
            <Text style={styles.detailLabel}>Receipt</Text>
            <Image 
              source={{ uri: deduction.receiptUrl }} 
              style={styles.receiptImage}
              resizeMode="contain"
            />
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.addReceiptButton}
            onPress={handleCaptureReceipt}
          >
            <Ionicons name="camera-outline" size={20} color={theme.primary} />
            <Text style={styles.addReceiptText}>Add Receipt</Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, styles.editButton]}
            onPress={() => setIsEditing(true)}
          >
            <Ionicons name="pencil" size={18} color="#FFFFFF" />
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Ionicons name="trash" size={18} color="#FFFFFF" />
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const styles = StyleSheet.create({
    addReceiptButton: {
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderRadius: 8,
      borderStyle: 'dashed',
      borderWidth: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 16,
      padding: 12,
    },
    addReceiptText: {
      color: theme.primary,
      fontWeight: '500',
      marginLeft: 8,
    },
    button: {
      alignItems: 'center',
      borderRadius: 8,
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      marginHorizontal: 4,
      padding: 12,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    buttonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      marginLeft: 6,
    },
    cancelButton: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderWidth: 1,
    },
    cancelButtonText: {
      color: theme.text,
      fontWeight: '600',
    },
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
    deleteButton: {
      backgroundColor: theme.error,
    },
    detailAmount: {
      color: theme.text,
      fontSize: 24,
      fontWeight: 'bold',
    },
    detailLabel: {
      color: theme.textSecondary,
      fontSize: 16,
    },
    detailRow: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    detailValue: {
      color: theme.text,
      fontSize: 16,
      fontWeight: '500',
    },
    detailsContainer: {
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
    editButton: {
      backgroundColor: theme.primary,
    },
    editForm: {
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
    formGroup: {
      marginBottom: 16,
    },
    header: {
      marginBottom: 24,
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
    label: {
      color: theme.text,
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 8,
    },
    loadingContainer: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
    },
    notesContainer: {
      marginBottom: 16,
    },
    notesText: {
      color: theme.text,
      fontSize: 16,
      marginTop: 8,
    },
    receiptContainer: {
      marginBottom: 16,
    },
    receiptImage: {
      backgroundColor: theme.surface,
      borderRadius: 8,
      height: 200,
      marginTop: 8,
      width: '100%',
    },
    saveButton: {
      backgroundColor: theme.primary,
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    title: {
      color: theme.text,
      fontSize: 24,
      fontWeight: 'bold',
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{deduction?.title || 'Deduction Details'}</Text>
        </View>
        
        {isEditing ? renderEditForm() : renderViewMode()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DeductionDetailsScreen;
