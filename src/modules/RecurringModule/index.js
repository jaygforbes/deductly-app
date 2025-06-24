import { getFirestore, collection, addDoc, doc, updateDoc, getDoc, getDocs, deleteDoc, query, where } from 'firebase/firestore';

class RecurringModule {
  constructor() {
    this.db = getFirestore();
  }

  /**
   * Create a new recurring deduction template
   * @param {string} userId - Current user ID
   * @param {object} templateData - Template data including frequency, category, amount, etc.
   * @returns {Promise} - Result with template ID
   */
  async createTemplate(userId, templateData) {
    try {
      const templatesRef = collection(this.db, 'users', userId, 'recurringTemplates');
      
      const docData = {
        ...templateData,
        createdAt: new Date(),
        lastGenerated: null,
        isActive: true
      };
      
      const docRef = await addDoc(templatesRef, docData);
      
      return { success: true, templateId: docRef.id };
    } catch (error) {
      console.error('Error creating recurring template:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update an existing recurring deduction template
   * @param {string} userId - Current user ID
   * @param {string} templateId - Template ID to update
   * @param {object} templateData - Updated template data
   * @returns {Promise} - Result of update operation
   */
  async updateTemplate(userId, templateId, templateData) {
    try {
      const templateRef = doc(this.db, 'users', userId, 'recurringTemplates', templateId);
      
      await updateDoc(templateRef, {
        ...templateData,
        updatedAt: new Date()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating recurring template:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a recurring deduction template
   * @param {string} userId - Current user ID
   * @param {string} templateId - Template ID to delete
   * @returns {Promise} - Result of delete operation
   */
  async deleteTemplate(userId, templateId) {
    try {
      const templateRef = doc(this.db, 'users', userId, 'recurringTemplates', templateId);
      await deleteDoc(templateRef);
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting recurring template:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all recurring templates for a user
   * @param {string} userId - Current user ID
   * @returns {Promise} - Result with templates array
   */
  async getTemplates(userId) {
    try {
      const templatesRef = collection(this.db, 'users', userId, 'recurringTemplates');
      const querySnapshot = await getDocs(templatesRef);
      
      const templates = [];
      querySnapshot.forEach((doc) => {
        templates.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, templates };
    } catch (error) {
      console.error('Error getting recurring templates:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get a specific template by ID
   * @param {string} userId - Current user ID
   * @param {string} templateId - Template ID to retrieve
   * @returns {Promise} - Result with template data
   */
  async getTemplate(userId, templateId) {
    try {
      const templateRef = doc(this.db, 'users', userId, 'recurringTemplates', templateId);
      const templateDoc = await getDoc(templateRef);
      
      if (!templateDoc.exists()) {
        return { success: false, error: 'Template not found' };
      }
      
      return { success: true, template: { id: templateDoc.id, ...templateDoc.data() } };
    } catch (error) {
      console.error('Error getting recurring template:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate deductions from recurring templates
   * @param {string} userId - Current user ID
   * @param {string} profileId - Optional profile ID to filter templates
   * @returns {Promise} - Result with generated deductions
   */
  async generateDeductions(userId, profileId = null) {
    try {
      // Get all active templates
      let templatesQuery;
      if (profileId) {
        templatesQuery = query(
          collection(this.db, 'users', userId, 'recurringTemplates'),
          where('isActive', '==', true),
          where('profileId', '==', profileId)
        );
      } else {
        templatesQuery = query(
          collection(this.db, 'users', userId, 'recurringTemplates'),
          where('isActive', '==', true)
        );
      }
      
      const querySnapshot = await getDocs(templatesQuery);
      const templates = [];
      querySnapshot.forEach((doc) => {
        templates.push({ id: doc.id, ...doc.data() });
      });
      
      const now = new Date();
      const generatedDeductions = [];
      
      // Process each template
      for (const template of templates) {
        const shouldGenerate = this.shouldGenerateDeduction(template, now);
        
        if (shouldGenerate) {
          // Create new deduction from template
          const deductionData = {
            title: template.title,
            amount: template.amount,
            category: template.category,
            date: new Date(),
            notes: template.notes || '',
            profileId: template.profileId,
            profileName: template.profileName,
            isRecurring: true,
            recurringTemplateId: template.id,
            createdAt: new Date()
          };
          
          const deductionsRef = collection(this.db, 'users', userId, 'deductions');
          const deductionRef = await addDoc(deductionsRef, deductionData);
          
          // Update template's lastGenerated timestamp
          const templateRef = doc(this.db, 'users', userId, 'recurringTemplates', template.id);
          await updateDoc(templateRef, {
            lastGenerated: new Date()
          });
          
          generatedDeductions.push({
            id: deductionRef.id,
            ...deductionData
          });
        }
      }
      
      return { 
        success: true, 
        deductions: generatedDeductions,
        count: generatedDeductions.length
      };
    } catch (error) {
      console.error('Error generating recurring deductions:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Determine if a deduction should be generated from a template
   * @param {object} template - Template object
   * @param {Date} currentDate - Current date to check against
   * @returns {boolean} - Whether deduction should be generated
   */
  shouldGenerateDeduction(template, currentDate) {
    if (!template.isActive) {
      return false;
    }
    
    const lastGenerated = template.lastGenerated ? template.lastGenerated.toDate() : null;
    
    // If never generated, generate now
    if (!lastGenerated) {
      return true;
    }
    
    const frequency = template.frequency || 'monthly';
    
    switch (frequency) {
      case 'daily':
        // Generate if last generation was yesterday or earlier
        const oneDayMs = 24 * 60 * 60 * 1000;
        return (currentDate.getTime() - lastGenerated.getTime()) >= oneDayMs;
        
      case 'weekly':
        // Generate if last generation was 7 days ago or more
        const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
        return (currentDate.getTime() - lastGenerated.getTime()) >= oneWeekMs;
        
      case 'biweekly':
        // Generate if last generation was 14 days ago or more
        const twoWeeksMs = 14 * 24 * 60 * 60 * 1000;
        return (currentDate.getTime() - lastGenerated.getTime()) >= twoWeeksMs;
        
      case 'monthly':
        // Generate if in a new month compared to last generation
        return (
          currentDate.getMonth() !== lastGenerated.getMonth() ||
          currentDate.getFullYear() !== lastGenerated.getFullYear()
        );
        
      case 'quarterly':
        // Generate if in a new quarter compared to last generation
        const lastQuarter = Math.floor(lastGenerated.getMonth() / 3);
        const currentQuarter = Math.floor(currentDate.getMonth() / 3);
        return (
          currentQuarter !== lastQuarter ||
          currentDate.getFullYear() !== lastGenerated.getFullYear()
        );
        
      case 'yearly':
        // Generate if in a new year compared to last generation
        return currentDate.getFullYear() !== lastGenerated.getFullYear();
        
      default:
        return false;
    }
  }
}

export default new RecurringModule();
