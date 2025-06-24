import { firebase } from '../../firebase';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

class ReportModule {
  /**
   * Get available time period options for reports
   * @returns {Array} Array of time period options
   */
  getTimePeriodOptions() {
    return [
      { label: 'This Month', value: 'month' },
      { label: 'This Quarter', value: 'quarter' },
      { label: 'This Year', value: 'year' },
      { label: 'All Time', value: 'all' },
      { label: 'Custom', value: 'custom' }
    ];
  }

  /**
   * Get start and end dates based on time period
   * @param {string} timePeriod - The time period (month, quarter, year, all, custom)
   * @param {Date} customStartDate - Custom start date (if timePeriod is 'custom')
   * @param {Date} customEndDate - Custom end date (if timePeriod is 'custom')
   * @returns {Object} Object containing start and end dates
   */
  getDateRangeForTimePeriod(timePeriod, customStartDate = null, customEndDate = null) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    
    switch (timePeriod) {
      case 'month':
        return {
          startDate: new Date(now.getFullYear(), now.getMonth(), 1),
          endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
        };
      
      case 'quarter':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        return {
          startDate: new Date(now.getFullYear(), currentQuarter * 3, 1),
          endDate: new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0, 23, 59, 59)
        };
      
      case 'year':
        return {
          startDate: new Date(now.getFullYear(), 0, 1),
          endDate: new Date(now.getFullYear(), 11, 31, 23, 59, 59)
        };
      
      case 'all':
        return {
          startDate: new Date(2000, 0, 1), // Far in the past
          endDate: endOfDay
        };
      
      case 'custom':
        if (!customStartDate || !customEndDate) {
          throw new Error('Custom date range requires both start and end dates');
        }
        return {
          startDate: new Date(customStartDate.setHours(0, 0, 0, 0)),
          endDate: new Date(customEndDate.setHours(23, 59, 59, 999))
        };
      
      default:
        return {
          startDate: startOfDay,
          endDate: endOfDay
        };
    }
  }

  /**
   * Get deduction report data
   * @param {string} userId - User ID
   * @param {string} timePeriod - Time period for the report
   * @param {string} profileId - Optional profile ID to filter by
   * @param {Date} customStartDate - Custom start date (if timePeriod is 'custom')
   * @param {Date} customEndDate - Custom end date (if timePeriod is 'custom')
   * @returns {Promise<Object>} Promise resolving to report data or error
   */
  async getDeductionReport(userId, timePeriod, profileId = null, customStartDate = null, customEndDate = null) {
    try {
      const { startDate, endDate } = this.getDateRangeForTimePeriod(
        timePeriod, 
        customStartDate, 
        customEndDate
      );
      
      let deductionsRef = firebase.firestore()
        .collection('users')
        .doc(userId)
        .collection('deductions')
        .where('date', '>=', startDate)
        .where('date', '<=', endDate);
        
      if (profileId) {
        deductionsRef = deductionsRef.where('profileId', '==', profileId);
      }
      
      const snapshot = await deductionsRef.get();
      const deductions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate()
      }));
      
      // Calculate total amount and count
      const totalAmount = deductions.reduce((sum, deduction) => sum + deduction.amount, 0);
      const totalCount = deductions.length;
      
      // Group by category
      const categoryMap = {};
      deductions.forEach(deduction => {
        const category = deduction.category || 'Uncategorized';
        if (!categoryMap[category]) {
          categoryMap[category] = {
            category,
            amount: 0,
            count: 0
          };
        }
        categoryMap[category].amount += deduction.amount;
        categoryMap[category].count += 1;
      });
      
      // Convert to array and sort by amount
      const categoryData = Object.values(categoryMap).sort((a, b) => b.amount - a.amount);
      
      // Format for pie chart
      const pieChartData = categoryData.map((item, index) => {
        const colors = [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#8AC926', '#1982C4', '#6A4C93', '#F15BB5'
        ];
        
        return {
          name: item.category,
          amount: item.amount,
          count: item.count,
          color: colors[index % colors.length],
          legendFontColor: '#7F7F7F',
          legendFontSize: 12
        };
      });
      
      // Group by month for bar chart
      const monthlyMap = {};
      deductions.forEach(deduction => {
        const monthYear = `${deduction.date.getMonth() + 1}/${deduction.date.getFullYear()}`;
        if (!monthlyMap[monthYear]) {
          monthlyMap[monthYear] = {
            month: monthYear,
            amount: 0
          };
        }
        monthlyMap[monthYear].amount += deduction.amount;
      });
      
      // Convert to array and sort by date
      const monthlyData = Object.values(monthlyMap).sort((a, b) => {
        const [aMonth, aYear] = a.month.split('/').map(Number);
        const [bMonth, bYear] = b.month.split('/').map(Number);
        return (aYear * 12 + aMonth) - (bYear * 12 + bMonth);
      });
      
      // Format for bar chart
      const barChartData = {
        labels: monthlyData.map(item => item.month),
        datasets: [
          {
            data: monthlyData.map(item => item.amount)
          }
        ]
      };
      
      return {
        success: true,
        report: {
          totalAmount,
          totalCount,
          startDate,
          endDate,
          categoryData: pieChartData,
          monthlyData: barChartData,
          deductions
        }
      };
    } catch (error) {
      console.error('Error getting deduction report:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get mileage report data
   * @param {string} userId - User ID
   * @param {string} timePeriod - Time period for the report
   * @param {string} profileId - Optional profile ID to filter by
   * @param {Date} customStartDate - Custom start date (if timePeriod is 'custom')
   * @param {Date} customEndDate - Custom end date (if timePeriod is 'custom')
   * @returns {Promise<Object>} Promise resolving to report data or error
   */
  async getMileageReport(userId, timePeriod, profileId = null, customStartDate = null, customEndDate = null) {
    try {
      const { startDate, endDate } = this.getDateRangeForTimePeriod(
        timePeriod, 
        customStartDate, 
        customEndDate
      );
      
      let tripsRef = firebase.firestore()
        .collection('users')
        .doc(userId)
        .collection('trips')
        .where('endTime', '>=', startDate)
        .where('endTime', '<=', endDate);
        
      if (profileId) {
        tripsRef = tripsRef.where('profileId', '==', profileId);
      }
      
      const snapshot = await tripsRef.get();
      const trips = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime.toDate(),
        endTime: doc.data().endTime.toDate()
      }));
      
      // Calculate total miles and count
      const totalMiles = trips.reduce((sum, trip) => sum + (trip.distance || 0), 0);
      const totalCount = trips.length;
      const totalDuration = trips.reduce((sum, trip) => {
        const duration = (trip.endTime - trip.startTime) / (1000 * 60); // in minutes
        return sum + duration;
      }, 0);
      
      // Group by month for bar chart
      const monthlyMap = {};
      trips.forEach(trip => {
        const monthYear = `${trip.endTime.getMonth() + 1}/${trip.endTime.getFullYear()}`;
        if (!monthlyMap[monthYear]) {
          monthlyMap[monthYear] = {
            month: monthYear,
            miles: 0,
            count: 0
          };
        }
        monthlyMap[monthYear].miles += (trip.distance || 0);
        monthlyMap[monthYear].count += 1;
      });
      
      // Convert to array and sort by date
      const monthlyData = Object.values(monthlyMap).sort((a, b) => {
        const [aMonth, aYear] = a.month.split('/').map(Number);
        const [bMonth, bYear] = b.month.split('/').map(Number);
        return (aYear * 12 + aMonth) - (bYear * 12 + bMonth);
      });
      
      // Format for bar chart
      const barChartData = {
        labels: monthlyData.map(item => item.month),
        datasets: [
          {
            data: monthlyData.map(item => item.miles)
          }
        ]
      };
      
      return {
        success: true,
        report: {
          totalMiles,
          totalCount,
          totalDuration,
          startDate,
          endDate,
          monthlyData: barChartData,
          trips
        }
      };
    } catch (error) {
      console.error('Error getting mileage report:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Export deductions to CSV
   * @param {string} userId - User ID
   * @param {string} timePeriod - Time period for the export
   * @param {string} profileId - Optional profile ID to filter by
   * @param {Date} customStartDate - Custom start date (if timePeriod is 'custom')
   * @param {Date} customEndDate - Custom end date (if timePeriod is 'custom')
   * @returns {Promise<Object>} Promise resolving to export result or error
   */
  async exportDeductionsToCSV(userId, timePeriod, profileId = null, customStartDate = null, customEndDate = null) {
    try {
      const result = await this.getDeductionReport(
        userId, 
        timePeriod, 
        profileId, 
        customStartDate, 
        customEndDate
      );
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      const { deductions } = result.report;
      
      if (deductions.length === 0) {
        return {
          success: false,
          error: 'No deductions found for the selected period'
        };
      }
      
      // Create CSV header
      let csv = 'Date,Title,Amount,Category,Profile,Notes,Receipt URL\n';
      
      // Add data rows
      deductions.forEach(deduction => {
        const date = deduction.date.toISOString().split('T')[0];
        const title = deduction.title ? `"${deduction.title.replace(/"/g, '""')}"` : '';
        const amount = deduction.amount || 0;
        const category = deduction.category ? `"${deduction.category.replace(/"/g, '""')}"` : '';
        const profile = deduction.profileName ? `"${deduction.profileName.replace(/"/g, '""')}"` : '';
        const notes = deduction.notes ? `"${deduction.notes.replace(/"/g, '""')}"` : '';
        const receiptUrl = deduction.receiptUrl || '';
        
        csv += `${date},${title},${amount},${category},${profile},${notes},${receiptUrl}\n`;
      });
      
      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `deductions_export_${timestamp}.csv`;
      
      // Write to file
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(fileUri, csv);
      
      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        throw new Error('Sharing is not available on this device');
      }
      
      return {
        success: true,
        filePath: fileUri
      };
    } catch (error) {
      console.error('Error exporting deductions to CSV:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Export mileage to CSV
   * @param {string} userId - User ID
   * @param {string} timePeriod - Time period for the export
   * @param {string} profileId - Optional profile ID to filter by
   * @param {Date} customStartDate - Custom start date (if timePeriod is 'custom')
   * @param {Date} customEndDate - Custom end date (if timePeriod is 'custom')
   * @returns {Promise<Object>} Promise resolving to export result or error
   */
  async exportMileageToCSV(userId, timePeriod, profileId = null, customStartDate = null, customEndDate = null) {
    try {
      const result = await this.getMileageReport(
        userId, 
        timePeriod, 
        profileId, 
        customStartDate, 
        customEndDate
      );
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      const { trips } = result.report;
      
      if (trips.length === 0) {
        return {
          success: false,
          error: 'No trips found for the selected period'
        };
      }
      
      // Create CSV header
      let csv = 'Start Date,End Date,Distance (miles),Duration (minutes),Profile,Purpose,Start Location,End Location\n';
      
      // Add data rows
      trips.forEach(trip => {
        const startDate = trip.startTime.toISOString();
        const endDate = trip.endTime.toISOString();
        const distance = trip.distance || 0;
        const duration = ((trip.endTime - trip.startTime) / (1000 * 60)).toFixed(2); // in minutes
        const profile = trip.profileName ? `"${trip.profileName.replace(/"/g, '""')}"` : '';
        const purpose = trip.purpose ? `"${trip.purpose.replace(/"/g, '""')}"` : '';
        const startLocation = trip.startAddress ? `"${trip.startAddress.replace(/"/g, '""')}"` : '';
        const endLocation = trip.endAddress ? `"${trip.endAddress.replace(/"/g, '""')}"` : '';
        
        csv += `${startDate},${endDate},${distance},${duration},${profile},${purpose},${startLocation},${endLocation}\n`;
      });
      
      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `mileage_export_${timestamp}.csv`;
      
      // Write to file
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(fileUri, csv);
      
      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        throw new Error('Sharing is not available on this device');
      }
      
      return {
        success: true,
        filePath: fileUri
      };
    } catch (error) {
      console.error('Error exporting mileage to CSV:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new ReportModule();
