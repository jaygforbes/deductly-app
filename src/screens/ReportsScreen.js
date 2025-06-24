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
  const { activeProfile, profiles } = useProfile();
  
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
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      padding: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: theme.cardShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    summaryText: {
      fontSize: 16,
      color: theme.text,
      marginBottom: 8,
    },
    summaryAmount: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 12,
      marginTop: 16,
    },
    filterContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 16,
    },
    filterChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      marginRight: 8,
      marginBottom: 8,
    },
    filterChipSelected: {
      backgroundColor: theme.primary,
    },
    filterChipUnselected: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
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
    chartContainer: {
      alignItems: 'center',
      marginVertical: 16,
    },
    noDataContainer: {
      padding: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    noDataText: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: 12,
    },
    loadingContainer: {
      padding: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    errorText: {
      color: theme.error,
      textAlign: 'center',
      marginTop: 16,
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
