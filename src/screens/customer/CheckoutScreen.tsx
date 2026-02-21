// src/screens/customer/CheckoutScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions, TextInput, Animated, KeyboardAvoidingView, Platform, Alert, Image, // <--- ADD Image
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // ✅ FIX: Import
import { ArrowLeft, ShieldCheck, CheckCircle2, Loader2, Phone, Lock, ChevronRight, AlertCircle } from 'lucide-react-native';
import { theme } from '../../theme/theme';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type PaymentMethod = 'khalti' | 'esewa';
type CheckoutStep = 'method' | 'details' | 'otp' | 'success';

const { width } = Dimensions.get('window');

/* ─── Payment Methods Config ─── */
/* ─── Payment Methods Config ─── */
const METHODS = [
  {
    id: 'khalti' as PaymentMethod,
    label: 'Khalti',
    tagline: 'Pay with Khalti digital wallet',
    color: '#5C2D91',
    bg: 'rgba(92, 45, 145, 0.1)',
    // ✅ FIX: Use require() for local images
    // Make sure you actually have this file in your project at this location
    logo: require('../../assets/khalti.png'), 
  },
  {
    id: 'esewa' as PaymentMethod,
    label: 'eSewa',
    tagline: 'Pay with eSewa mobile wallet',
    color: '#60BB46',
    bg: 'rgba(96, 187, 70, 0.1)',
    // ✅ FIX: Use require()
    logo: require('../../assets/esewa.png'),
  },
];

/* ─── OTP Input Component ─── */
const OTP_LEN = 6;

const OTPInput = ({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) => {
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, i: number) => {
    if (text.length > 1) return; 
    const newValue = value.split('');
    newValue[i] = text;
    const finalValue = newValue.join('').replace(/ /g, '');
    onChange(finalValue);
    if (text && i < OTP_LEN - 1) {
      inputs.current[i + 1]?.focus();
    }
  };

  const handleKey = (key: string, i: number) => {
    if (key === 'Backspace' && !value[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  return (
    <View style={styles.otpContainer}>
      <View style={styles.otpRow}>
        {Array.from({ length: OTP_LEN }).map((_, i) => (
          <TextInput
            key={i}
            ref={(el) => { inputs.current[i] = el; }}
            style={[
              styles.otpInput,
              value[i] ? styles.otpInputFilled : {},
              error ? styles.otpInputError : {},
            ]}
            value={value[i] || ''}
            onChangeText={(text) => handleChange(text, i)}
            onKeyPress={({ nativeEvent }) => handleKey(nativeEvent.key, i)}
            keyboardType="number-pad"
            maxLength={1}
            selectionColor={theme.colors.primary}
            textContentType="oneTimeCode"
          />
        ))}
      </View>
      {error && (
        <View style={styles.errorRow}>
          <AlertCircle size={12} color={theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

/* ─── Step Bar ─── */
const steps: { key: CheckoutStep; label: string }[] = [
  { key: 'method', label: 'Method' },
  { key: 'details', label: 'Details' },
  { key: 'otp', label: 'Verify' },
  { key: 'success', label: 'Done' },
];

const StepBar = ({ current }: { current: CheckoutStep }) => {
  const currentIdx = steps.findIndex((s) => s.key === current);
  return (
    <View style={styles.stepBarContainer}>
      {steps.map((s, i) => (
        <View key={s.key} style={styles.stepWrapper}>
          <View style={[styles.stepCircle, i <= currentIdx ? styles.stepCircleActive : {}]}>
            {i < currentIdx ? (
              <CheckCircle2 size={14} color="#000" />
            ) : (
              <Text style={[styles.stepNumber, i === currentIdx ? styles.stepNumberActive : {}]}>{i + 1}</Text>
            )}
          </View>
          <Text style={[styles.stepLabel, i === currentIdx ? styles.stepLabelActive : {}]}>{s.label}</Text>
          {i < steps.length - 1 && (
            <View style={[styles.stepLine, i < currentIdx ? styles.stepLineActive : {}]} />
          )}
        </View>
      ))}
    </View>
  );
};

/* ─── Main Component ─── */
const CheckoutScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets(); // ✅ FIX: Get insets
  
  // Params
  const { 
    amount = 45, 
    shopName = 'The Gold Standard', 
    serviceName = 'Premium Fade', 
    barberName = 'Marcus B.', 
    date = 'Today', 
    time = '10:00 AM' 
  } = (route.params as any) || {};

  const [step, setStep] = useState<CheckoutStep>('method');
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCount, setResendCount] = useState(60);
  const [resendActive, setResendActive] = useState(false);
  
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const selectedMethod = METHODS.find((m) => m.id === method);

  /* Resend Countdown */
  useEffect(() => {
    if (step !== 'otp') return;
    setResendCount(60);
    setResendActive(false);
    const interval = setInterval(() => {
      setResendCount((c) => {
        if (c <= 1) {
          clearInterval(interval);
          setResendActive(true);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  /* Success Animation */
  useEffect(() => {
    if (step === 'success') {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }).start();
    }
  }, [step]);

  /* Handlers */
  const goBack = () => {
    if (step === 'method') navigation.goBack();
    else if (step === 'details') setStep('method');
    else if (step === 'otp') { setStep('details'); setOtp(''); setOtpError(''); }
  };

  const validatePhone = () => {
    const cleaned = phone.replace(/\D/g, '');
    if (!cleaned) { setPhoneError('Phone number is required'); return false; }
    if (cleaned.length < 10) { setPhoneError('Enter a valid 10-digit phone number'); return false; }
    setPhoneError('');
    return true;
  };

  const handleSendOTP = async () => {
    if (!validatePhone()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 1500);
  };

  const handleVerifyOTP = async () => {
    if (otp.length < OTP_LEN) { setOtpError('Enter the 6-digit OTP'); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('success');
    }, 1800);
  };

  const handleResend = () => {
    if (!resendActive) return;
    setOtp('');
    setOtpError('');
    setResendActive(false);
    setResendCount(60);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <ScrollView 
        contentContainerStyle={[
          styles.container, 
          { paddingTop: insets.top + theme.spacing.lg } 
        ]}
      >
        {/* Header */}
        {step !== 'success' && (
          <View style={styles.header}>
            <TouchableOpacity onPress={goBack} style={styles.backBtn}>
              <ArrowLeft size={18} color={theme.colors.text} />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Checkout</Text>
              <Text style={styles.headerSubtitle}>Secure payment powered by FadeBook</Text>
            </View>
          </View>
        )}

        {/* Step Bar */}
        {step !== 'success' && <StepBar current={step} />}

        {/* Order Summary */}
        {step !== 'success' && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryService}>{serviceName}</Text>
              <Text style={styles.summaryAmount}>${amount}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryMeta}>{barberName} · {shopName}</Text>
              <Text style={styles.summaryMeta}>{date} {time}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>${amount}</Text>
            </View>
          </View>
        )}

        {/* ── STEP: METHOD ── */}
        {step === 'method' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Payment Method</Text>
            <Text style={styles.sectionSubtitle}>Choose your preferred digital wallet</Text>

            <View style={styles.methodsList}>
              {METHODS.map((m) => (
                <TouchableOpacity
                    key={m.id}
                    style={[styles.methodCard, method === m.id && styles.methodCardActive]}
                    onPress={() => setMethod(m.id)}
                    activeOpacity={0.7}
                    >
                    <View style={[styles.methodLogo, { backgroundColor: m.bg }]}>
                        {/* ✅ FIX: Render Image instead of Text */}
                        <Image 
                        source={m.logo} 
                        style={styles.methodLogoImage} 
                        resizeMode="contain"
                        />
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
              <View style={styles.badge}>
                <ShieldCheck size={13} color={theme.colors.primary} />
                <Text style={styles.badgeText}>256-bit encrypted</Text>
              </View>
              <View style={styles.badgeDivider} />
              <View style={styles.badge}>
                <Lock size={13} color={theme.colors.primary} />
                <Text style={styles.badgeText}>Secure checkout</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.primaryBtn, !method && styles.primaryBtnDisabled]} 
              onPress={() => setStep('details')}
              disabled={!method}
            >
              <Text style={styles.primaryBtnText}>Continue</Text>
              <ChevronRight size={16} color="#000" />
            </TouchableOpacity>
          </View>
        )}

        {/* ── STEP: DETAILS ── */}
        {step === 'details' && selectedMethod && (
          <View style={styles.section}>
            <View style={styles.detailHeader}>
              <View style={[styles.methodLogo, { backgroundColor: selectedMethod.bg }]}>
                    <Image 
                    source={selectedMethod.logo} 
                    style={styles.methodLogoImage} 
                    resizeMode="contain"
                    />
                </View>
              <View>
                <Text style={styles.sectionTitle}>Pay with {selectedMethod.label}</Text>
                <Text style={styles.sectionSubtitle}>Enter your registered phone number</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{selectedMethod.label} Phone Number</Text>
              <View style={styles.inputWrapper}>
                <Phone size={15} color={theme.colors.muted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, phoneError && styles.textInputError]}
                  placeholder="98XXXXXXXX"
                  placeholderTextColor={theme.colors.placeholder}
                  value={phone}
                  onChangeText={(t) => { setPhone(t); setPhoneError(''); }}
                  keyboardType="number-pad"
                  maxLength={13}
                />
              </View>
              {phoneError ? (
                <View style={styles.errorRow}>
                  <AlertCircle size={12} color={theme.colors.error} />
                  <Text style={styles.errorText}>{phoneError}</Text>
                </View>
              ) : (
                <Text style={styles.inputHint}>An OTP will be sent to this number for verification</Text>
              )}
            </View>

            <View style={styles.amountReminder}>
              <Text style={styles.amountLabel}>Amount to Pay</Text>
              <Text style={styles.amountValue}>${amount}</Text>
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleSendOTP} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <Text style={styles.primaryBtnText}>Send OTP</Text>
                  <ChevronRight size={16} color="#000" />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ── STEP: OTP ── */}
        {step === 'otp' && selectedMethod && (
          <View style={styles.section}>
            <View style={styles.otpHeader}>
              <View style={[styles.methodLogoLarge, { backgroundColor: selectedMethod.bg }]}>
                <Text style={{ fontSize: 32 }}>{selectedMethod.logo}</Text>
              </View>
              <Text style={styles.sectionTitle}>Enter Verification Code</Text>
              <Text style={styles.otpSubtitle}>
                We sent a 6-digit OTP to{' '}
                <Text style={{ fontWeight: '600', color: theme.colors.text }}>{phone}</Text>
                <Text onPress={() => { setStep('details'); setOtp(''); }} style={styles.editLink}> Edit</Text>
              </Text>
            </View>

            <OTPInput value={otp} onChange={setOtp} error={otpError} />

            <View style={styles.resendRow}>
              <Text style={styles.resendText}>
                Didn't receive it?{' '}
                <Text 
                  style={[styles.resendLink, !resendActive && styles.resendLinkDisabled]} 
                  onPress={handleResend}
                >
                  {resendActive ? 'Resend OTP' : `Resend in ${resendCount}s`}
                </Text>
              </Text>
            </View>

            <View style={styles.amountReminder}>
              <Text style={styles.amountLabel}>Confirming payment of</Text>
              <Text style={styles.amountValue}>${amount}</Text>
            </View>

            <TouchableOpacity 
              style={[styles.primaryBtn, (loading || otp.length < OTP_LEN) && styles.primaryBtnDisabled]} 
              onPress={handleVerifyOTP} 
              disabled={loading || otp.length < OTP_LEN}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <Text style={styles.primaryBtnText}>Confirm Payment</Text>
                  <ShieldCheck size={15} color="#000" />
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.demoText}>Demo: enter any 6 digits to complete</Text>
          </View>
        )}

        {/* ── STEP: SUCCESS ── */}
        {step === 'success' && (
          <View style={styles.successContainer}>
            <Animated.View style={[styles.successIconWrap, { transform: [{ scale: scaleAnim }] }]}>
              <View style={styles.successIconOuter}>
                <View style={styles.successIconInner}>
                  <CheckCircle2 size={40} color={theme.colors.primary} />
                </View>
              </View>
            </Animated.View>

            <Text style={styles.successTitle}>Payment Successful!</Text>
            <Text style={styles.successSubtitle}>Your appointment is confirmed.</Text>

            <View style={[styles.card, { width: '100%' }]}>
              <Text style={styles.receiptLabel}>Receipt</Text>
              {[
                { label: 'Service', value: serviceName },
                { label: 'Barber', value: barberName },
                { label: 'Shop', value: shopName },
                { label: 'Date & Time', value: `${date} · ${time}` },
                { label: 'Paid via', value: selectedMethod?.label ?? '' },
                { label: 'Phone', value: phone },
              ].map(({ label, value }) => (
                <View key={label} style={styles.receiptRow}>
                  <Text style={styles.receiptKey}>{label}</Text>
                  <Text style={styles.receiptVal}>{value}</Text>
                </View>
              ))}
              <View style={styles.divider} />
              <View style={styles.receiptRow}>
                <Text style={styles.totalLabel}>Total Paid</Text>
                <Text style={styles.totalAmount}>${amount}</Text>
              </View>
            </View>

            <View style={styles.trustBadges}>
              <ShieldCheck size={13} color={theme.colors.primary} />
              <Text style={styles.badgeText}>Transaction secured & encrypted</Text>
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('CustomerAppointments')}>
              <Text style={styles.primaryBtnText}>View My Appointments</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.ghostBtn} onPress={() => navigation.navigate('CustomerPayments')}>
              <Text style={styles.ghostBtnText}>Payment History</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 40,
  },
  // Header
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.lg },
  backBtn: { padding: theme.spacing.sm, marginRight: theme.spacing.sm },
  headerTitle: { fontSize: 18, fontFamily: theme.fonts.serif, fontWeight: '700', color: theme.colors.text },
  headerSubtitle: { fontSize: 12, color: theme.colors.muted },
  
  // StepBar
  stepBarContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.xl },
  stepWrapper: { flex: 1, alignItems: 'center', flexDirection: 'row' },
  stepCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' },
  stepCircleActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  stepNumber: { color: theme.colors.muted, fontSize: 12, fontWeight: '700' },
  stepNumberActive: { color: '#000' },
  stepLabel: { marginLeft: 6, fontSize: 10, color: theme.colors.muted, display: 'none' },
  stepLabelActive: { color: theme.colors.text, display: 'flex' },
  stepLine: { flex: 1, height: 1, backgroundColor: theme.colors.border, marginHorizontal: 4 },
  stepLineActive: { backgroundColor: theme.colors.primary },

  // Card & Common
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: theme.spacing.sm },
  
  // Summary
  cardLabel: { fontSize: 10, color: theme.colors.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: theme.spacing.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  summaryService: { color: theme.colors.muted, fontSize: 14 },
  summaryAmount: { fontWeight: '600', color: theme.colors.text },
  summaryMeta: { fontSize: 12, color: theme.colors.muted },
  totalLabel: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  totalAmount: { fontSize: 20, fontFamily: theme.fonts.serif, fontWeight: '700', color: theme.colors.primary },

  // Sections
  section: { marginTop: theme.spacing.sm },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
  sectionSubtitle: { fontSize: 12, color: theme.colors.muted, marginTop: 2 },

  // Methods
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

  // Trust Badges
  trustBadges: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: theme.spacing.lg, gap: theme.spacing.md },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  badgeText: { fontSize: 12, color: theme.colors.muted },
  badgeDivider: { width: 1, height: 12, backgroundColor: theme.colors.border },

  // Buttons
  primaryBtn: { backgroundColor: theme.colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: theme.radius.md, marginTop: theme.spacing.lg },
  primaryBtnDisabled: { backgroundColor: theme.colors.muted },
  primaryBtnText: { color: '#000', fontWeight: '700', fontSize: 14 },
  ghostBtn: { marginTop: theme.spacing.md, alignItems: 'center' },
  ghostBtnText: { color: theme.colors.text, fontWeight: '600' },

  // Inputs
  inputGroup: { marginTop: theme.spacing.lg },
  inputLabel: { fontSize: 12, color: theme.colors.muted, textTransform: 'uppercase', letterSpacing: 1 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, marginTop: theme.spacing.sm },
  inputIcon: { position: 'absolute', left: 12 },
  textInput: { flex: 1, paddingVertical: theme.spacing.md, paddingLeft: 40, paddingRight: theme.spacing.md, color: theme.colors.text, fontSize: 14 },
  textInputError: { borderColor: theme.colors.error },
  inputHint: { fontSize: 12, color: theme.colors.muted, marginTop: 4 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  errorText: { color: theme.colors.error, fontSize: 12 },

  // Details
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.xl },
  amountReminder: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.card, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.lg, marginTop: theme.spacing.lg },
  amountLabel: { fontSize: 14, color: theme.colors.muted },
  amountValue: { fontSize: 20, fontFamily: theme.fonts.serif, fontWeight: '700', color: theme.colors.primary },

  // OTP
  otpHeader: { alignItems: 'center', marginBottom: theme.spacing.xl },
  methodLogoLarge: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.md },
  otpSubtitle: { fontSize: 12, color: theme.colors.muted, textAlign: 'center', marginTop: 4 },
  editLink: { color: theme.colors.primary, fontWeight: '600' },
  otpContainer: { alignItems: 'center' },
  otpRow: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  otpInput: { width: 44, height: 52, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
  otpInputFilled: { borderColor: theme.colors.primary },
  otpInputError: { borderColor: theme.colors.error },
  resendRow: { marginTop: theme.spacing.lg },
  resendText: { fontSize: 12, color: theme.colors.muted },
  resendLink: { color: theme.colors.primary, fontWeight: '600' },
  resendLinkDisabled: { color: theme.colors.muted },
  demoText: { textAlign: 'center', color: theme.colors.muted, fontSize: 12, marginTop: theme.spacing.md },

  // Success
  successContainer: { alignItems: 'center', paddingTop: 20 },
  successIconWrap: { marginBottom: theme.spacing.xl },
  successIconOuter: { width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(212, 175, 55, 0.1)', alignItems: 'center', justifyContent: 'center' },
  successIconInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(212, 175, 55, 0.2)', alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontSize: 24, fontFamily: theme.fonts.serif, fontWeight: '700', color: theme.colors.text, marginBottom: 4 },
  successSubtitle: { fontSize: 14, color: theme.colors.muted, marginBottom: theme.spacing.xl },
  receiptLabel: { fontSize: 10, color: theme.colors.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: theme.spacing.md },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  receiptKey: { fontSize: 12, color: theme.colors.muted },
  receiptVal: { fontSize: 12, fontWeight: '500', color: theme.colors.text, maxWidth: '55%', textAlign: 'right' },
});

export default CheckoutScreen;