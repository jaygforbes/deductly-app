import RecurringModule from '../index';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  deleteDoc,
  query,
  where
} from 'firebase/firestore';

// Mock Firestore
jest.mock('firebase/firestore');

describe('RecurringModule', () => {
  const mockUserId = 'test-user-123';
  const mockTemplateId = 'test-template-123';
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Firestore functions
    getFirestore.mockReturnValue({});
    collection.mockReturnValue({});
    doc.mockReturnValue({});
    query.mockReturnValue({});
    where.mockReturnValue({});
  });

  // Add helper methods to mocks for easier testing
  addDoc.failNextCall = function(errorMessage) {
    this.mockImplementationOnce(() => Promise.reject(new Error(errorMessage)));
  };
  
  updateDoc.failNextCall = function(errorMessage) {
    this.mockImplementationOnce(() => Promise.reject(new Error(errorMessage)));
  };
  
  getDoc.failNextCall = function(errorMessage) {
    this.mockImplementationOnce(() => Promise.reject(new Error(errorMessage)));
  };

  describe('createTemplate', () => {
    it('should create a template successfully', async () => {
      const mockTemplateData = {
        title: 'Office Rent',
        amount: 1200,
        category: 'Rent',
        frequency: 'monthly',
        profileId: 'profile-123',
        profileName: 'Design Business'
      };
      
      addDoc.mockImplementationOnce(() => Promise.resolve({ id: mockTemplateId }));
      
      const result = await RecurringModule.createTemplate(mockUserId, mockTemplateData);
      
      expect(addDoc).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.templateId).toBe(mockTemplateId);
      
      // Verify the data passed to addDoc includes the original data plus createdAt
      const addDocArgs = addDoc.mock.calls[0][1];
      expect(addDocArgs.title).toBe(mockTemplateData.title);
      expect(addDocArgs.amount).toBe(mockTemplateData.amount);
      expect(addDocArgs.createdAt).toBeInstanceOf(Date);
      expect(addDocArgs.isActive).toBe(true);
    });
    
    it('should handle errors when creating a template', async () => {
      const mockTemplateData = {
        title: 'Office Rent',
        amount: 1200
      };
      
      const mockError = new Error('Create template error');
      addDoc.mockImplementationOnce(() => Promise.reject(mockError));
      
      const result = await RecurringModule.createTemplate(mockUserId, mockTemplateData);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(mockError.message);
    });
  });

  describe('updateTemplate', () => {
    it('should update a template successfully', async () => {
      const mockUpdateData = {
        title: 'Updated Office Rent',
        amount: 1300
      };
      
      updateDoc.mockImplementationOnce(() => Promise.resolve({}));
      
      const result = await RecurringModule.updateTemplate(
        mockUserId, 
        mockTemplateId, 
        mockUpdateData
      );
      
      expect(updateDoc).toHaveBeenCalled();
      expect(result.success).toBe(true);
      
      // Verify the data passed to updateDoc includes the original data plus updatedAt
      const updateDocArgs = updateDoc.mock.calls[0][1];
      expect(updateDocArgs.title).toBe(mockUpdateData.title);
      expect(updateDocArgs.amount).toBe(mockUpdateData.amount);
      expect(updateDocArgs.updatedAt).toBeInstanceOf(Date);
    });
    
    it('should handle errors when updating a template', async () => {
      const mockUpdateData = {
        title: 'Updated Office Rent'
      };
      
      const mockError = new Error('Update template error');
      updateDoc.mockImplementationOnce(() => Promise.reject(mockError));
      
      const result = await RecurringModule.updateTemplate(
        mockUserId, 
        mockTemplateId, 
        mockUpdateData
      );
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(mockError.message);
    });
  });

  describe('deleteTemplate', () => {
    it('should delete a template successfully', async () => {
      deleteDoc.mockImplementationOnce(() => Promise.resolve({}));
      
      const result = await RecurringModule.deleteTemplate(mockUserId, mockTemplateId);
      
      expect(deleteDoc).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
    
    it('should handle errors when deleting a template', async () => {
      const mockError = new Error('Delete template error');
      deleteDoc.mockImplementationOnce(() => Promise.reject(mockError));
      
      const result = await RecurringModule.deleteTemplate(mockUserId, mockTemplateId);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(mockError.message);
    });
  });

  describe('getTemplate', () => {
    it('should get a template by ID successfully', async () => {
      // Define template data that matches what's expected
      const mockTemplateData = {
        title: 'Office Rent',
        amount: 1200,
        frequency: 'monthly',
        createdAt: new Date()
      };
      
      // Create a custom mock for this test
      getDoc.mockImplementationOnce(() => Promise.resolve({
        exists: () => true,
        id: mockTemplateId,
        data: () => mockTemplateData
      }));
      
      const result = await RecurringModule.getTemplate(mockUserId, mockTemplateId);
      
      expect(getDoc).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.template).toEqual({
        id: mockTemplateId,
        ...mockTemplateData
      });
    });
    
    it('should handle non-existent template', async () => {
      // Create a custom mock that returns a document that doesn't exist
      getDoc.mockImplementationOnce(() => Promise.resolve({
        exists: () => false,
        id: mockTemplateId
      }));
      
      const result = await RecurringModule.getTemplate(mockUserId, mockTemplateId);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Template not found');
    });
    
    it('should handle errors when getting a template', async () => {
      const mockError = new Error('Get template error');
      getDoc.mockImplementationOnce(() => Promise.reject(mockError));
      
      const result = await RecurringModule.getTemplate(mockUserId, mockTemplateId);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(mockError.message);
    });
  });

  describe('shouldGenerateDeduction', () => {
    it('should return false for inactive templates', () => {
      const template = {
        isActive: false,
        frequency: 'monthly',
        lastGenerated: { toDate: () => new Date('2025-05-15') }
      };
      
      const currentDate = new Date('2025-06-15');
      const result = RecurringModule.shouldGenerateDeduction(template, currentDate);
      
      expect(result).toBe(false);
    });
    
    it('should return true if template has never been generated', () => {
      const template = {
        isActive: true,
        frequency: 'monthly',
        lastGenerated: null
      };
      
      const currentDate = new Date('2025-06-15');
      const result = RecurringModule.shouldGenerateDeduction(template, currentDate);
      
      expect(result).toBe(true);
    });
    
    it('should correctly handle daily frequency', () => {
      const template = {
        isActive: true,
        frequency: 'daily',
        lastGenerated: { toDate: () => new Date('2025-06-15T00:00:00') }
      };
      
      // Same day - should not generate
      let currentDate = new Date('2025-06-15T12:00:00');
      let result = RecurringModule.shouldGenerateDeduction(template, currentDate);
      expect(result).toBe(false);
      
      // Next day - should generate
      currentDate = new Date("2025-06-16T00:00:00");
      result = RecurringModule.shouldGenerateDeduction(template, currentDate);
      expect(result).toBe(true);
    });
    
    it('should correctly handle weekly frequency', () => {
      const template = {
        isActive: true,
        frequency: 'weekly',
        lastGenerated: { toDate: () => new Date('2025-06-01') }
      };
      
      // Same week - should not generate
      let currentDate = new Date('2025-06-07');
      let result = RecurringModule.shouldGenerateDeduction(template, currentDate);
      expect(result).toBe(false);
      
      // Next week - should generate
      currentDate = new Date('2025-06-08');
      result = RecurringModule.shouldGenerateDeduction(template, currentDate);
      expect(result).toBe(true);
    });
    
    it('should correctly handle biweekly frequency', () => {
      const template = {
        isActive: true,
        frequency: 'biweekly',
        lastGenerated: { toDate: () => new Date('2025-06-01') }
      };
      
      // Less than 14 days - should not generate
      let currentDate = new Date('2025-06-14');
      let result = RecurringModule.shouldGenerateDeduction(template, currentDate);
      expect(result).toBe(false);
      
      // 14 days or more - should generate
      currentDate = new Date('2025-06-15');
      result = RecurringModule.shouldGenerateDeduction(template, currentDate);
      expect(result).toBe(true);
    });
    
    it('should correctly handle monthly frequency', () => {
      // Create dates with explicit year, month, day to avoid timezone issues
      const lastGenDate = new Date(2025, 4, 15); // May 15, 2025 (months are 0-indexed)
      
      const template = {
        isActive: true,
        frequency: 'monthly',
        lastGenerated: { toDate: () => lastGenDate }
      };
      
      // Same month - should not generate
      let currentDate = new Date(2025, 4, 30); // May 30, 2025
      let result = RecurringModule.shouldGenerateDeduction(template, currentDate);
      expect(result).toBe(false);
      
      // Next month - should generate
      currentDate = new Date(2025, 5, 1); // June 1, 2025
      result = RecurringModule.shouldGenerateDeduction(template, currentDate);
      expect(result).toBe(true);
    });
    
    it('should correctly handle quarterly frequency', () => {
      const template = {
        isActive: true,
        frequency: 'quarterly',
        lastGenerated: { toDate: () => new Date('2025-04-15') } // Q2
      };
      
      // Same quarter - should not generate
      let currentDate = new Date('2025-06-30'); // Still Q2
      let result = RecurringModule.shouldGenerateDeduction(template, currentDate);
      expect(result).toBe(false);
      
      // Next quarter - should generate
      currentDate = new Date("2025-10-01"); // Q4
      result = RecurringModule.shouldGenerateDeduction(template, currentDate);
      expect(result).toBe(true);
    });
    
    it('should correctly handle yearly frequency', () => {
      const template = {
        isActive: true,
        frequency: 'yearly',
        lastGenerated: { toDate: () => new Date('2024-12-15') }
      };
      
      // Same year - should not generate
      let currentDate = new Date('2024-12-31');
      let result = RecurringModule.shouldGenerateDeduction(template, currentDate);
      expect(result).toBe(false);
      
      // Next year - should generate
      currentDate = new Date("2026-01-01");
      result = RecurringModule.shouldGenerateDeduction(template, currentDate);
      expect(result).toBe(true);
    });
    
    it('should handle unknown frequency', () => {
      const template = {
        isActive: true,
        frequency: 'unknown',
        lastGenerated: { toDate: () => new Date('2025-06-15') }
      };
      
      const currentDate = new Date('2025-06-16');
      const result = RecurringModule.shouldGenerateDeduction(template, currentDate);
      
      expect(result).toBe(false);
    });
  });

  describe('generateDeductions', () => {
    it('should generate deductions from eligible templates', async () => {
      // Mock templates
      const mockTemplates = [
        { 
          id: 'template-1', 
          title: 'Office Rent', 
          amount: 1200,
          category: 'Rent',
          frequency: 'monthly',
          profileId: 'profile-123',
          profileName: 'Design Business',
          isActive: true,
          lastGenerated: { toDate: () => new Date('2025-05-15') } // Last month
        },
        { 
          id: 'template-2', 
          title: 'Software Subscription', 
          amount: 50,
          category: 'Subscriptions',
          frequency: 'monthly',
          profileId: 'profile-123',
          profileName: 'Design Business',
          isActive: true,
          lastGenerated: { toDate: () => new Date('2025-06-15') } // This month - should not generate
        },
        { 
          id: 'template-3', 
          title: 'Inactive Subscription', 
          amount: 25,
          category: 'Subscriptions',
          frequency: 'monthly',
          profileId: 'profile-123',
          profileName: 'Design Business',
          isActive: false, // Inactive - should not generate
          lastGenerated: { toDate: () => new Date('2025-05-15') }
        }
      ];
      
      const mockForEach = jest.fn((callback) => {
        mockTemplates.forEach((item) => {
          callback({
            id: item.id,
            data: () => item
          });
        });
      });
      
      // Reset mocks before test
      jest.clearAllMocks();
      
      // Mock query results
      getDocs.mockImplementationOnce(() => Promise.resolve({
        forEach: mockForEach
      }));
      
      // Mock addDoc for new deduction
      const mockDeductionId = 'new-deduction-123';
      addDoc.mockImplementationOnce(() => Promise.resolve({ id: mockDeductionId }));
      
      // Mock updateDoc for updating lastGenerated
      updateDoc.mockImplementationOnce(() => Promise.resolve({}));
      
      // Set current date to June 2025
      const originalDate = global.Date;
      global.Date = class extends Date {
        constructor(...args) {
          if (args.length === 0) {
            return new originalDate('2025-06-20T12:00:00');
          }
          return new originalDate(...args);
        }
      };
      
      const result = await RecurringModule.generateDeductions(mockUserId);
      
      // Restore original Date
      global.Date = originalDate;
      
      expect(query).toHaveBeenCalled();
      expect(getDocs).toHaveBeenCalled();
      expect(addDoc).toHaveBeenCalledTimes(1); // Only one template should generate
      expect(updateDoc).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(true);
      expect(result.deductions.length).toBe(1);
      expect(result.count).toBe(1);
      
      // Verify the generated deduction
      const generatedDeduction = result.deductions[0];
      expect(generatedDeduction.id).toBe(mockDeductionId);
      expect(generatedDeduction.title).toBe('Office Rent');
      expect(generatedDeduction.amount).toBe(1200);
      expect(generatedDeduction.isRecurring).toBe(true);
      expect(generatedDeduction.recurringTemplateId).toBe('template-1');
    });
    
    it('should filter by profileId when provided', async () => {
      // Mock empty results for simplicity
      getDocs.mockResolvedValueOnce({
        forEach: jest.fn()
      });
      
      const profileId = 'profile-123';
      await RecurringModule.generateDeductions(mockUserId, profileId);
      
      // Verify that where was called with profileId filter
      expect(where).toHaveBeenCalledWith('profileId', '==', profileId);
    });
    
    it('should handle errors when generating deductions', async () => {
      const mockError = new Error('Generate deductions error');
      getDocs.mockImplementationOnce(() => Promise.reject(mockError));
      
      const result = await RecurringModule.generateDeductions(mockUserId);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(mockError.message);
    });
  });
});
