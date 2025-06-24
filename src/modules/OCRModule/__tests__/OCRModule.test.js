import OCRModule from '../index';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { createWorker } from 'tesseract.js';

// Mock dependencies
jest.mock('expo-file-system');
jest.mock('expo-image-manipulator');
jest.mock('tesseract.js');

describe('OCRModule', () => {
  const mockImageUri = 'file://test-image.jpg';
  const mockProcessedImageUri = 'file://processed-image.jpg';
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset OCRModule state
    OCRModule.worker = null;
    OCRModule.isInitialized = false;
    
    // Mock createWorker
    const mockWorker = {
      recognize: jest.fn(),
      terminate: jest.fn().mockResolvedValue(undefined)
    };
    createWorker.mockResolvedValue(mockWorker);
    
    // Mock ImageManipulator
    ImageManipulator.manipulateAsync.mockResolvedValue({
      uri: mockProcessedImageUri,
      width: 1200,
      height: 900
    });
    
    // Mock FileSystem
    FileSystem.deleteAsync.mockResolvedValue(undefined);
  });

  describe('initialize', () => {
    it('should initialize the OCR worker successfully', async () => {
      const result = await OCRModule.initialize();
      
      expect(createWorker).toHaveBeenCalledWith('eng');
      expect(result.success).toBe(true);
      expect(OCRModule.isInitialized).toBe(true);
      expect(OCRModule.worker).toBeDefined();
    });
    
    it('should not reinitialize if already initialized', async () => {
      // First initialization
      await OCRModule.initialize();
      
      // Reset mock to check if it's called again
      createWorker.mockClear();
      
      // Second initialization
      const result = await OCRModule.initialize();
      
      expect(createWorker).not.toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
    
    it('should handle initialization errors', async () => {
      const mockError = new Error('Initialization error');
      createWorker.mockRejectedValueOnce(mockError);
      
      const result = await OCRModule.initialize();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(mockError.message);
      expect(OCRModule.isInitialized).toBe(false);
    });
  });

  describe('extractTextFromImage', () => {
    it('should extract text from an image successfully', async () => {
      // Mock successful OCR recognition
      const mockOcrResult = {
        data: {
          text: 'ACME Store\n123 Main St\nDate: 06/15/2025\nTotal: $125.50\nTax: $10.25'
        }
      };
      
      // Set up the worker mock
      OCRModule.worker = {
        recognize: jest.fn().mockResolvedValue(mockOcrResult)
      };
      OCRModule.isInitialized = true;
      
      const result = await OCRModule.extractTextFromImage(mockImageUri);
      
      expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
        mockImageUri,
        expect.any(Array),
        expect.any(Object)
      );
      expect(OCRModule.worker.recognize).toHaveBeenCalledWith(mockProcessedImageUri);
      expect(FileSystem.deleteAsync).toHaveBeenCalledWith(mockProcessedImageUri, { idempotent: true });
      expect(result.success).toBe(true);
      expect(result.text).toBe(mockOcrResult.data.text);
      expect(result.data).toBeDefined();
    });
    
    it('should initialize worker if not already initialized', async () => {
      // Ensure worker is not initialized
      OCRModule.isInitialized = false;
      
      // Mock successful OCR recognition
      const mockOcrResult = {
        data: {
          text: 'Sample receipt text'
        }
      };
      
      // Set up the worker mock after initialization
      const mockWorker = {
        recognize: jest.fn().mockResolvedValue(mockOcrResult)
      };
      createWorker.mockResolvedValue(mockWorker);
      
      await OCRModule.extractTextFromImage(mockImageUri);
      
      expect(createWorker).toHaveBeenCalled();
      expect(OCRModule.isInitialized).toBe(true);
    });
    
    it('should handle OCR extraction errors', async () => {
      // Set up worker
      OCRModule.isInitialized = true;
      
      // Mock OCR error
      const mockError = new Error('OCR error');
      OCRModule.worker = {
        recognize: jest.fn().mockRejectedValue(mockError)
      };
      
      const result = await OCRModule.extractTextFromImage(mockImageUri);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(mockError.message);
    });
  });

  describe('preprocessImage', () => {
    it('should preprocess image correctly', async () => {
      const result = await OCRModule.preprocessImage(mockImageUri);
      
      expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
        mockImageUri,
        [
          { resize: { width: 1200 } },
          { contrast: 1.2 },
          { brightness: 0.1 },
        ],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      expect(result.uri).toBe(mockProcessedImageUri);
    });
    
    it('should handle preprocessing errors', async () => {
      const mockError = new Error('Preprocessing error');
      ImageManipulator.manipulateAsync.mockRejectedValueOnce(mockError);
      
      await expect(OCRModule.preprocessImage(mockImageUri)).rejects.toThrow(mockError);
    });
  });

  describe('parseReceiptText', () => {
    it('should parse merchant name correctly', () => {
      const text = 'ACME Store\n123 Main St\nDate: 06/15/2025\nTotal: $125.50';
      const result = OCRModule.parseReceiptText(text);
      
      expect(result.merchantName).toBe('ACME Store');
    });
    
    it('should parse date correctly', () => {
      const text = 'ACME Store\n123 Main St\nDate: 06/15/2025\nTotal: $125.50';
      const result = OCRModule.parseReceiptText(text);
      
      expect(result.date).toBe('06/15/2025');
    });
    
    it('should parse total amount with "total" keyword', () => {
      const text = 'ACME Store\n123 Main St\nDate: 06/15/2025\nTotal: $125.50';
      const result = OCRModule.parseReceiptText(text);
      
      expect(result.totalAmount).toBe(125.50);
    });
    
    it('should find largest amount when "total" keyword is missing', () => {
      const text = 'ACME Store\n123 Main St\nDate: 06/15/2025\nItem 1: $25.50\nItem 2: $50.00\nItem 3: $125.50';
      const result = OCRModule.parseReceiptText(text);
      
      expect(result.totalAmount).toBe(125.50);
    });
    
    it('should parse tax amount correctly', () => {
      const text = 'ACME Store\n123 Main St\nDate: 06/15/2025\nSubtotal: $115.25\nTax: $10.25\nTotal: $125.50';
      const result = OCRModule.parseReceiptText(text);
      
      expect(result.taxAmount).toBe(10.25);
    });
    
    it('should handle empty text', () => {
      const result = OCRModule.parseReceiptText('');
      
      expect(result.merchantName).toBeNull();
      expect(result.date).toBeNull();
      expect(result.totalAmount).toBeNull();
      expect(result.taxAmount).toBeNull();
      expect(result.items).toEqual([]);
    });
    
    it('should handle text without any extractable data', () => {
      const text = 'This is not a receipt';
      const result = OCRModule.parseReceiptText(text);
      
      expect(result.merchantName).toBe('This is not a receipt');
      expect(result.date).toBeNull();
      expect(result.totalAmount).toBeNull();
      expect(result.taxAmount).toBeNull();
    });
  });

  describe('terminate', () => {
    it('should terminate the worker if initialized', async () => {
      // Set up initialized worker
      const mockWorker = {
        terminate: jest.fn().mockResolvedValue(undefined)
      };
      OCRModule.worker = mockWorker;
      OCRModule.isInitialized = true;
      
      await OCRModule.terminate();
      
      expect(mockWorker.terminate).toHaveBeenCalled();
      expect(OCRModule.isInitialized).toBe(false);
    });
    
    it('should do nothing if worker is not initialized', async () => {
      // Ensure worker is not initialized
      OCRModule.worker = null;
      OCRModule.isInitialized = false;
      
      await OCRModule.terminate();
      
      // No error should be thrown
    });
  });
});
