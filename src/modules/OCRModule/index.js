import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { createWorker } from 'tesseract.js';

class OCRModule {
  constructor() {
    this.worker = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the OCR worker
   * @returns {Promise} - Result of initialization
   */
  async initialize() {
    try {
      if (this.isInitialized) {
        return { success: true };
      }

      this.worker = await createWorker('eng');
      this.isInitialized = true;
      
      return { success: true };
    } catch (error) {
      console.error('OCR initialization error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Process image and extract text using OCR
   * @param {string} imageUri - URI of the image to process
   * @returns {Promise} - Result with extracted text and structured data
   */
  async extractTextFromImage(imageUri) {
    try {
      // Initialize worker if not already done
      if (!this.isInitialized) {
        const initResult = await this.initialize();
        if (!initResult.success) {
          return initResult;
        }
      }

      // Optimize image for OCR
      const processedImage = await this.preprocessImage(imageUri);
      
      // Perform OCR
      const { data } = await this.worker.recognize(processedImage.uri);
      
      // Parse the extracted text
      const parsedData = this.parseReceiptText(data.text);
      
      // Clean up temporary file
      await FileSystem.deleteAsync(processedImage.uri, { idempotent: true });
      
      return {
        success: true,
        text: data.text,
        data: parsedData
      };
    } catch (error) {
      console.error('OCR extraction error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Preprocess image to improve OCR accuracy
   * @param {string} imageUri - URI of the image to process
   * @returns {Promise} - Result with processed image URI
   */
  async preprocessImage(imageUri) {
    try {
      // Resize and enhance image for better OCR results
      const processedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          { resize: { width: 1200 } },
          { contrast: 1.2 },
          { brightness: 0.1 },
        ],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      return processedImage;
    } catch (error) {
      console.error('Image preprocessing error:', error);
      throw error;
    }
  }

  /**
   * Parse receipt text to extract structured data
   * @param {string} text - Raw text extracted from receipt
   * @returns {object} - Structured data from receipt
   */
  parseReceiptText(text) {
    // Initialize result object
    const result = {
      merchantName: null,
      date: null,
      totalAmount: null,
      items: [],
      taxAmount: null,
    };
    
    if (!text) return result;
    
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    // Extract merchant name (usually in the first few lines)
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim();
      if (line && line.length > 3 && !line.match(/^[0-9.,$]/)) {
        result.merchantName = line;
        break;
      }
    }
    
    // Extract date
    const dateRegex = /(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/;
    for (const line of lines) {
      const dateMatch = line.match(dateRegex);
      if (dateMatch) {
        result.date = dateMatch[0];
        break;
      }
    }
    
    // Extract total amount
    const totalRegex = /total[:\s]*[$]?(\d+\.\d{2})/i;
    for (const line of lines) {
      const totalMatch = line.match(totalRegex);
      if (totalMatch) {
        result.totalAmount = parseFloat(totalMatch[1]);
        break;
      }
    }
    
    // If total not found with the word "total", try to find the largest amount
    if (!result.totalAmount) {
      const amountRegex = /[$]?(\d+\.\d{2})/g;
      let maxAmount = 0;
      
      for (const line of lines) {
        let match;
        while ((match = amountRegex.exec(line)) !== null) {
          const amount = parseFloat(match[1]);
          if (amount > maxAmount) {
            maxAmount = amount;
          }
        }
      }
      
      if (maxAmount > 0) {
        result.totalAmount = maxAmount;
      }
    }
    
    // Extract tax amount
    const taxRegex = /tax[:\s]*[$]?(\d+\.\d{2})/i;
    for (const line of lines) {
      const taxMatch = line.match(taxRegex);
      if (taxMatch) {
        result.taxAmount = parseFloat(taxMatch[1]);
        break;
      }
    }
    
    return result;
  }

  /**
   * Clean up resources
   */
  async terminate() {
    if (this.worker && this.isInitialized) {
      await this.worker.terminate();
      this.isInitialized = false;
    }
  }
}

export default new OCRModule();
