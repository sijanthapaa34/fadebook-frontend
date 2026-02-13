// src/screens/Login.tsx
import React, { useState, useEffect } from 'react';
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
import Logo from '../components/Logo';
import { theme } from '../theme/theme';
import { useAuthStore } from '../store/authStore';
import type { UserRole } from '../models/models';

export type RootStackParamList = {
  Landing: undefined;
  Login: undefined;
  Register: undefined;
  CustomerShops: undefined;
  BarberDashboard: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const roleRedirects: Record<UserRole, keyof RootStackParamList> = {
  CUSTOMER: 'CustomerShops',
  BARBER: 'BarberDashboard',
};

const Login = () => {
  const navigation = useNavigation<NavigationProp>();

  const login = useAuthStore((state) => state.login);
  const user = useAuthStore((state) => state.user);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // local loading

  // Redirect on login
  useEffect(() => {
    if (user?.role) {
      navigation.replace(roleRedirects[user.role]);
    }
  }, [user, navigation]);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      console.error('login error:', err);
      Alert.alert('Login failed', err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Logo size="lg" />
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.form}>
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
          <Text
            style={styles.link}
            onPress={() => navigation.navigate('Register')}
          >
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
    paddingTop: theme.spacing.xxl, // restore top padding like old UI
    paddingBottom: theme.spacing.xxl, // restore bottom padding
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
