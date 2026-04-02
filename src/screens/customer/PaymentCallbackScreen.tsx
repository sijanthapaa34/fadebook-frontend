// src/screens/customer/PaymentCallbackScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  RefreshCw,
  CalendarDays,
  User,
  Scissors,
  MapPin,
  CreditCard,
} from 'lucide-react-native';
import { format, parseISO } from 'date-fns';
import { theme } from '../../theme/theme';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { verifyPayment } from '../../api/paymentService';
import { VerifyPaymentResponse } from '../../models/models';

type CallbackStatus = 'verifying' | 'success' | 'failed';

const PaymentCallback = () => {
  const route = useRoute();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();

  // Parse callback params
  const params = (route.params as any) || {};
  const transactionId = params.txId ? Number(params.txId) : null;
  
  // ✅ FIX: Get pidx from params (passed from Checkout screen)
  const pidx = params.pidx || null;
  
  const refId = params.refId || null;
  const gatewayStatus = params.status || null;

  const [status, setStatus] = useState<CallbackStatus>('verifying');
  const [appointment, setAppointment] = useState<VerifyPaymentResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // ✅ FIX: Verify Payment Mutation - now passes pidx correctly
  const { mutate: doVerify } = useMutation({
    mutationFn: () => {
      if (!transactionId) {
        return Promise.reject(new Error('Missing transaction ID'));
      }

      // If eSewa returned failure in callback URL, skip verify
      if (gatewayStatus === 'failure') {
        return Promise.reject(
          new Error('Payment was cancelled or failed at the gateway.')
        );
      }

      // ✅ FIX: Pass pidx from state (not from URL)
      return verifyPayment({
        transactionId,
        pidx: pidx || undefined,
        refId: refId || undefined,
      });
    },

    onSuccess: (data: VerifyPaymentResponse) => {
      setAppointment(data);
      setStatus('success');
    },

    onError: (error: any) => {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Payment verification failed.';

      setErrorMessage(msg);
      setStatus('failed');

      if (msg.includes('expired') || msg.includes('timed out')) {
        setErrorMessage(
          'Your payment was verified but the reserved slot has expired. Please book again. Your payment will be refunded automatically.'
        );
      } else if (msg.includes('just taken') || msg.includes('taken by another')) {
        setErrorMessage(
          'The time slot was taken by another customer during payment. Your payment will be refunded automatically.'
        );
      } else if (msg.includes('verification failed')) {
        setErrorMessage(
          'Payment verification failed with the gateway. If you were charged, the amount will be refunded automatically within 2-3 business days.'
        );
      } else if (msg.includes('already processed')) {
        setStatus('success');
      }
    },
  });

  useEffect(() => {
    if (!transactionId) {
      setStatus('failed');
      setErrorMessage('Invalid callback: missing transaction ID.');
      return;
    }

    const timer = setTimeout(() => {
      doVerify();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const formatScheduledTime = (isoString: string) => {
    try {
      const dt = parseISO(isoString);
      return `${format(dt, 'EEE, MMM d')} at ${format(dt, 'h:mm a')}`;
    } catch {
      return isoString;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'KHALTI': return 'Khalti';
      case 'ESEWA': return 'eSewa';
      default: return method;
    }
  };

  const handleViewAppointments = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'CustomerAppointments' }],
    } as any);
  };

  const handleTryAgain = () => {
    navigation.goBack();
  };

  const handleGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'CustomerDashboard' }],
    } as any);
  };

  if (!transactionId) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorContainer}>
          <XCircle size={64} color={theme.colors.error} />
          <Text style={styles.errorTitle}>Invalid Callback</Text>
          <Text style={styles.errorSubtitle}>
            The payment callback is missing required information.
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleGoHome}>
            <Text style={styles.primaryBtnText}>Go Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {status === 'verifying' && (
        <View style={styles.centerContainer}>
          <View style={styles.verifyingSpinner}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
          <Text style={styles.verifyingTitle}>Verifying Payment...</Text>
          <Text style={styles.verifyingSubtitle}>
            Please wait while we confirm your payment with the gateway
          </Text>
          <Text style={styles.verifyingTxId}>
            Transaction #{transactionId}
          </Text>
        </View>
      )}

      {status === 'success' && (
        <View style={styles.scrollContainer}>
          <View style={styles.successHeader}>
            <View style={styles.successIconOuter}>
              <View style={styles.successIconInner}>
                <CheckCircle2 size={40} color={theme.colors.primary} />
              </View>
            </View>
            <Text style={styles.successTitle}>Payment Successful!</Text>
            <Text style={styles.successSubtitle}>
              Your appointment has been confirmed.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Booking Confirmation</Text>

            <View style={styles.detailRow}>
              <CalendarDays size={15} color={theme.colors.primary} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Date & Time</Text>
                <Text style={styles.detailValue}>
                  {appointment ? formatScheduledTime(appointment.scheduledTime) : 'Loading...'}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <User size={15} color={theme.colors.primary} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Barber</Text>
                <Text style={styles.detailValue}>
                  {appointment?.barberName || '—'}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Scissors size={15} color={theme.colors.primary} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Services</Text>
                <Text style={styles.detailValue}>
                  {appointment?.services?.map((s) => s.name).join(', ') || '—'}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <MapPin size={15} color={theme.colors.primary} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Barbershop</Text>
                <Text style={styles.detailValue}>
                  {appointment?.barbershopName || '—'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <CreditCard size={15} color={theme.colors.primary} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Paid Via</Text>
                <Text style={styles.detailValue}>
                  {appointment ? getPaymentMethodLabel(appointment.paymentMethod) : '—'}
                </Text>
              </View>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Paid</Text>
              <Text style={styles.totalAmount}>
                Rs. {appointment?.totalPrice?.toFixed(0) || '0'}
              </Text>
            </View>
          </View>

          <View style={styles.trustBadge}>
            <ShieldCheck size={14} color={theme.colors.primary} />
            <Text style={styles.trustText}>Transaction secured & encrypted</Text>
          </View>

          {appointment && appointment.totalPrice > 0 && (
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsBadgeText}>
                🎁 +{Math.floor(appointment.totalPrice / 100)} loyalty points earned!
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.primaryBtn} onPress={handleViewAppointments}>
            <Text style={styles.primaryBtnText}>View My Appointments</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.ghostBtn} onPress={handleGoHome}>
            <Text style={styles.ghostBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      )}

      {status === 'failed' && (
        <View style={styles.scrollContainer}>
          <View style={styles.errorHeader}>
            <XCircle size={64} color={theme.colors.error} />
            <Text style={styles.errorTitle}>Payment Failed</Text>
            <Text style={styles.errorSubtitle}>
              {errorMessage || 'We could not verify your payment.'}
            </Text>
          </View>

          <View style={[styles.card, styles.errorCard]}>
            <View style={styles.errorDetailRow}>
              <Text style={styles.errorDetailLabel}>Transaction ID</Text>
              <Text style={styles.errorDetailValue}>#{transactionId}</Text>
            </View>
            <View style={styles.errorDetailRow}>
              <Text style={styles.errorDetailLabel}>Gateway</Text>
              <Text style={styles.errorDetailValue}>
                {pidx ? 'Khalti' : refId ? 'eSewa' : 'Unknown'}
              </Text>
            </View>
          </View>

          {errorMessage?.includes('refund') && (
            <View style={styles.refundBox}>
              <Text style={styles.refundTitle}>About Refunds</Text>
              <Text style={styles.refundText}>
                If you were charged, the refund will be processed automatically within 2-3 business days.
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.primaryBtn} onPress={handleTryAgain}>
            <RefreshCw size={16} color="#000" />
            <Text style={styles.primaryBtnText}>Try Booking Again</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.ghostBtn} onPress={handleGoHome}>
            <Text style={styles.ghostBtnText}>Go Home</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: theme.spacing.xl },
  verifyingSpinner: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(212, 175, 55, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.xl },
  verifyingTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.text, marginBottom: theme.spacing.sm },
  verifyingSubtitle: { fontSize: 13, color: theme.colors.muted, textAlign: 'center', lineHeight: 20 },
  verifyingTxId: { fontSize: 12, color: theme.colors.muted, marginTop: theme.spacing.lg, fontFamily: 'monospace' },
  scrollContainer: { flex: 1, paddingHorizontal: theme.spacing.lg, paddingBottom: 40 },
  successHeader: { alignItems: 'center', paddingTop: theme.spacing.xxl, paddingBottom: theme.spacing.xl },
  successIconOuter: { width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(212, 175, 55, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.lg },
  successIconInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(212, 175, 55, 0.2)', alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontSize: 24, fontFamily: theme.fonts.serif, fontWeight: '700', color: theme.colors.text, marginBottom: 4 },
  successSubtitle: { fontSize: 14, color: theme.colors.muted },
  errorHeader: { alignItems: 'center', paddingTop: theme.spacing.xxl, paddingBottom: theme.spacing.xl },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: theme.spacing.xl },
  errorTitle: { fontSize: 22, fontWeight: '700', color: theme.colors.text, marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm },
  errorSubtitle: { fontSize: 13, color: theme.colors.muted, textAlign: 'center', lineHeight: 20, paddingHorizontal: theme.spacing.md },
  card: { backgroundColor: theme.colors.card, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.lg, marginBottom: theme.spacing.md },
  errorCard: { borderColor: 'rgba(239, 68, 68, 0.2)', backgroundColor: 'rgba(239, 68, 68, 0.03)' },
  cardLabel: { fontSize: 10, color: theme.colors.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: theme.spacing.md },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: theme.spacing.md },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.md, marginBottom: theme.spacing.md },
  detailContent: { flex: 1 },
  detailLabel: { fontSize: 11, color: theme.colors.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  detailValue: { fontSize: 14, color: theme.colors.text, fontWeight: '500', marginTop: 2 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: theme.spacing.sm },
  totalLabel: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  totalAmount: { fontSize: 20, fontFamily: theme.fonts.serif, fontWeight: '700', color: theme.colors.primary },
  errorDetailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm },
  errorDetailLabel: { fontSize: 13, color: theme.colors.muted },
  errorDetailValue: { fontSize: 13, color: theme.colors.text, fontWeight: '500' },
  refundBox: { backgroundColor: 'rgba(234, 179, 8, 0.08)', borderRadius: theme.radius.md, borderWidth: 1, borderColor: 'rgba(234, 179, 8, 0.2)', padding: theme.spacing.md, marginBottom: theme.spacing.lg },
  refundTitle: { fontSize: 13, fontWeight: '600', color: theme.colors.text, marginBottom: 4 },
  refundText: { fontSize: 12, color: theme.colors.muted, lineHeight: 18 },
  trustBadge: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginBottom: theme.spacing.xl },
  trustText: { fontSize: 12, color: theme.colors.muted },
  pointsBadge: {
    backgroundColor: `rgba(212,175,55,0.12)`,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
  },
  pointsBadgeText: { fontSize: 13, fontWeight: '700', color: '#b8860b' },
  primaryBtn: { backgroundColor: theme.colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: theme.radius.md },
  primaryBtnText: { color: '#000', fontWeight: '700', fontSize: 14 },
  ghostBtn: { marginTop: theme.spacing.md, alignItems: 'center', paddingVertical: theme.spacing.sm },
  ghostBtnText: { color: theme.colors.muted, fontSize: 13 },
});

export default PaymentCallback;