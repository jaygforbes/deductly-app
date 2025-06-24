import { getFirestore, collection, addDoc, doc, updateDoc, getDoc, getDocs, query, where, orderBy, deleteDoc } from 'firebase/firestore';

class DeductionModule {
  constructor() {
    this.db = getFirestore();
    this.categories = [
      'Food & Meals',
      'Travel',
      'Lodging',
      'Supplies',
      'Equipment',
      'Utilities',
      'Subscriptions',
      'Education/Training',
      'Miscellaneous'
    ];
  }

  /**
   * Get all available deduction categories
   * @returns {Array} - List of deduction categories
   */
  getCategories() {
    return this.categories;
  }

  /**
   * Add a new deduction
   * @param {string} userId - Current user ID
   * @param {object} deductionData - Deduction data
   * @returns {Promise} - Result with deduction ID
   */
  async addDeduction(userId, deductionData) {
    try {
      const deductionsRef = collection(this.db, 'users', userId, 'deductions');
      
      const docData = {
        ...deductionData,
        createdAt: new Date(),
        amount: parseFloat(deductionData.amount) || 0,
      };
      
      const docRef = await addDoc(deductionsRef, docData);
      
      return { success: true, deductionId: docRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update an existing deduction
   * @param {string} userId - Current user ID
   * @param {string} deductionId - Deduction ID to update
   * @param {object} deductionData - Updated deduction data
   * @returns {Promise} - Result of update operation
   */
  async updateDeduction(userId, deductionId, deductionData) {
    try {
      const deductionRef = doc(this.db, 'users', userId, 'deductions', deductionId);
      
      const updateData = {
        ...deductionData,
        updatedAt: new Date(),
      };
      
      if (deductionData.amount !== undefined) {
        updateData.amount = parseFloat(deductionData.amount) || 0;
      }
      
      await updateDoc(deductionRef, updateData);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a deduction
   * @param {string} userId - Current user ID
   * @param {string} deductionId - Deduction ID to delete
   * @returns {Promise} - Result of delete operation
   */
  async deleteDeduction(userId, deductionId) {
    try {
      const deductionRef = doc(this.db, 'users', userId, 'deductions', deductionId);
      await deleteDoc(deductionRef);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get a deduction by ID
   * @param {string} userId - Current user ID
   * @param {string} deductionId - Deduction ID to retrieve
   * @returns {Promise} - Result with deduction data
   */
  async getDeduction(userId, deductionId) {
    try {
      const deductionRef = doc(this.db, 'users', userId, 'deductions', deductionId);
      const deductionDoc = await getDoc(deductionRef);
      
      if (!deductionDoc.exists()) {
        return { success: false, error: 'Deduction not found' };
      }
      
      return { success: true, deduction: { id: deductionDoc.id, ...deductionDoc.data() } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get deductions with optional filtering
   * @param {string} userId - Current user ID
   * @param {object} filters - Optional filters (category, profileId, startDate, endDate)
   * @returns {Promise} - Result with deductions array
   */
  async getDeductions(userId, filters = {}) {
    try {
      let deductionsQuery = collection(this.db, 'users', userId, 'deductions');
      let queryConstraints = [];
      
      // Apply filters if provided
      if (filters.category) {
        queryConstraints.push(where('category', '==', filters.category));
      }
      
      if (filters.profileId) {
        queryConstraints.push(where('profileId', '==', filters.profileId));
      }
      
      if (filters.startDate) {
        queryConstraints.push(where('date', '>=', filters.startDate));
      }
      
      if (filters.endDate) {
        queryConstraints.push(where('date', '<=', filters.endDate));
      }
      
      // Always order by date descending (newest first)
      queryConstraints.push(orderBy('date', 'desc'));
      
      const q = query(deductionsQuery, ...queryConstraints);
      const querySnapshot = await getDocs(q);
      
      const deductions = [];
      querySnapshot.forEach((doc) => {
        deductions.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, deductions };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Link a receipt to a deduction
   * @param {string} userId - Current user ID
   * @param {string} deductionId - Deduction ID
   * @param {string} receiptId - Receipt ID
   * @returns {Promise} - Result of link operation
   */
  async linkReceiptToDeduction(userId, deductionId, receiptId) {
    try {
      const deductionRef = doc(this.db, 'users', userId, 'deductions', deductionId);
      
      await updateDoc(deductionRef, {
        receiptId,
        updatedAt: new Date(),
      });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get summary statistics for deductions
   * @param {string} userId - Current user ID
   * @param {object} filters - Optional filters (profileId, startDate, endDate)
   * @returns {Promise} - Result with summary data
   */
  async getDeductionsSummary(userId, filters = {}) {
    try {
      const deductionsResult = await this.getDeductions(userId, filters);
      
      if (!deductionsResult.success) {
        return deductionsResult;
      }
      
      const { deductions } = deductionsResult;
      
      // Calculate total amount
      const totalAmount = deductions.reduce((sum, deduction) => sum + (deduction.amount || 0), 0);
      
      // Group by category
      const categorySummary = {};
      this.categories.forEach(category => {
        categorySummary[category] = 0;
      });
      
      deductions.forEach(deduction => {
        const category = deduction.category || 'Miscellaneous';
        categorySummary[category] = (categorySummary[category] || 0) + (deduction.amount || 0);
      });
      
      // Group by month
      const monthSummary = {};
      deductions.forEach(deduction => {
        if (deduction.date) {
          const date = deduction.date.toDate ? deduction.date.toDate() : new Date(deduction.date);
          const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          monthSummary[monthYear] = (monthSummary[monthYear] || 0) + (deduction.amount || 0);
        }
      });
      
      return {
        success: true,
        summary: {
          totalAmount,
          totalCount: deductions.length,
          categorySummary,
          monthSummary,
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new DeductionModule();
