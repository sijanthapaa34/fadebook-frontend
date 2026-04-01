// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Logo from '../components/Logo';
import { theme } from '../theme/theme';
import { useAuthStore } from '../store/authStore';
import { useBiometrics } from '../hooks/useBiometrics';

import type { RootStackParamList } from '../navigation/AppNavigator';
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Login = () => {
  const navigation = useNavigation<NavigationProp>();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    isAvailable,
    biometryLabel,
    hasSavedCreds,
    saveCredentials,
    authenticateAndGetCredentials,
    check,
  } = useBiometrics();

  const showBiometricButton = hasSavedCreds;
  const showBiometricSetupHint = isAvailable && !hasSavedCreds;

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter both email and password');
      return;
    }
    setIsLoading(true);
    try {
      await login(email, password);

      // Offer to enable biometrics after first successful password login
      if (isAvailable && !hasSavedCreds) {
        Alert.alert(
          `Enable ${biometryLabel}`,
          `Sign in faster next time using ${biometryLabel}?`,
          [
            { text: 'Not Now', style: 'cancel' },
            {
              text: 'Enable',
              onPress: async () => {
                const ok = await saveCredentials(email, password);
                if (ok) await check(); // refresh hasSavedCreds
              },
            },
          ]
        );
      }
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setIsLoading(true);
    try {
      const creds = await authenticateAndGetCredentials();
      if (!creds) {
        Alert.alert('Cancelled', `${biometryLabel} authentication was cancelled or failed.`);
        return;
      }
      await login(creds.email, creds.password);
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Landing')}>
            <Logo size="lg" />
          </TouchableOpacity>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.form}>

            {/* Biometric quick-login — only when creds already saved */}
            {showBiometricButton && (
              <>
                <TouchableOpacity
                  style={[styles.biometricButton, isLoading && styles.buttonDisabled]}
                  onPress={handleBiometricLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={theme.colors.primary} />
                  ) : (
                    <Text style={styles.biometricText}>Sign in with {biometryLabel}</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or use password</Text>
                  <View style={styles.dividerLine} />
                </View>
              </>
            )}

            {/* Setup hint — visible immediately when biometrics available but not yet set up */}
            {showBiometricSetupHint && (
              <View style={styles.biometricHint}>
                <Text style={styles.biometricHintText}>
                  {biometryLabel} available — sign in with password once to enable it
                </Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={theme.colors.placeholder}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={theme.colors.placeholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                onSubmitEditing={handleSubmit}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.colors.primaryText} />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

          </View>
        </View>

        <Text style={styles.footer}>
          Don't have an account?{' '}
          <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
            Sign up
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  wrapper: {
    width: '100%',
    maxWidth: theme.layout.maxWidth,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  subtitle: {
    marginTop: theme.spacing.md,
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
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
  label: {
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
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
    marginTop: theme.spacing.sm,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: theme.colors.primaryText,
    fontWeight: '600',
    fontSize: theme.typography.button.fontSize,
  },
  biometricButton: {
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  biometricText: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: theme.typography.button.fontSize,
  },
  biometricHint: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  biometricHintText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  footer: {
    textAlign: 'center',
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.textSecondary,
  },
  link: {
    color: theme.colors.primary,
    textDecorationLine: 'underline',
  },
});

export default Login;
