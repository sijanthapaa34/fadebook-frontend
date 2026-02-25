// src/screens/RegisterScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ScrollView, Alert, ActivityIndicator, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { launchImageLibrary } from 'react-native-image-picker';
import { User } from 'lucide-react-native';

import Logo from '../components/Logo';
import { theme } from '../theme/theme';
import { useAuthStore } from '../store/authStore';
import { uploadProfilePicture } from '../api/userService';

import type { RootStackParamList } from '../navigation/AppNavigator';
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// SVG Icons for Social Buttons
const socialButtons = [
  {
    name: 'Google',
    svg: (
      <Svg width="16" height="16" viewBox="0 0 24 24">
        <Path fill={theme.colors.text} d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
        <Path fill={theme.colors.text} d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <Path fill={theme.colors.text} d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <Path fill={theme.colors.text} d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </Svg>
    ),
  },
  {
    name: 'Facebook',
    svg: (
      <Svg width="16" height="16" viewBox="0 0 24 24">
        <Path fill={theme.colors.text} d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </Svg>
    ),
  },
];

type FormState = {
  name: string;
  email: string;
  password: string;
  phone: string;
  isLoading: boolean;
  photoUri: string | null; 
};

const Register = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  
  const register = useAuthStore((s) => s.register);
  const setUser = useAuthStore((s) => s.setUser);
  const googleLogin = useAuthStore((s) => s.googleLogin);

  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    password: '',
    phone: '',
    isLoading: false,
    photoUri: null,
  });

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSelectPhoto = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.5 }, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage);
        return;
      }
      if (response.assets && response.assets.length > 0) {
        const uri = response.assets[0].uri;
        if (uri) {
          setForm(prev => ({ ...prev, photoUri: uri }));
        }
      }
    });
  };

  const handleSubmit = async () => {
    const { name, email, password, phone, photoUri } = form;
    
    if (!photoUri) {
      Alert.alert('Error', 'Profile photo is required');
      return;
    }
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      setForm((prev) => ({ ...prev, isLoading: true }));

      const newUser = await register({ name, email, password, phone });
      
      if (newUser && newUser.id) {
        try {
          const profileUrl = await uploadProfilePicture(newUser.id, photoUri);
          setUser({ ...newUser, profilePicture: profileUrl });
        } catch (uploadError) {
          console.warn("Registration ok, but photo upload failed:", uploadError);
          Alert.alert('Warning', 'Account created, but photo failed to upload.');
        }
      }
      
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
        await googleLogin();
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
    <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 16 }]}>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Landing')}>
            <Logo size="lg" />
          </TouchableOpacity>
          <Text style={styles.subtitle}>Create your FadeBook account</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.form}>
            
            {/* Profile Photo Component */}
            <View style={styles.photoContainer}>
              <TouchableOpacity onPress={handleSelectPhoto} style={styles.avatarWrapper}>
                {form.photoUri ? (
                  <Image source={{ uri: form.photoUri }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <User size={32} color={theme.colors.muted} />
                  </View>
                )}
                <View style={styles.plusButton}>
                  <Text style={styles.plusText}>+</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSelectPhoto}>
                <Text style={styles.uploadText}>Upload Profile Photo</Text>
              </TouchableOpacity>
            </View>

            {(['name', 'email', 'password', 'phone'] as const).map((key) => (
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
                style={styles.socialButton}
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

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: theme.colors.background,
    // paddingTop is now set dynamically via insets.top + 16
    paddingBottom: theme.spacing.xxl,
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
  
  // Photo Upload Styles
  photoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: theme.spacing.sm,
  },
  avatarPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 40,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 150,
    height: 150,
    borderRadius: 40,
    backgroundColor: theme.colors.surface,
  },
  plusButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.card,
  },
  plusText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 12,
    lineHeight: 16,
  },
  uploadText: {
    color: theme.colors.primary,
    fontWeight: '500',
    fontSize: 13,
  },

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
  socialButtonText: { color: theme.colors.text, fontSize: theme.typography.body.fontSize, fontWeight: theme.typography.body.fontWeight, marginLeft: theme.spacing.sm },
  footer: { textAlign: 'center', fontSize: theme.typography.small.fontSize, color: theme.colors.textSecondary, marginTop: theme.spacing.md },
  link: { color: theme.colors.primary, textDecorationLine: 'underline' },
});

export default Register;