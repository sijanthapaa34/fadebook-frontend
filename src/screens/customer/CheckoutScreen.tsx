// src/screens/customer/CheckoutScreen.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Linking,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import { WebView } from 'react-native-webview'; 
import {
  ArrowLeft,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Loader2,
  Clock,
} from 'lucide-react-native';
import { theme } from '../../theme/theme';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { initiatePayment } from '../../api/paymentService';
import { InitiatePaymentRequest } from '../../models/models';
import api from '../../api/api'; 

type PaymentMethod = 'khalti' | 'esewa';
type CheckoutStep = 'method' | 'initiating' | 'redirected';

const { width } = Dimensions.get('window');

const METHODS = [
  {
    id: 'khalti' as PaymentMethod,
    label: 'Khalti',
    tagline: 'Pay with Khalti digital wallet',
    color: '#5C2D91',
    bg: 'rgba(92, 45, 145, 0.1)',
    logo: require('../../assets/khalti.png'),
  },
  {
    id: 'esewa' as PaymentMethod,
    label: 'eSewa',
    tagline: 'Pay with eSewa mobile wallet',
    color: '#60BB46',
    bg: 'rgba(96, 187, 70, 0.1)',
    logo: require('../../assets/esewa.png'),
  },
];

const steps: { key: CheckoutStep; label: string }[] = [
  { key: 'method', label: 'Method' },
  { key: 'initiating', label: 'Pay' },
  { key: 'redirected', label: 'Confirm' },
];

const StepBar = ({ current }: { current: CheckoutStep }) => {
  const currentIdx = steps.findIndex((s) => s.key === current);
  return (
    <View style={styles.stepBarContainer}>
      {steps.map((s, i) => (
        <View key={s.key} style={styles.stepWrapper}>
          <View
            style={[
              styles.stepCircle,
              i <= currentIdx ? styles.stepCircleActive : {},
            ]}
          >
            <Text
              style={[
                styles.stepNumber,
                i === currentIdx ? styles.stepNumberActive : {},
              ]}
            >
              {i + 1}
            </Text>
          </View>
          <Text
            style={[
              styles.stepLabel,
              i === currentIdx ? styles.stepLabelActive : {},
            ]}
          >
            {s.label}
          </Text>
          {i < steps.length - 1 && (
            <View
              style={[
                styles.stepLine,
                i < currentIdx ? styles.stepLineActive : {},
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );
};

const Checkout = () => {
  const route = useRoute();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();

  const {
    amount, shopName, serviceName, barberName, date, time,
    barberId, barbershopId, serviceIds, scheduledTime,
  } = (route.params as any) || {};

  const [step, setStep] = useState<CheckoutStep>('method');
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);
  
  // ✅ FIX: Add pidx state
  const [pidx, setPidx] = useState<string | null>(null);
  
  const [esewaPostHtml, setEsewaPostHtml] = useState<string | null>(null);

  const selectedMethod = METHODS.find((m) => m.id === method);
  const isProcessingRef = useRef(false);

  const { mutate: startPayment } = useMutation({
    mutationFn: () => {
      if (!barberId || !barbershopId || !serviceIds || !scheduledTime || !method) {
        return Promise.reject(new Error('Missing booking details'));
      }
      const payload: InitiatePaymentRequest = {
        barberId: Number(barberId),
        barbershopId: Number(barbershopId),
        serviceIds: Array.isArray(serviceIds) ? serviceIds.map((id: any) => Number(id)) : [Number(serviceIds)],
        scheduledTime,
        paymentMethod: method.toUpperCase() as 'KHALTI' | 'ESEWA',
      };
      return initiatePayment(payload);
    },
    onMutate: () => setStep('initiating'),
    onSuccess: (data) => {
      setTxId(data.transactionId?.toString() || null);
      
      if (data.paymentMethod === 'KHALTI' && data.pidx) {
        setPidx(data.pidx);
      }
      
      // ESEWA: Build HTML POST form
      if (data.paymentMethod === 'ESEWA' && data.formData) {
        const formFields = Object.entries(data.formData)
          .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}" />`)
          .join('\n          ');
        const html = `
          <!DOCTYPE html>
          <html>
          <body onload="document.getElementById('esewaForm').submit();" style="margin:0;padding:0;">
            <form id="esewaForm" method="POST" action="${data.paymentUrl}">
              ${formFields}
            </form>
          </body>
          </html>
        `;
        setEsewaPostHtml(html);
        setStep('redirected');
        return;
      }

      // KHALTI: Open browser
      setPaymentUrl(data.paymentUrl);
      setStep('redirected');
      setTimeout(() => {
        Linking.openURL(data.paymentUrl).catch(() => {
          Alert.alert('Error', 'Could not open Khalti. Make sure you have a browser installed.');
          setStep('method');
          isProcessingRef.current = false;
        });
        isProcessingRef.current = false;
      }, 800);
    },
    onError: (error: any) => {
      setStep('method');
      isProcessingRef.current = false;
      const message = error.response?.data?.message || error.message || 'Could not initiate payment.';
      if (message.includes('just taken') || message.includes('not available')) {
        Alert.alert('Slot Unavailable', 'This slot was just taken. Please select a different time.', [{ text: 'Go Back', onPress: () => navigation.goBack() }]);
      } else {
        Alert.alert('Payment Failed', message);
      }
    },
  });

  const handleCancelPayment = () => {
    if (txId) {
      api.post(`/payments/${txId}/cancel`).catch(() => {}); 
    }
    navigation.goBack();
  };

  const goBack = () => {
    if (step === 'method') {
      navigation.goBack();
    } else if (step === 'initiating') {
      return;
    } else if (step === 'redirected') {
      Alert.alert(
        'Cancel Payment?',
        'If you cancel, your slot reservation will be released immediately.',
        [
          { text: 'Keep Waiting', style: 'cancel' },
          { text: 'Cancel', style: 'destructive', onPress: handleCancelPayment },
        ],
        { cancelable: false }
      );
    }
  };

  const handlePay = () => {
    if (!method || isProcessingRef.current) return;
    isProcessingRef.current = true;
    startPayment();
  };

  const formatAmount = (val: number) => `Rs. ${val.toFixed(0)}`;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn}>
          <ArrowLeft size={18} color={theme.colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Checkout</Text>
          <Text style={styles.headerSubtitle}>Secure payment powered by FadeBook</Text>
        </View>
      </View>

      <StepBar current={step} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {step !== 'redirected' && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryService}>{serviceName}</Text>
              <Text style={styles.summaryAmount}>{formatAmount(amount)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryMeta}>{barberName} · {shopName}</Text>
              <Text style={styles.summaryMeta}>{date} {time}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>{formatAmount(amount)}</Text>
            </View>
          </View>
        )}

        {step === 'method' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Payment Method</Text>
            <Text style={styles.sectionSubtitle}>You will be redirected to complete payment securely</Text>
            <View style={styles.methodsList}>
              {METHODS.map((m) => (
                <TouchableOpacity key={m.id} style={[styles.methodCard, method === m.id && styles.methodCardActive]} onPress={() => setMethod(m.id)} activeOpacity={0.7}>
                  <View style={[styles.methodLogo, { backgroundColor: m.bg }]}>
                    <Image source={m.logo} style={styles.methodLogoImage} resizeMode="contain" />
                  </View>
                  <View style={styles.methodInfo}>
                    <Text style={styles.methodLabel}>{m.label}</Text>
                    <Text style={styles.methodTagline}>{m.tagline}</Text>
                  </View>
                  <View style={[styles.radioCircle, method === m.id && styles.radioCircleActive]}>
                    {method === m.id && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.trustBadges}>
              <View style={styles.badge}><ShieldCheck size={13} color={theme.colors.primary} /><Text style={styles.badgeText}>256-bit encrypted</Text></View>
              <View style={styles.badgeDivider} />
              <View style={styles.badge}><ShieldCheck size={13} color={theme.colors.primary} /><Text style={styles.badgeText}>Secure checkout</Text></View>
            </View>
            <TouchableOpacity style={[styles.primaryBtn, (!method || isProcessingRef.current) && styles.primaryBtnDisabled]} onPress={handlePay} disabled={!method || isProcessingRef.current}>
              {method ? (
                <><Text style={styles.primaryBtnText}>Pay {formatAmount(amount)} with {METHODS.find((m) => m.id === method)?.label}</Text><ChevronRight size={16} color="#000" /></>
              ) : (
                <Text style={styles.primaryBtnText}>Select a payment method</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {step === 'initiating' && (
          <View style={styles.section}>
            <View style={styles.processingContainer}>
              <View style={styles.processingSpinner}><Loader2 size={32} color={theme.colors.primary} strokeWidth={2} /></View>
              <Text style={styles.processingTitle}>Preparing Payment...</Text>
              <Text style={styles.processingSubtitle}>Reserving your slot and connecting to {selectedMethod?.label || 'payment gateway'}</Text>
              <View style={styles.processingSteps}>
                {['Reserving slot', 'Connecting to gateway', 'Redirecting'].map((label, i) => (
                  <View key={i} style={styles.processingStep}>
                    <View style={[styles.processingDot, i === 0 && styles.processingDotActive]} />
                    <Text style={[styles.processingStepText, i === 0 && styles.processingStepTextActive]}>{label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {step === 'redirected' && (
          <View style={styles.section}>
            
            {/* ESEWA: Render WebView to POST the form */}
            {method === 'esewa' && esewaPostHtml ? (
              <View style={styles.webviewContainer}>
                <View style={styles.webviewLoader}>
                  <Loader2 size={24} color={theme.colors.primary} strokeWidth={2} />
                  <Text style={styles.webviewLoaderText}>Connecting to eSewa...</Text>
                </View>
                <WebView source={{ html: esewaPostHtml }} javaScriptEnabled={true} onShouldStartLoadWithRequest={() => true} />
                <TouchableOpacity style={[styles.primaryBtn, { marginTop: theme.spacing.md }]} onPress={() => txId ? navigation.navigate('PaymentCallback', { txId, pidx: pidx } as any) : null}>
                  <Text style={styles.primaryBtnText}>I Have Completed Payment</Text>
                  <ChevronRight size={16} color="#000" />
                </TouchableOpacity>
              </View>
            ) : (
              /* KHALTI: Normal UI */
              <View style={styles.redirectedContainer}>
                <View style={[styles.redirectedIcon, { backgroundColor: selectedMethod?.bg }]}>
                  <Image source={selectedMethod?.logo} style={styles.redirectedLogo} resizeMode="contain" />
                </View>
                <Text style={styles.redirectedTitle}>Complete Payment on {selectedMethod?.label}</Text>
                <Text style={styles.redirectedSubtitle}>A browser tab has opened. Complete your payment there, then switch back here and click the button below.</Text>
                <View style={styles.amountCard}>
                  <Text style={styles.amountCardLabel}>Amount to Pay</Text>
                  <Text style={styles.amountCardValue}>{formatAmount(amount)}</Text>
                </View>
                <View style={styles.redirectedActions}>
                  <TouchableOpacity style={styles.secondaryBtn} onPress={() => paymentUrl && Linking.openURL(paymentUrl).catch(()=>{})}>
                    <ExternalLink size={14} color={theme.colors.text} />
                    <Text style={styles.secondaryBtnText}>Reopen Payment Page</Text>
                  </TouchableOpacity>
                  {/* ✅ FIX: Pass pidx to PaymentCallback */}
                  <TouchableOpacity 
                    style={[styles.primaryBtn, { marginTop: theme.spacing.md }]} 
                    onPress={() => {
                      if (txId) {
                        navigation.navigate('PaymentCallback', { 
                          txId, 
                          pidx: pidx || undefined  // ✅ PASS PIDX HERE
                        } as any);
                      }
                    }}
                  >
                    <Text style={styles.primaryBtnText}>I Have Completed Payment</Text>
                    <ChevronRight size={16} color="#000" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.ghostBtn} onPress={handleCancelPayment}>
                  <Text style={styles.ghostBtnText}>Cancel Payment</Text>
                </TouchableOpacity>
              </View>
            )}

            {method !== 'esewa' && (
              <View style={styles.timerBox}>
                <Clock size={12} color={theme.colors.muted} />
                <Text style={styles.timerText}>Your slot is reserved for 10 minutes. If payment is not completed, the slot will be released.</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: theme.spacing.lg, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md },
  backBtn: { padding: theme.spacing.sm, marginRight: theme.spacing.sm },
  headerTitle: { fontSize: 18, fontFamily: theme.fonts.serif, fontWeight: '700', color: theme.colors.text },
  headerSubtitle: { fontSize: 12, color: theme.colors.muted },
  stepBarContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.spacing.sm, marginBottom: theme.spacing.xl },
  stepWrapper: { flex: 1, alignItems: 'center', flexDirection: 'row' },
  stepCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' },
  stepCircleActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  stepNumber: { color: theme.colors.muted, fontSize: 12, fontWeight: '700' },
  stepNumberActive: { color: '#000' },
  stepLabel: { marginLeft: 6, fontSize: 10, color: theme.colors.muted },
  stepLabelActive: { color: theme.colors.text },
  stepLine: { flex: 1, height: 1, backgroundColor: theme.colors.border, marginHorizontal: 4 },
  stepLineActive: { backgroundColor: theme.colors.primary },
  card: { backgroundColor: theme.colors.card, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.lg, marginBottom: theme.spacing.md },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: theme.spacing.sm },
  cardLabel: { fontSize: 10, color: theme.colors.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: theme.spacing.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  summaryService: { color: theme.colors.muted, fontSize: 14, flex: 1, marginRight: 12 },
  summaryAmount: { fontWeight: '600', color: theme.colors.text },
  summaryMeta: { fontSize: 12, color: theme.colors.muted },
  totalLabel: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  totalAmount: { fontSize: 20, fontFamily: theme.fonts.serif, fontWeight: '700', color: theme.colors.primary },
  section: { marginTop: theme.spacing.sm },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
  sectionSubtitle: { fontSize: 12, color: theme.colors.muted, marginTop: 2 },
  methodsList: { gap: theme.spacing.md, marginTop: theme.spacing.md },
  methodCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.card, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.md },
  methodCardActive: { borderColor: theme.colors.primary, backgroundColor: 'rgba(212, 175, 55, 0.05)' },
  methodLogo: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  methodLogoImage: { width: 32, height: 32 },
  methodInfo: { flex: 1, marginLeft: theme.spacing.md },
  methodLabel: { fontWeight: '600', fontSize: 14, color: theme.colors.text },
  methodTagline: { fontSize: 12, color: theme.colors.muted, marginTop: 2 },
  radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' },
  radioCircleActive: { borderColor: theme.colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.primary },
  trustBadges: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: theme.spacing.lg, gap: theme.spacing.md },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  badgeText: { fontSize: 12, color: theme.colors.muted },
  badgeDivider: { width: 1, height: 12, backgroundColor: theme.colors.border },
  primaryBtn: { backgroundColor: theme.colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: theme.radius.md, marginTop: theme.spacing.lg },
  primaryBtnDisabled: { backgroundColor: theme.colors.muted },
  primaryBtnText: { color: '#000', fontWeight: '700', fontSize: 14 },
  secondaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  secondaryBtnText: { color: theme.colors.text, fontWeight: '600', fontSize: 13 },
  ghostBtn: { marginTop: theme.spacing.md, alignItems: 'center', paddingVertical: theme.spacing.sm },
  ghostBtnText: { color: theme.colors.muted, fontSize: 13 },
  processingContainer: { alignItems: 'center', paddingVertical: theme.spacing.xxl },
  processingSpinner: { marginBottom: theme.spacing.lg },
  processingTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text, marginBottom: theme.spacing.sm },
  processingSubtitle: { fontSize: 13, color: theme.colors.muted, textAlign: 'center', paddingHorizontal: theme.spacing.xl, marginBottom: theme.spacing.xl },
  processingSteps: { width: '100%', gap: theme.spacing.md },
  processingStep: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  processingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.border },
  processingDotActive: { backgroundColor: theme.colors.primary },
  processingStepText: { fontSize: 13, color: theme.colors.muted },
  processingStepTextActive: { color: theme.colors.text, fontWeight: '500' },
  redirectedContainer: { alignItems: 'center', paddingVertical: theme.spacing.lg },
  redirectedIcon: { width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.lg },
  redirectedLogo: { width: 40, height: 40 },
  redirectedTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text, marginBottom: theme.spacing.sm, textAlign: 'center' },
  redirectedSubtitle: { fontSize: 13, color: theme.colors.muted, textAlign: 'center', paddingHorizontal: theme.spacing.md, lineHeight: 20, marginBottom: theme.spacing.xl },
  amountCard: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(212, 175, 55, 0.08)', borderRadius: theme.radius.md, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.2)', padding: theme.spacing.lg, marginBottom: theme.spacing.xl },
  amountCardLabel: { fontSize: 14, color: theme.colors.muted },
  amountCardValue: { fontSize: 22, fontFamily: theme.fonts.serif, fontWeight: '700', color: theme.colors.primary },
  redirectedActions: { width: '100%', marginBottom: theme.spacing.md },
  timerBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.md, marginTop: theme.spacing.md },
  timerText: { fontSize: 12, color: theme.colors.muted, flex: 1, lineHeight: 18 },
  webviewContainer: { flex: 1, height: 500, borderRadius: theme.radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border },
  webviewLoader: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.9)', zIndex: 10 },
  webviewLoaderText: { marginTop: 10, fontSize: 14, color: theme.colors.muted },
});

export default Checkout;