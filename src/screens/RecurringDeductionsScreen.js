import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useProfile } from '../contexts/ProfileContext';
import RecurringModule from '../modules/RecurringModule';

const RecurringDeductionsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { activeProfile } = useProfile();
  
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, [user, activeProfile]);

  const loadTemplates = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const result = await RecurringModule.getTemplates(user.uid);
      
      if (result.success) {
        // Filter by active profile if one is selected
        const filteredTemplates = activeProfile
          ? result.templates.filter(t => t.profileId === activeProfile.id)
          : result.templates;
          
        // Sort by most recently created
        filteredTemplates.sort((a, b) => {
          return b.createdAt.toDate() - a.createdAt.toDate();
        });
        
        setTemplates(filteredTemplates);
      } else {
        Alert.alert('Error', result.error || 'Failed to load recurring deductions');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadTemplates();
  };

  const handleAddTemplate = () => {
    navigation.navigate('AddRecurringDeduction');
  };

  const handleEditTemplate = (template) => {
    navigation.navigate('EditRecurringDeduction', { templateId: template.id });
  };

  const handleDeleteTemplate = (template) => {
    Alert.alert(
      'Delete Recurring Deduction',
      'Are you sure you want to delete this recurring deduction? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await RecurringModule.deleteTemplate(user.uid, template.id);
              
              if (result.success) {
                // Remove from local state
                setTemplates(templates.filter(t => t.id !== template.id));
                Alert.alert('Success', 'Recurring deduction deleted');
              } else {
                Alert.alert('Error', result.error || 'Failed to delete recurring deduction');
              }
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          }
        }
      ]
    );
  };

  const handleToggleActive = async (template) => {
    try {
      const result = await RecurringModule.updateTemplate(user.uid, template.id, {
        isActive: !template.isActive
      });
      
      if (result.success) {
        // Update local state
        setTemplates(templates.map(t => {
          if (t.id === template.id) {
            return { ...t, isActive: !t.isActive };
          }
          return t;
        }));
      } else {
        Alert.alert('Error', result.error || 'Failed to update recurring deduction');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleGenerateNow = async () => {
    if (!user) return;
    
    setIsGenerating(true);
    try {
      const profileId = activeProfile ? activeProfile.id : null;
      const result = await RecurringModule.generateDeductions(user.uid, profileId);
      
      if (result.success) {
        if (result.count > 0) {
          Alert.alert(
            'Success', 
            `Generated ${result.count} deduction${result.count !== 1 ? 's' : ''} from your recurring templates.`
          );
        } else {
          Alert.alert('No Deductions Generated', 'No deductions were due to be generated at this time.');
        }
      } else {
        Alert.alert('Error', result.error || 'Failed to generate deductions');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTemplatePress = (template) => {
    setSelectedTemplate(template);
    setIsModalVisible(true);
  };

  const getFrequencyText = (frequency) => {
    switch (frequency) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'biweekly': return 'Every 2 Weeks';
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Quarterly';
      case 'yearly': return 'Yearly';
      default: return 'Custom';
    }
  };

  const renderTemplateItem = ({ item }) => {
    const lastGenerated = item.lastGenerated 
      ? new Date(item.lastGenerated.toDate()).toLocaleDateString() 
      : 'Never';
      
    return (
      <TouchableOpacity 
        style={[styles.templateCard, { backgroundColor: theme.card }]}
        onPress={() => handleTemplatePress(item)}
      >
        <View style={styles.templateHeader}>
          <View style={styles.templateTitleContainer}>
            <Text style={[styles.templateTitle, { color: theme.text }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.templateCategory, { color: theme.textSecondary }]}>
              {item.category}
            </Text>
          </View>
          <Text style={[styles.templateAmount, { color: theme.text }]}>
            ${parseFloat(item.amount).toFixed(2)}
          </Text>
        </View>
        
        <View style={styles.templateDetails}>
          <View style={styles.templateDetailRow}>
            <Ionicons name="repeat" size={16} color={theme.textSecondary} />
            <Text style={[styles.templateDetailText, { color: theme.textSecondary }]}>
              {getFrequencyText(item.frequency)}
            </Text>
          </View>
          
          <View style={styles.templateDetailRow}>
            <Ionicons name="calendar" size={16} color={theme.textSecondary} />
            <Text style={[styles.templateDetailText, { color: theme.textSecondary }]}>
              Last: {lastGenerated}
            </Text>
          </View>
        </View>
        
        <View style={[styles.templateStatus, { backgroundColor: item.isActive ? theme.success + '20' : theme.error + '20' }]}>
          <Text style={[styles.templateStatusText, { 
            color: item.isActive ? theme.success : theme.error 
          }]}>
            {item.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTemplateModal = () => {
    if (!selectedTemplate) return null;
    
    return (
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: `${theme.background}DD` }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>{selectedTemplate.title}</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.modalRow}>
                <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Amount:</Text>
                <Text style={[styles.modalValue, { color: theme.text }]}>
                  ${parseFloat(selectedTemplate.amount).toFixed(2)}
                </Text>
              </View>
              
              <View style={styles.modalRow}>
                <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Category:</Text>
                <Text style={[styles.modalValue, { color: theme.text }]}>{selectedTemplate.category}</Text>
              </View>
              
              <View style={styles.modalRow}>
                <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Frequency:</Text>
                <Text style={[styles.modalValue, { color: theme.text }]}>
                  {getFrequencyText(selectedTemplate.frequency)}
                </Text>
              </View>
              
              <View style={styles.modalRow}>
                <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Status:</Text>
                <Text style={[styles.modalValue, { 
                  color: selectedTemplate.isActive ? theme.success : theme.error 
                }]}>
                  {selectedTemplate.isActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
              
              {selectedTemplate.notes && (
                <View style={styles.notesContainer}>
                  <Text style={[styles.notesLabel, { color: theme.textSecondary }]}>Notes:</Text>
                  <Text style={[styles.notesText, { color: theme.text }]}>{selectedTemplate.notes}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: theme.error }]}
                onPress={() => {
                  setIsModalVisible(false);
                  setTimeout(() => handleDeleteTemplate(selectedTemplate), 300);
                }}
              >
                <Ionicons name="trash" size={18} color="#FFFFFF" />
                <Text style={styles.modalButtonText}>Delete</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: selectedTemplate.isActive ? theme.error : theme.success }]}
                onPress={() => {
                  handleToggleActive(selectedTemplate);
                  setIsModalVisible(false);
                }}
              >
                <Ionicons name={selectedTemplate.isActive ? "pause" : "play"} size={18} color="#FFFFFF" />
                <Text style={styles.modalButtonText}>
                  {selectedTemplate.isActive ? 'Deactivate' : 'Activate'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
                onPress={() => {
                  setIsModalVisible(false);
                  setTimeout(() => handleEditTemplate(selectedTemplate), 300);
                }}
              >
                <Ionicons name="pencil" size={18} color="#FFFFFF" />
                <Text style={styles.modalButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
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
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    emptyText: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: 12,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    templateCard: {
      marginHorizontal: 16,
      marginVertical: 8,
      borderRadius: 12,
      padding: 16,
      shadowColor: theme.cardShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    templateHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    templateTitleContainer: {
      flex: 1,
      marginRight: 8,
    },
    templateTitle: {
      fontSize: 16,
      fontWeight: '600',
    },
    templateCategory: {
      fontSize: 14,
      marginTop: 2,
    },
    templateAmount: {
      fontSize: 18,
      fontWeight: '600',
    },
    templateDetails: {
      marginBottom: 12,
    },
    templateDetailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 6,
    },
    templateDetailText: {
      fontSize: 14,
      marginLeft: 6,
    },
    templateStatus: {
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    templateStatusText: {
      fontSize: 12,
      fontWeight: '500',
    },
    fabContainer: {
      position: 'absolute',
      right: 16,
      bottom: 16,
      flexDirection: 'row',
    },
    generateButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.secondary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    addButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      width: '100%',
      borderRadius: 12,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    modalBody: {
      marginBottom: 20,
    },
    modalRow: {
      flexDirection: 'row',
      marginBottom: 12,
    },
    modalLabel: {
      width: 100,
      fontSize: 16,
      fontWeight: '500',
    },
    modalValue: {
      flex: 1,
      fontSize: 16,
    },
    notesContainer: {
      marginTop: 8,
    },
    notesLabel: {
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 4,
    },
    notesText: {
      fontSize: 16,
    },
    modalFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    modalButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      flex: 1,
      marginHorizontal: 4,
    },
    modalButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      marginLeft: 6,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recurring Deductions</Text>
      </View>
      
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : templates.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="repeat" size={64} color={theme.textSecondary} />
            <Text style={styles.emptyText}>
              No recurring deductions yet. Tap the + button to create one.
            </Text>
          </View>
        ) : (
          <FlatList
            data={templates}
            renderItem={renderTemplateItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingVertical: 8 }}
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
        )}
      </View>
      
      <View style={styles.fabContainer}>
        <TouchableOpacity 
          style={styles.generateButton}
          onPress={handleGenerateNow}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="refresh" size={24} color="#FFFFFF" />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddTemplate}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {renderTemplateModal()}
    </SafeAreaView>
  );
};

export default RecurringDeductionsScreen;
