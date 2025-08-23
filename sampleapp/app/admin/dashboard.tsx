import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

const chartWidth = Dimensions.get('window').width - 32; // padding margins

export default function AdminDashboard() {
  const tableHeaders = ['Name', 'Email', 'Status', 'Last Active'];
  const placeholderRows = Array.from({ length: 5 }, (_, i) => i);

  const pieData = [
    {
      name: 'Active Users',
      population: 50,
      color: '#4CAF50',
      legendFontColor: '#333333',
      legendFontSize: 12,
    },
    {
      name: 'New Users',
      population: 30,
      color: '#2196F3',
      legendFontColor: '#333333',
      legendFontSize: 12,
    },
    {
      name: 'Dormant',
      population: 20,
      color: '#FFC107',
      legendFontColor: '#333333',
      legendFontSize: 12,
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>App Users</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeaderRow]}>
            {tableHeaders.map((header) => (
              <Text key={header} style={[styles.tableCell, styles.tableHeaderCell]}>
                {header}
              </Text>
            ))}
          </View>

          {placeholderRows.map((rowIndex) => (
            <View key={rowIndex} style={styles.tableRow}>
              <Text style={styles.tableCell}>—</Text>
              <Text style={styles.tableCell}>—</Text>
              <Text style={styles.tableCell}>—</Text>
              <Text style={styles.tableCell}>—</Text>
            </View>
          ))}

          <Text style={styles.emptyState}>No user records yet. Connect data to populate this table.</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Usage Overview</Text>
        <PieChart
          data={pieData}
          width={chartWidth}
          height={200}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="16"
          chartConfig={{
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            color: () => '#333333',
            labelColor: () => '#333333',
          }}
          hasLegend={true}
          center={[0, 0]}
        />

        <View style={styles.analysisBox}>
          <Text style={styles.analysisTitle}>Analysis</Text>
          <Text style={styles.analysisText}>
            Placeholder insights: majority are Active, with a notable share of New users.
            Dormant users may need re-engagement. Replace with real analytics once data is wired.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  table: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tableHeaderRow: {
    backgroundColor: '#f8fafc',
  },
  tableCell: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 14,
    color: '#374151',
  },
  tableHeaderCell: {
    fontWeight: '700',
    color: '#111827',
  },
  emptyState: {
    padding: 12,
    textAlign: 'center',
    color: '#6b7280',
  },
  analysisBox: {
    marginTop: 12,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
  },
  analysisTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  analysisText: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
  },
});