// src/screens/Register.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';

import Logo from '../components/Logo';
import { theme } from '../theme/theme';
import { registerCustomer } from '../lib/auth';
import { useAuthStore } from '../store/authStore';
import type { RegisterCustomerRequest } from '../lib/auth';
import { configureGoogleSignin, signInWithGoogle } from '../lib/googleSignIn';
import type { RootStackParamList } from '../navigation/NavigationService';
import { redirectByRole } from '../navigation/NavigationService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const socialButtons = [
  {
    name: 'Google',
    svg: (
      <Svg width="16" height="16" viewBox="0 0 24 24">
        <Path
          fill={theme.colors.text}
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        />
        <Path
          fill={theme.colors.text}
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <Path
          fill={theme.colors.text}
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <Path
          fill={theme.colors.text}
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </Svg>
    ),
  },
  {
    name: 'Facebook',
    svg: (
      <Svg width="16" height="16" viewBox="0 0 24 24">
        <Path
          fill={theme.colors.text}
          d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
        />
      </Svg>
    ),
  },
];

const Register = () => {
  const navigation = useNavigation<NavigationProp>();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm] = useState<RegisterCustomerRequest & { isLoading?: boolean }>({
    name: '',
    email: '',
    password: '',
    phone: '',
    preferences: '',
    isLoading: false,
  });
  
    React.useEffect(() => {
    configureGoogleSignin(); // configure Google Sign-In once when component mounts
  }, []);

  const handleChange = (key: keyof RegisterCustomerRequest, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
  const { name, email, password, phone, preferences } = form;
  if (!name || !email || !password) {
    Alert.alert('Error', 'Please fill all required fields');
    return;
  }

  try {
    setForm((prev) => ({ ...prev, isLoading: true }));

    // registration + automatic login
    const { user, token } = await registerCustomer({ name, email, password, phone, preferences });

    // force role as CUSTOMER
      const userWithRole = { ...user, role: 'CUSTOMER' as const };

      // store in auth store
      await setAuth(userWithRole, token);

      // redirect using role
      redirectByRole('CUSTOMER');
  } catch (err: any) {
    console.error('Registration error:', err);
    Alert.alert('Registration failed', err.message || 'Unknown error');
  } finally {
    setForm((prev) => ({ ...prev, isLoading: false }));
  }
};


  const handleSocialLogin = async (provider: string) => {
  if (provider === 'Google') {
    try {
      setForm(prev => ({ ...prev, isLoading: true }));
      
      // sign in with Google
      const { user, token } = await signInWithGoogle();

      // force role as CUSTOMER
      const userWithRole = { ...user, role: 'CUSTOMER' as const };

      // store in auth store
      await setAuth(userWithRole, token);

      // redirect using role
      redirectByRole('CUSTOMER');
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      Alert.alert('Error', err.message || 'Failed to login with Google');
    } finally {
      setForm(prev => ({ ...prev, isLoading: false }));
    }
  } else {
    Alert.alert('Demo', `You clicked ${provider} signup (demo only)`);
  }
};


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Landing')}>
            <Logo size="lg" />
          </TouchableOpacity>
          <Text style={styles.subtitle}>Create your FadeBook account</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.form}>
            {(['name', 'email', 'password', 'phone', 'preferences'] as (keyof RegisterCustomerRequest)[]).map((key) => (
              <View style={styles.inputGroup} key={key}>
                <Text style={styles.label}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={key === 'password' ? '••••••••' : `Enter your ${key}`}
                  placeholderTextColor={theme.colors.placeholder}
                  value={form[key]}
                  onChangeText={(val) => handleChange(key, val)}
                  secureTextEntry={key === 'password'}
                  keyboardType={key === 'email' ? 'email-address' : 'default'}
                  autoCapitalize={key === 'email' ? 'none' : 'sentences'}
                />
              </View>
            ))}

            <TouchableOpacity
              style={[styles.button, form.isLoading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={form.isLoading}
            >
              {form.isLoading ? (
                <ActivityIndicator color={theme.colors.primaryText} />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.socialSection}>
            {socialButtons.map((btn) => (
              <TouchableOpacity
                key={btn.name}
                style={[styles.socialButton]}
                onPress={() => handleSocialLogin(btn.name)}
              >
                {btn.svg}
                <Text style={styles.socialButtonText}>Continue with {btn.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={styles.footer}>
          Already have an account?{' '}
          <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
            Sign in
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
};

// ---------------- Styles ----------------
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.xxl, // restored top & bottom padding like before
    paddingHorizontal: theme.spacing.lg,
  },
  wrapper: { width: '100%', maxWidth: theme.layout.maxWidth, alignSelf: 'center' },
  header: { alignItems: 'center', marginBottom: theme.spacing.xxl },
  subtitle: { marginTop: theme.spacing.md, color: theme.colors.textSecondary },
  card: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xxl,
    marginBottom: theme.spacing.xxl,
  },
  form: { gap: theme.spacing.lg },
  inputGroup: { marginBottom: theme.spacing.lg },
  label: { color: theme.colors.text, marginBottom: theme.spacing.sm },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    color: theme.colors.text,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: theme.colors.primaryText, fontWeight: theme.typography.button.fontWeight, fontSize: theme.typography.button.fontSize },
  socialSection: {
    marginTop: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  icon: { marginRight: theme.spacing.sm },
  socialButtonText: { color: theme.colors.text, fontSize: theme.typography.body.fontSize, fontWeight: theme.typography.body.fontWeight },
  disabled: { opacity: 0.5 },
  footer: { textAlign: 'center', fontSize: theme.typography.small.fontSize, color: theme.colors.textSecondary, marginTop: theme.spacing.md },
  link: { color: theme.colors.primary, textDecorationLine: 'underline' },
});

export default Register;
