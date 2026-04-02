import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { ArrowDownRight, ArrowUpRight, CreditCard, RotateCcw } from 'lucide-react-native';
import { format, parseISO } from 'date-fns';
import { theme } from '../../theme/theme';
import { getPaymentHistory, type PaymentHistoryItem } from '../../api/paymentService';

const methodLabel = (method: string) => {
  if (method === 'KHALTI') return 'Khalti';
  if (method === 'ESEWA') return 'eSewa';
  return method;
};

const CustomerPayments = () => {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['paymentHistory'],
    queryFn: getPaymentHistory,
  });

  const transactions = data?.transactions ?? [];
  const totalSpent = data?.totalSpent ?? 0;
  const totalRefunded = data?.totalRefunded ?? 0;

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />}
    >
      {/* Header */}
      <View style={styles.headerSection}>
        <Text style={styles.title}>Payments</Text>
        <Text style={styles.subtitle}>Transaction history & refunds</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { marginRight: theme.spacing.md }]}>
          <View style={styles.statIconRow}>
            <CreditCard size={14} color={theme.colors.primary} />
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
          <Text style={styles.statValue}>Rs. {Number(totalSpent).toFixed(0)}</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIconRow}>
            <RotateCcw size={14} color={theme.colors.success} />
            <Text style={styles.statLabel}>Refunded</Text>
          </View>
          <Text style={[styles.statValue, { color: theme.colors.success }]}>
            Rs. {Number(totalRefunded).toFixed(0)}
          </Text>
        </View>
      </View>

      {/* Transaction List */}
      <View style={styles.listContainer}>
        {transactions.length === 0 ? (
          <View style={styles.empty}>
            <CreditCard size={40} color={theme.colors.muted} strokeWidth={1} />
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        ) : (
          transactions.map((t: PaymentHistoryItem) => {
            const isRefund = t.refundStatus === 'COMPLETED' && t.refundAmount && t.refundAmount > 0;
            const Icon = isRefund ? ArrowDownRight : ArrowUpRight;
            const iconBg = isRefund ? 'rgba(34,197,94,0.1)' : 'rgba(212,175,55,0.1)';
            const iconColor = isRefund ? theme.colors.success : theme.colors.primary;

            return (
              <View key={t.id} style={styles.card}>
                <View style={styles.cardRow}>
                  <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
                    <Icon size={16} color={iconColor} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardShop} numberOfLines={1}>
                      {t.shopName ?? 'Barbershop'}
                    </Text>
                    {t.services ? (
                      <Text style={styles.cardServices} numberOfLines={1}>{t.services}</Text>
                    ) : null}
                    <Text style={styles.cardDate}>
                      {t.paidAt ? format(parseISO(t.paidAt), 'MMM d, yyyy') : format(parseISO(t.createdAt), 'MMM d, yyyy')}
                      {' · '}{methodLabel(t.paymentMethod)}
                    </Text>
                  </View>
                  <View style={styles.amountCol}>
                    <Text style={styles.cardAmount}>Rs. {Number(t.amount).toFixed(0)}</Text>
                    {isRefund && (
                      <Text style={styles.refundAmount}>
                        +Rs. {Number(t.refundAmount).toFixed(0)} back
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, paddingBottom: 40 },
  headerSection: { marginBottom: theme.spacing.xl },
  title: { fontSize: 24, fontFamily: theme.fonts.serif, fontWeight: '700', color: theme.colors.text },
  subtitle: { fontSize: 14, color: theme.colors.muted, marginTop: 4 },

  statsGrid: { flexDirection: 'row', marginBottom: theme.spacing.xl },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
  },
  statIconRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  statLabel: { fontSize: 11, color: theme.colors.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue: { fontSize: 22, fontFamily: theme.fonts.serif, fontWeight: '700', color: theme.colors.text },

  listContainer: { gap: theme.spacing.sm },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { fontSize: 14, color: theme.colors.muted },

  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  iconBox: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1 },
  cardShop: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  cardServices: { fontSize: 12, color: theme.colors.muted, marginTop: 1 },
  cardDate: { fontSize: 11, color: theme.colors.muted, marginTop: 2 },
  amountCol: { alignItems: 'flex-end' },
  cardAmount: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
  refundAmount: { fontSize: 11, color: theme.colors.success, marginTop: 2 },
});

export default CustomerPayments;
