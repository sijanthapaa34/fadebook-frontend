// src/screens/customer/CustomerPaymentsScreen.tsx
import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import { DollarSign, ArrowDownRight, ArrowUpRight } from 'lucide-react-native';
import { theme } from '../../theme/theme';

const { width } = Dimensions.get('window');

// Mock Data
const transactions = [
  { id: '1', type: 'payment', desc: 'Premium Fade - The Gold Standard', amount: -45, date: '2026-02-13' },
  { id: '2', type: 'refund', desc: 'Refund - Classic Haircut (80%)', amount: 28, date: '2026-02-10' },
  { id: '3', type: 'payment', desc: 'Beard Trim - Crown & Blade', amount: -25, date: '2026-02-08' },
  { id: '4', type: 'payment', desc: 'Haircut + Beard Combo', amount: -55, date: '2026-02-05' },
];

const CustomerPayments = () => {
  const totalSpent = 370;
  const totalRefunds = 28;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.headerSection}>
        <Text style={styles.title}>Payments</Text>
        <Text style={styles.subtitle}>Transaction history and refunds</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { marginRight: theme.spacing.md }]}>
          <Text style={styles.statLabel}>Total Spent</Text>
          <Text style={styles.statValue}>${totalSpent}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Refunds</Text>
          <Text style={[styles.statValue, { color: theme.colors.success }]}>${totalRefunds}</Text>
        </View>
      </View>

      {/* Transactions List */}
      <View style={styles.listContainer}>
        {transactions.map((t) => {
          const isRefund = t.type === 'refund';
          const Icon = isRefund ? ArrowDownRight : ArrowUpRight;
          const iconBg = isRefund ? 'rgba(34, 197, 94, 0.1)' : 'rgba(212, 175, 55, 0.1)';
          const iconColor = isRefund ? theme.colors.success : theme.colors.primary;
          const amountColor = isRefund ? theme.colors.success : theme.colors.text;

          return (
            <View key={t.id} style={styles.transactionCard}>
              <View style={styles.transactionRow}>
                <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
                  <Icon size={16} color={iconColor} />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionDesc}>{t.desc}</Text>
                  <Text style={styles.transactionDate}>{t.date}</Text>
                </View>
                <Text style={[styles.transactionAmount, { color: amountColor }]}>
                  {t.amount > 0 ? '+' : ''}${Math.abs(t.amount)}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: 24,
    fontFamily: theme.fonts.serif,
    fontWeight: '700',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: theme.fonts.sans,
    color: theme.colors.muted,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: theme.fonts.sans,
    color: theme.colors.muted,
  },
  statValue: {
    fontSize: 24,
    fontFamily: theme.fonts.serif,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 4,
  },
  listContainer: {
    gap: theme.spacing.sm,
  },
  transactionCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDesc: {
    fontSize: 14,
    fontFamily: theme.fonts.sans,
    fontWeight: '500',
    color: theme.colors.text,
  },
  transactionDate: {
    fontSize: 12,
    fontFamily: theme.fonts.sans,
    color: theme.colors.muted,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 14,
    fontFamily: theme.fonts.sans,
    fontWeight: '600',
  },
});

export default CustomerPayments;