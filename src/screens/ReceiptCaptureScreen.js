import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useProfile } from '../contexts/ProfileContext';
import ReceiptModule from '../modules/ReceiptModule';
import OCRModule from '../modules/OCRModule';

const ReceiptCaptureScreen = ({ navigation, route }) => {
  const { deductionId } = route.params || {};
  const { user } = useAuth();
  const { theme } = useTheme();
  const { activeProfile } = useProfile();
  
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [showOcrModal, setShowOcrModal] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleFlipCamera = () => {
    setCameraType(
      cameraType === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };

  const handleToggleFlash = () => {
    setFlashMode(
      flashMode === Camera.Constants.FlashMode.off
        ? Camera.Constants.FlashMode.on
        : Camera.Constants.FlashMode.off
    );
  };

  const handleTakePicture = async () => {
    if (cameraRef.current) {
      setIsCapturing(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          skipProcessing: false
        });
        setCapturedImage(photo);
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture: ' + error.message);
      } finally {
        setIsCapturing(false);
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const processOCR = async () => {
    if (!capturedImage) return;
    
    setIsProcessingOCR(true);
    
    try {
      const result = await OCRModule.extractTextFromImage(capturedImage.uri);
      
      if (result.success) {
        setOcrResult(result);
        setShowOcrModal(true);
      } else {
        throw new Error('OCR processing failed: ' + result.error);
      }
    } catch (error) {
      Alert.alert('OCR Error', 'Failed to extract text from receipt: ' + error.message);
    } finally {
      setIsProcessingOCR(false);
    }
  };

  const handleSaveReceipt = async () => {
    if (!capturedImage) return;
    
    setIsCapturing(true);
    
    try {
      // Process OCR if not already done
      if (!ocrResult) {
        await processOCR();
      }
      
      // Upload receipt image
      const uploadResult = await ReceiptModule.uploadReceiptImage(user.uid, capturedImage);
      
      if (!uploadResult.success) {
        throw new Error('Failed to upload receipt: ' + uploadResult.error);
      }
      
      // Save receipt metadata with OCR data if available
      const receiptData = {
        imageUrl: uploadResult.downloadURL,
        timestamp: new Date(),
        profileId: activeProfile?.id || null,
        profileName: activeProfile?.name || null,
        deductionId: deductionId || null,
        ocrData: ocrResult ? {
          merchantName: ocrResult.data.merchantName,
          date: ocrResult.data.date,
          totalAmount: ocrResult.data.totalAmount,
          taxAmount: ocrResult.data.taxAmount,
          rawText: ocrResult.text
        } : null
      };
      
      const saveResult = await ReceiptModule.saveReceiptMetadata(user.uid, receiptData);
      
      if (!saveResult.success) {
        throw new Error('Failed to save receipt metadata: ' + saveResult.error);
      }
      
      // If this was for a specific deduction, update the deduction with the receipt URL and OCR data
      if (deductionId) {
        const deductionUpdateData = {
          receiptUrl: uploadResult.downloadURL,
        };
        
        // If we have OCR data with a total amount, suggest updating the deduction amount
        if (ocrResult && ocrResult.data.totalAmount) {
          deductionUpdateData.suggestedAmount = ocrResult.data.totalAmount;
        }
        
        await ReceiptModule.linkReceiptToDeduction(user.uid, deductionId, deductionUpdateData);
      }
      
      Alert.alert(
        'Success', 
        'Receipt saved successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsCapturing(false);
      setShowOcrModal(false);
    }
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-off-outline" size={64} color={theme.textSecondary} />
          <Text style={[styles.permissionText, { color: theme.text }]}>
            Camera permission is required to capture receipts
          </Text>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const styles = StyleSheet.create({
    button: {
      alignItems: 'center',
      borderRadius: 12,
      paddingHorizontal: 24,
      paddingVertical: 12,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    camera: {
      flex: 1,
    },
    cameraContainer: {
      flex: 1,
      width: '100%',
    },
    captureButton: {
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderColor: 'rgba(255,255,255,0.5)',
      borderRadius: 35,
      borderWidth: 5,
      height: 70,
      justifyContent: 'center',
      width: 70,
    },
    captureButtonInner: {
      backgroundColor: '#FFFFFF',
      borderRadius: 27,
      height: 54,
      width: 54,
    },
    closeButton: {
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.3)',
      borderRadius: 22,
      height: 44,
      justifyContent: 'center',
      width: 44,
    },
    container: {
      backgroundColor: '#000',
      flex: 1,
    },
    controlsContainer: {
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.4)',
      bottom: 0,
      flexDirection: 'row',
      justifyContent: 'space-around',
      left: 0,
      paddingHorizontal: 30,
      paddingVertical: 20,
      position: 'absolute',
      right: 0,
    },
    dataLabel: {
      fontSize: 16,
      fontWeight: '500',
      width: 80,
    },
    dataRow: {
      alignItems: 'center',
      flexDirection: 'row',
      marginBottom: 12,
    },
    dataValue: {
      flex: 1,
      fontSize: 16,
    },
    divider: {
      backgroundColor: '#DDDDDD',
      height: 1,
      marginVertical: 15,
    },
    flashButton: {
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.3)',
      borderRadius: 22,
      height: 44,
      justifyContent: 'center',
      width: 44,
    },
    flipButton: {
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.3)',
      borderRadius: 22,
      height: 44,
      justifyContent: 'center',
      width: 44,
    },
    headerContainer: {
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.4)',
      flexDirection: 'row',
      justifyContent: 'space-between',
      left: 0,
      paddingHorizontal: 20,
      paddingVertical: 20,
      position: 'absolute',
      right: 0,
      top: 0,
    },
    headerTitle: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '600',
    },
    loadingContainer: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
    },
    modalButton: {
      alignItems: 'center',
      borderRadius: 25,
      paddingHorizontal: 30,
      paddingVertical: 12,
    },
    modalButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    modalContainer: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      padding: 20,
    },
    modalContent: {
      borderRadius: 12,
      elevation: 5,
      maxHeight: '80%',
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      width: '100%',
    },
    modalFooter: {
      alignItems: 'center',
      marginTop: 20,
    },
    modalHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
    modalScrollView: {
      maxHeight: 400,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    permissionContainer: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      padding: 20,
    },
    permissionText: {
      fontSize: 16,
      marginBottom: 24,
      marginTop: 16,
      textAlign: 'center',
    },
    previewButton: {
      alignItems: 'center',
      borderRadius: 25,
      flexDirection: 'row',
      justifyContent: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    previewButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    previewContainer: {
      backgroundColor: '#000',
      flex: 1,
    },
    previewControlsContainer: {
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.6)',
      bottom: 0,
      flexDirection: 'row',
      justifyContent: 'space-around',
      left: 0,
      paddingHorizontal: 30,
      paddingVertical: 20,
      position: 'absolute',
      right: 0,
    },
    previewImage: {
      flex: 1,
      resizeMode: 'contain',
    },
    rawText: {
      fontSize: 14,
      lineHeight: 20,
    },
    rawTextLabel: {
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 8,
    },
  });

  // OCR Results Modal
  const renderOcrModal = () => {
    if (!ocrResult) return null;
    
    return (
      <Modal
        visible={showOcrModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowOcrModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: `${theme.background}DD` }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Receipt Details</Text>
              <TouchableOpacity onPress={() => setShowOcrModal(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollView}>
              {ocrResult.data.merchantName && (
                <View style={styles.dataRow}>
                  <Text style={[styles.dataLabel, { color: theme.textSecondary }]}>Merchant:</Text>
                  <Text style={[styles.dataValue, { color: theme.text }]}>{ocrResult.data.merchantName}</Text>
                </View>
              )}
              
              {ocrResult.data.date && (
                <View style={styles.dataRow}>
                  <Text style={[styles.dataLabel, { color: theme.textSecondary }]}>Date:</Text>
                  <Text style={[styles.dataValue, { color: theme.text }]}>{ocrResult.data.date}</Text>
                </View>
              )}
              
              {ocrResult.data.totalAmount && (
                <View style={styles.dataRow}>
                  <Text style={[styles.dataLabel, { color: theme.textSecondary }]}>Total:</Text>
                  <Text style={[styles.dataValue, { color: theme.text }]}>${ocrResult.data.totalAmount.toFixed(2)}</Text>
                </View>
              )}
              
              {ocrResult.data.taxAmount && (
                <View style={styles.dataRow}>
                  <Text style={[styles.dataLabel, { color: theme.textSecondary }]}>Tax:</Text>
                  <Text style={[styles.dataValue, { color: theme.text }]}>${ocrResult.data.taxAmount.toFixed(2)}</Text>
                </View>
              )}
              
              <View style={styles.divider} />
              
              <Text style={[styles.rawTextLabel, { color: theme.textSecondary }]}>Extracted Text:</Text>
              <Text style={[styles.rawText, { color: theme.text }]}>{ocrResult.text}</Text>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
                onPress={() => setShowOcrModal(false)}
              >
                <Text style={styles.modalButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  if (capturedImage) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage.uri }} style={styles.previewImage} />
          
          <View style={styles.headerContainer}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={handleRetake}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Receipt Preview</Text>
            <View style={{ width: 44 }} />
          </View>
          
          <View style={styles.previewControlsContainer}>
            <TouchableOpacity 
              style={[styles.previewButton, { backgroundColor: '#FF3B30' }]}
              onPress={handleRetake}
            >
              <Ionicons name="refresh" size={20} color="#FFFFFF" />
              <Text style={styles.previewButtonText}>Retake</Text>
            </TouchableOpacity>
            
            {!ocrResult && (
              <TouchableOpacity 
                style={[styles.previewButton, { backgroundColor: '#5856D6' }]}
                onPress={processOCR}
                disabled={isProcessingOCR}
              >
                {isProcessingOCR ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="scan" size={20} color="#FFFFFF" />
                    <Text style={styles.previewButtonText}>Scan Text</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
            
            {ocrResult && (
              <TouchableOpacity 
                style={[styles.previewButton, { backgroundColor: '#5856D6' }]}
                onPress={() => setShowOcrModal(true)}
              >
                <Ionicons name="document-text" size={20} color="#FFFFFF" />
                <Text style={styles.previewButtonText}>View Data</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.previewButton, { backgroundColor: '#34C759' }]}
              onPress={handleSaveReceipt}
              disabled={isCapturing}
            >
              {isCapturing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                  <Text style={styles.previewButtonText}>Save</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        {renderOcrModal()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cameraContainer}>
        <Camera
          ref={cameraRef}
          style={styles.camera}
          type={cameraType}
          flashMode={flashMode}
          ratio="4:3"
        />
        
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Capture Receipt</Text>
          <View style={{ width: 44 }} />
        </View>
        
        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={styles.flashButton}
            onPress={handleToggleFlash}
          >
            <Ionicons 
              name={flashMode === Camera.Constants.FlashMode.off ? "flash-off" : "flash"} 
              size={24} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.captureButton}
            onPress={handleTakePicture}
            disabled={isCapturing}
          >
            {isCapturing ? (
              <ActivityIndicator size="large" color="#000000" />
            ) : (
              <View style={styles.captureButtonInner} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.flipButton}
            onPress={handleFlipCamera}
          >
            <Ionicons name="camera-reverse" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ReceiptCaptureScreen;
