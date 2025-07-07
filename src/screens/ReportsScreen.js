import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useProfile } from '../contexts/ProfileContext';
import ReportModule from '../modules/ReportModule';

const ReportsScreen = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { activeProfile } = useProfile(); // Removed unused profiles variable
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('month');
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  
  const timePeriodOptions = ReportModule.getTimePeriodOptions();
  const screenWidth = Dimensions.get('window').width - 32; // Padding

  useEffect(() => {
    loadReportData();
  }, [user, activeProfile, selectedTimePeriod]);

  const loadReportData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await ReportModule.getDeductionReport(
        user.uid,
        selectedTimePeriod,
        activeProfile?.id
      );
      
      if (result.success) {
        setReportData(result.report);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const chartConfig = {
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    color: (opacity = 1) => theme.isDarkMode 
      ? `rgba(255, 255, 255, ${opacity})`
      : `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
  };

  const styles = StyleSheet.create({
    card: {
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
    chartContainer: {
      alignItems: 'center',
      marginVertical: 16,
    },
    container: {
      backgroundColor: theme.background,
      flex: 1,
    },
    content: {
      padding: 16,
    },
    errorText: {
      color: theme.error,
      marginTop: 16,
      textAlign: 'center',
    },
    filterChip: {
      borderRadius: 16,
      marginBottom: 8,
      marginRight: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    filterChipSelected: {
      backgroundColor: theme.primary,
    },
    filterChipUnselected: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderWidth: 1,
    },
    filterContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 16,
    },
    filterText: {
      fontSize: 14,
    },
    filterTextSelected: {
      color: '#FFFFFF',
    },
    filterTextUnselected: {
      color: theme.text,
    },
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    loadingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    noDataContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    noDataText: {
      color: theme.textSecondary,
      fontSize: 16,
      marginTop: 12,
      textAlign: 'center',
    },
    sectionTitle: {
      color: theme.text,
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 12,
      marginTop: 16,
    },
    summaryAmount: {
      color: theme.text,
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    summaryText: {
      color: theme.text,
      fontSize: 16,
      marginBottom: 8,
    },
    title: {
      color: theme.text,
      fontSize: 20,
      fontWeight: 'bold',
    },
  });

  const renderTimePeriodFilters = () => {
    return (
      <View style={styles.filterContainer}>
        {timePeriodOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.filterChip,
              selectedTimePeriod === option.value 
                ? styles.filterChipSelected 
                : styles.filterChipUnselected
            ]}
            onPress={() => setSelectedTimePeriod(option.value)}
          >
            <Text
              style={[
                styles.filterText,
                selectedTimePeriod === option.value 
                  ? styles.filterTextSelected 
                  : styles.filterTextUnselected
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderSummary = () => {
    if (!reportData) return null;
    
    return (
      <View style={styles.card}>
        <Text style={styles.summaryText}>Total Deductions</Text>
        <Text style={styles.summaryAmount}>
          ${reportData.totalAmount.toFixed(2)}
        </Text>
        <Text style={styles.summaryText}>
          {reportData.totalCount} {reportData.totalCount === 1 ? 'item' : 'items'} • 
          {activeProfile ? ` ${activeProfile.name}` : ' All Profiles'}
        </Text>
      </View>
    );
  };

  const renderCategoryChart = () => {
    if (!reportData || !reportData.categoryData || reportData.categoryData.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Ionicons name="pie-chart-outline" size={48} color={theme.textSecondary} />
          <Text style={styles.noDataText}>No category data available for the selected period</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.chartContainer}>
        <PieChart
          data={reportData.categoryData}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>
    );
  };

  const renderMonthlyChart = () => {
    if (
      !reportData || 
      !reportData.monthlyData || 
      !reportData.monthlyData.labels || 
      reportData.monthlyData.labels.length === 0
    ) {
      return (
        <View style={styles.noDataContainer}>
          <Ionicons name="bar-chart-outline" size={48} color={theme.textSecondary} />
          <Text style={styles.noDataText}>No monthly data available for the selected period</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.chartContainer}>
        <BarChart
          data={reportData.monthlyData}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
          verticalLabelRotation={30}
          fromZero
        />
      </View>
    );
  };

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
          <Text style={styles.title}>Deduction Reports</Text>
        </View>

        {renderTimePeriodFilters()}
        {renderSummary()}

        <Text style={styles.sectionTitle}>Spending by Category</Text>
        {renderCategoryChart()}

        <Text style={styles.sectionTitle}>Monthly Spending</Text>
        {renderMonthlyChart()}

        {error && (
          <Text style={styles.errorText}>Error: {error}</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReportsScreen;
