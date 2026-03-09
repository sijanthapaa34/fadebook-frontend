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
import { submitApplication } from '../api/applicationService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type FormType = 'barber' | 'shop';

const Apply = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'Apply'>>();
  const insets = useSafeAreaInsets();
  
  const [formType, setFormType] = useState<FormType>(route.params?.type || 'barber');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Common
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  // Barber Specific
  const [bCity, setBCity] = useState('');
  const [bExp, setBExp] = useState('');
  const [bSkills, setBSkills] = useState(''); // Comma separated
  const [bBio, setBBio] = useState('');
  const [bProfilePic, setBProfilePic] = useState('');
  const [bLicense, setBLicense] = useState('');
  
  // Shop Specific
  const [sShopName, setSShopName] = useState('');
  const [sAddress, setSAddress] = useState('');
  const [sCity, setSCity] = useState('');
  const [sState, setSState] = useState('');
  const [sPostal, setSPostal] = useState('');
  const [sLat, setSLat] = useState('');
  const [sLong, setSLong] = useState('');
  const [sWebsite, setSWebsite] = useState('');
  const [sHours, setSHours] = useState('');
  const [sDesc, setSDesc] = useState('');
  const [sDoc, setSDoc] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (route.params?.type) {
      setFormType(route.params.type);
    }
  }, [route.params?.type]);

  // --- Validation ---
  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name required';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) errs.email = 'Valid email required';
    if (!password.trim() || password.length < 6) errs.password = 'Min 6 characters required';
    if (!phone.trim()) errs.phone = 'Phone required';

    if (formType === 'barber') {
      if (!bCity.trim()) errs.bCity = 'City required';
      if (!bExp.trim()) errs.bExp = 'Experience required';
      if (!bBio.trim()) errs.bBio = 'Bio required';
    } else {
      if (!sShopName.trim()) errs.sShopName = 'Shop name required';
      if (!sAddress.trim()) errs.sAddress = 'Address required';
      if (!sCity.trim()) errs.sCity = 'City required';
      if (!sLat.trim() || !sLong.trim()) errs.location = 'Coordinates required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const commonData = {
        name,
        email,
        password,
        phone,
      };

      if (formType === 'barber') {
        // 1. Clean skills array
        const skillsArray = bSkills 
          ? bSkills.split(',').map(s => s.trim()).filter(s => s !== '') 
          : [];

        await submitApplication({
          ...commonData,
          type: 'BARBER',
          city: bCity,
          experienceYears: parseInt(bExp) || 0,
          skills: skillsArray,
          bio: bBio,
          profilePictureUrl: bProfilePic,
          licenseUrl: bLicense
        });
      } else {
        // 2. Parse Coordinates to Numbers (Required for BigDecimal)
        const lat = parseFloat(sLat);
        const long = parseFloat(sLong);

        if (isNaN(lat) || isNaN(long)) {
          Alert.alert('Error', 'Please enter valid coordinates');
          setLoading(false);
          return;
        }

        await submitApplication({
          ...commonData,
          type: 'SHOP',
          shopName: sShopName,
          address: sAddress,
          city: sCity,
          state: sState,
          postalCode: sPostal,
          latitude: lat,
          longitude: long,
          website: sWebsite,
          operatingHours: sHours,
          description: sDesc,
          documentUrl: sDoc
        });
      }
      setSubmitted(true);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to submit application. Please check your inputs.';
      Alert.alert('Submission Failed', msg);
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.title}>Join <Text style={styles.goldText}>FadeBook</Text></Text>
          <Text style={styles.subtitle}>Apply as a barber or register your barbershop</Text>
        </View>

        {/* Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            onPress={() => { setFormType('barber'); setErrors({}); }}
            style={[styles.toggleBtn, formType === 'barber' && styles.toggleBtnActive]}
          >
            <Scissors size={18} color={formType === 'barber' ? theme.colors.primary : theme.colors.muted} />
            <Text style={[styles.toggleText, formType === 'barber' && styles.toggleTextActive]}>Barber</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => { setFormType('shop'); setErrors({}); }}
            style={[styles.toggleBtn, formType === 'shop' && styles.toggleBtnActive]}
          >
            <Store size={18} color={formType === 'shop' ? theme.colors.primary : theme.colors.muted} />
            <Text style={[styles.toggleText, formType === 'shop' && styles.toggleTextActive]}>Shop</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.formCard}>
          
          {/* Common Fields */}
          <Text style={styles.formTitle}>Account Details</Text>
          <Field label="Full Name" value={name} onChange={setName} error={errors.name} required />
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Field label="Email" value={email} onChange={setEmail} error={errors.email} keyboardType="email-address" autoCapitalize="none" required />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Password" value={password} onChange={setPassword} error={errors.password} secureTextEntry required />
            </View>
          </View>
          <Field label="Phone" value={phone} onChange={setPhone} error={errors.phone} keyboardType="phone-pad" required />

          {formType === 'barber' ? (
            <>
              <Text style={styles.formTitle}>Barber Info</Text>
              
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Field label="Years Exp." value={bExp} onChange={setBExp} error={errors.bExp} keyboardType="number-pad" required />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="City" value={bCity} onChange={setBCity} error={errors.bCity} required />
                </View>
              </View>

              <Field label="Skills (comma separated)" value={bSkills} onChange={setBSkills} placeholder="Fades, Beard Trim" required />
              <TextAreaField label="Bio" value={bBio} onChange={setBBio} error={errors.bBio} required />
              
              <Field label="Profile Pic URL" value={bProfilePic} onChange={setBProfilePic} placeholder="https://..." />
              <Field label="License Doc URL" value={bLicense} onChange={setBLicense} placeholder="https://..." />
            </>
          ) : (
            <>
              <Text style={styles.formTitle}>Shop Info</Text>
              
              <Field label="Shop Name" value={sShopName} onChange={setSShopName} error={errors.sShopName} required />
              <TextAreaField label="Address" value={sAddress} onChange={setSAddress} error={errors.sAddress} required />
              
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Field label="City" value={sCity} onChange={setSCity} error={errors.sCity} required />
                </View>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Field label="State" value={sState} onChange={setSState} />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="Postal Code" value={sPostal} onChange={setSPostal} />
                </View>
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Field label="Latitude" value={sLat} onChange={setSLat} error={errors.location} keyboardType="decimal-pad" required />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="Longitude" value={sLong} onChange={setSLong} error={errors.location} keyboardType="decimal-pad" required />
                </View>
              </View>

              <Field label="Website" value={sWebsite} onChange={setSWebsite} autoCapitalize="none" />
              <Field label="Operating Hours" value={sHours} onChange={setSHours} placeholder="Mon-Sat: 9AM-6PM" />
              <TextAreaField label="Description" value={sDesc} onChange={setSDesc} />
              <Field label="Business Doc URL" value={sDoc} onChange={setSDoc} placeholder="https://..." />
            </>
          )}

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.submitBtnText}>Submit Application</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// --- Reusable Components ---

const Field = ({ label, value, onChange, error, required, ...props }: any) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.label}>{label} {required && <Text style={styles.required}>*</Text>}</Text>
    <TextInput
      style={[styles.input, error && styles.inputError]}
      value={value}
      onChangeText={onChange}
      placeholderTextColor={theme.colors.placeholder}
      autoCapitalize="sentences"
      {...props}
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const TextAreaField = ({ label, value, onChange, error, placeholder, required }: any) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.label}>{label} {required && <Text style={styles.required}>*</Text>}</Text>
    <TextInput
      style={[styles.input, styles.textArea, error && styles.inputError]}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.placeholder}
      multiline
      numberOfLines={3}
      textAlignVertical="top"
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

// --- Styles ---
const styles = StyleSheet.create({
  centeredContainer: { flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.lg },
  scrollContent: { padding: theme.spacing.lg, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: theme.spacing.xl },
  backBtn: { position: 'absolute', left: 0, top: 0, padding: 8 },
  logoText: { fontSize: 24, fontFamily: theme.fonts.serif, fontWeight: '700', color: theme.colors.primary, marginBottom: theme.spacing.md },
  title: { fontSize: 28, fontFamily: theme.fonts.serif, fontWeight: '700', color: theme.colors.text },
  goldText: { color: theme.colors.primary },
  subtitle: { fontSize: 14, color: theme.colors.muted, marginTop: theme.spacing.sm, textAlign: 'center' },
  toggleContainer: { flexDirection: 'row', justifyContent: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.xl },
  toggleBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.lg, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border },
  toggleBtnActive: { backgroundColor: 'rgba(212, 175, 55, 0.1)', borderColor: theme.colors.primary },
  toggleText: { color: theme.colors.muted, fontWeight: '500' },
  toggleTextActive: { color: theme.colors.primary },
  formCard: { backgroundColor: theme.colors.card, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.xl, marginBottom: theme.spacing.xl },
  formTitle: { fontSize: 18, fontFamily: theme.fonts.serif, fontWeight: '700', color: theme.colors.text, marginTop: 16, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  fieldContainer: { marginBottom: theme.spacing.md },
  label: { fontSize: 12, color: theme.colors.muted, marginBottom: 6, fontWeight: '500' },
  required: { color: theme.colors.error },
  input: { backgroundColor: 'rgba(39, 39, 42, 0.3)', borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.md, color: theme.colors.text, fontSize: 14 },
  inputError: { borderColor: theme.colors.error },
  textArea: { minHeight: 80, paddingTop: theme.spacing.md },
  submitBtn: { backgroundColor: theme.colors.primary, paddingVertical: 16, borderRadius: theme.radius.md, alignItems: 'center', marginTop: theme.spacing.lg },
  submitBtnText: { color: '#000', fontWeight: '700', fontSize: 16 },
  errorText: { color: theme.colors.error, fontSize: 11, marginTop: 4 },
  glassCard: { backgroundColor: theme.colors.card, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.xl, width: '100%', maxWidth: 400, alignItems: 'center' },
  successTitle: { fontSize: 22, fontFamily: theme.fonts.serif, fontWeight: '700', color: theme.colors.text, marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm },
  successText: { color: theme.colors.muted, textAlign: 'center', lineHeight: 20, marginBottom: theme.spacing.md },
  statusBadge: { backgroundColor: 'rgba(212, 175, 55, 0.1)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  statusText: { color: theme.colors.primary, fontWeight: '600', fontSize: 12 },
  homeButton: { marginTop: theme.spacing.xl, borderWidth: 1, borderColor: theme.colors.border, paddingVertical: 12, paddingHorizontal: 24, borderRadius: theme.radius.md },
  homeButtonText: { color: theme.colors.text, fontWeight: '600' },
});

export default Apply;