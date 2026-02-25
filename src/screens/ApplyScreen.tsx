// src/screens/ApplyScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Scissors, Store, CheckCircle, Upload, ArrowLeft } from 'lucide-react-native';
import { theme } from '../theme/theme';
import type { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type FormType = 'barber' | 'shop';

const Apply = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'Apply'>>();
  const insets = useSafeAreaInsets();
  
  const [formType, setFormType] = useState<FormType>(route.params?.type || 'barber');
  const [submitted, setSubmitted] = useState(false);

  // Barber form state
  const [bName, setBName] = useState('');
  const [bExp, setBExp] = useState('');
  const [bSpec, setBSpec] = useState('');
  const [bPhone, setBPhone] = useState('');
  const [bEmail, setBEmail] = useState('');
  const [bCity, setBCity] = useState('');
  const [bBio, setBBio] = useState('');
  
  // Shop form state
  const [sName, setSName] = useState('');
  const [sOwner, setSOwner] = useState('');
  const [sLocation, setSLocation] = useState('');
  const [sPhone, setSPhone] = useState('');
  const [sEmail, setSEmail] = useState('');
  const [sBarberCount, setSBarberCount] = useState('');
  const [sDesc, setSDesc] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (route.params?.type) {
      setFormType(route.params.type);
    }
  }, [route.params?.type]);

  // --- Validation ---
  const validateBarber = () => {
    const errs: Record<string, string> = {};
    if (!bName.trim()) errs.bName = 'Required';
    if (!bExp.trim()) errs.bExp = 'Required';
    if (!bSpec.trim()) errs.bSpec = 'Required';
    if (!bPhone.trim()) errs.bPhone = 'Required';
    if (!bEmail.trim() || !/\S+@\S+\.\S+/.test(bEmail)) errs.bEmail = 'Valid email required';
    if (!bCity.trim()) errs.bCity = 'Required';
    if (!bBio.trim()) errs.bBio = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateShop = () => {
    const errs: Record<string, string> = {};
    if (!sName.trim()) errs.sName = 'Required';
    if (!sOwner.trim()) errs.sOwner = 'Required';
    if (!sLocation.trim()) errs.sLocation = 'Required';
    if (!sPhone.trim()) errs.sPhone = 'Required';
    if (!sEmail.trim() || !/\S+@\S+\.\S+/.test(sEmail)) errs.sEmail = 'Valid email required';
    if (!sBarberCount.trim()) errs.sBarberCount = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    const valid = formType === 'barber' ? validateBarber() : validateShop();
    if (!valid) return;
    console.log(`${formType} application submitted`);
    setSubmitted(true);
  };

  // --- Success State ---
  if (submitted) {
    return (
      <View style={[styles.centeredContainer, { paddingTop: insets.top }]}>
        <View style={styles.glassCard}>
          <CheckCircle size={48} color={theme.colors.primary} />
          <Text style={styles.successTitle}>Application Submitted!</Text>
          <Text style={styles.successText}>
            Thank you for applying. Our team will review your application and get back to you within 24–48 hours.
          </Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Status: Pending Review</Text>
          </View>
          <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('Landing')}>
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={20} color={theme.colors.text} />
          </TouchableOpacity>
          
          <Text style={styles.logoText}>FadeBook</Text>
          
          <Text style={styles.title}>
            Join <Text style={styles.goldText}>FadeBook</Text>
          </Text>
          <Text style={styles.subtitle}>Apply as a barber or register your barbershop</Text>
        </View>

        {/* Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            onPress={() => { setFormType('barber'); setErrors({}); }}
            style={[styles.toggleBtn, formType === 'barber' && styles.toggleBtnActive]}
          >
            <Scissors size={18} color={formType === 'barber' ? theme.colors.primary : theme.colors.muted} />
            <Text style={[styles.toggleText, formType === 'barber' && styles.toggleTextActive]}>
              Become a Barber
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => { setFormType('shop'); setErrors({}); }}
            style={[styles.toggleBtn, formType === 'shop' && styles.toggleBtnActive]}
          >
            <Store size={18} color={formType === 'shop' ? theme.colors.primary : theme.colors.muted} />
            <Text style={[styles.toggleText, formType === 'shop' && styles.toggleTextActive]}>
              Register a Shop
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.formCard}>
          {formType === 'barber' ? (
            <>
              <Text style={styles.formTitle}>Barber Application</Text>
              
              <Field label="Full Name" value={bName} onChange={setBName} error={errors.bName} required />
              
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Field label="Years of Exp." value={bExp} onChange={setBExp} error={errors.bExp} keyboardType="number-pad" required />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="City" value={bCity} onChange={setBCity} error={errors.bCity} required />
                </View>
              </View>

              <Field label="Specialization" value={bSpec} onChange={setBSpec} error={errors.bSpec} placeholder="e.g. Fades, Beard Trim" required />
              
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Field label="Phone" value={bPhone} onChange={setBPhone} error={errors.bPhone} keyboardType="phone-pad" required />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="Email" value={bEmail} onChange={setBEmail} error={errors.bEmail} keyboardType="email-address" autoCapitalize="none" required />
                </View>
              </View>

              <TextAreaField label="Short Bio" value={bBio} onChange={setBBio} error={errors.bBio} placeholder="Tell us about yourself..." required />

              <PhotoUploadField label="Portfolio Images" required />
              <PhotoUploadField label="License / Certification (Optional)" />
            </>
          ) : (
            <>
              <Text style={styles.formTitle}>Barbershop Registration</Text>
              
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Field label="Shop Name" value={sName} onChange={setSName} error={errors.sName} required />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="Owner Name" value={sOwner} onChange={setSOwner} error={errors.sOwner} required />
                </View>
              </View>

              <Field label="Location / Address" value={sLocation} onChange={setSLocation} error={errors.sLocation} placeholder="Full address" required />
              
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Field label="Contact Number" value={sPhone} onChange={setSPhone} error={errors.sPhone} keyboardType="phone-pad" required />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="Email" value={sEmail} onChange={setSEmail} error={errors.sEmail} keyboardType="email-address" autoCapitalize="none" required />
                </View>
              </View>

              <Field label="Number of Barbers" value={sBarberCount} onChange={setSBarberCount} error={errors.sBarberCount} keyboardType="number-pad" required />

              <TextAreaField label="Description" value={sDesc} onChange={setSDesc} placeholder="Tell us about your shop..." />

              <PhotoUploadField label="Shop Photos" required />
              <PhotoUploadField label="Business Document (Optional)" />
            </>
          )}

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitBtnText}>Submit Application</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.loginText}>
            Want to book instead? <Text style={styles.linkHighlight}>Create a customer account</Text>
          </Text>
        </TouchableOpacity>
        
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// --- Reusable Components ---

const Field = ({ label, value, onChange, error, required, ...props }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  keyboardType?: 'default' | 'number-pad' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words';
}) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.label}>
      {label} {required && <Text style={styles.required}>*</Text>}
    </Text>
    <TextInput
      style={[styles.input, error && styles.inputError]}
      value={value}
      onChangeText={onChange}
      placeholderTextColor={theme.colors.placeholder}
      {...props}
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const TextAreaField = ({ label, value, onChange, error, placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void; error?: string; placeholder?: string; required?: boolean;
}) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.label}>
      {label} {required && <Text style={styles.required}>*</Text>}
    </Text>
    <TextInput
      style={[styles.input, styles.textArea, error && styles.inputError]}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.placeholder}
      multiline
      numberOfLines={4}
      textAlignVertical="top"
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const PhotoUploadField = ({ label, required }: { label: string; required?: boolean }) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.label}>
      {label} {required && <Text style={styles.required}>*</Text>}
    </Text>
    <TouchableOpacity 
      style={styles.uploadBox} 
      onPress={() => Alert.alert('Upload', 'Image picker functionality would go here.')}
    >
      <Upload size={24} color={theme.colors.primary} />
      <Text style={styles.uploadText}>Tap to upload images</Text>
    </TouchableOpacity>
  </View>
);

// --- Styles ---

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
    // paddingTop is now set dynamically via insets.top + 16
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  backBtn: {
    position: 'absolute', 
    left: 0, 
    top: 0, 
    padding: 8,
  },
  logoText: {
    fontSize: 24,
    fontFamily: theme.fonts.serif,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 28,
    fontFamily: theme.fonts.serif,
    fontWeight: '700',
    color: theme.colors.text,
  },
  goldText: {
    color: theme.colors.primary,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.muted,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  toggleBtnActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderColor: theme.colors.primary,
  },
  toggleText: {
    color: theme.colors.muted,
    fontWeight: '500',
  },
  toggleTextActive: {
    color: theme.colors.primary,
  },
  formCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  formTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.serif,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fieldContainer: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 12,
    color: theme.colors.muted,
    marginBottom: 6,
    fontWeight: '500',
  },
  required: {
    color: theme.colors.error,
  },
  input: {
    backgroundColor: 'rgba(39, 39, 42, 0.3)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 14,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  textArea: {
    minHeight: 100,
    paddingTop: theme.spacing.md,
  },
  uploadBox: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    borderRadius: theme.radius.md,
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(39, 39, 42, 0.2)',
  },
  uploadText: {
    color: theme.colors.primary,
    marginTop: theme.spacing.sm,
    fontSize: 12,
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  submitBtnText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
  },
  loginLink: {
    alignItems: 'center',
  },
  loginText: {
    color: theme.colors.muted,
    fontSize: 13,
  },
  linkHighlight: {
    color: theme.colors.primary,
  },
  // Success Styles
  glassCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 22,
    fontFamily: theme.fonts.serif,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  successText: {
    color: theme.colors.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  statusBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  homeButton: {
    marginTop: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: theme.radius.md,
  },
  homeButtonText: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 11,
    marginTop: 4,
  },
});

export default Apply;