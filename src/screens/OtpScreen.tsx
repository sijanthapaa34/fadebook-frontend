import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  Alert, ActivityIndicator, Keyboard,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';
import { useAuthStore } from '../store/authStore';
import { sendOtp, registerRequest } from '../api/authService';
import { submitApplication } from '../api/applicationService';
import { uploadProfilePicture } from '../api/userService';
import api from '../api/api';
import type { RootStackParamList } from '../navigation/AppNavigator';

type OtpRouteProp = RouteProp<RootStackParamList, 'OtpVerification'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'OtpVerification'>;

// Define constants to match Backend Enum EXACTLY
const APP_MODE = {
  BARBER: 'BARBER',
  BARBER_SHOP: 'BARBER_SHOP',
  SERVICE: 'SERVICE'
};

const OtpVerificationScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<OtpRouteProp>();
  const insets = useSafeAreaInsets();
  
  const { mode, email, userData, photoUri, applicationData, imageUris } = route.params;
  
  const register = useAuthStore((s) => s.register);
  const setUser = useAuthStore((s) => s.setUser);

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  
  const [timer, setTimer] = useState(59);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    startTimer();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startTimer = () => {
    setTimer(59);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    
    setIsResending(true);
    try {
      await sendOtp(email);
      startTimer();
      Alert.alert('Success', 'A new OTP has been sent to your email.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };

  // --- Unified Submit Logic ---
  const handleVerify = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit code.');
      return;
    }

    Keyboard.dismiss();
    setIsLoading(true);

    try {
      if (mode === 'REGISTER') {
        await handleRegisterFlow();
      } else {
        await handleApplicationFlow();
      }
    } catch (err: any) {
      console.error('Verification failed:', err);
      Alert.alert('Failed', err.message || 'Invalid OTP or server error.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Registration Logic ---
  const handleRegisterFlow = async () => {
    if (!userData) return;
    
    const payload = { ...userData, otp };
    const newUser = await register(payload);
    
    if (newUser && newUser.id && photoUri) {
      try {
        const profileUrl = await uploadProfilePicture(newUser.id, photoUri);
        setUser({ ...newUser, profilePicture: profileUrl });
      } catch (uploadError) {
        console.warn("Photo upload failed:", uploadError);
        Alert.alert('Warning', 'Account created, but profile photo failed to upload.');
      }
    }
  };

  // --- Application Logic (FIXED) ---
  const handleApplicationFlow = async () => {
    if (!applicationData) return;

    // Helper to upload files to /api/upload
    const uploadFile = async (uri: string, type: string): Promise<string> => {
      const formData = new FormData();
      formData.append('file', { uri, type: 'image/jpeg', name: `upload_${Date.now()}.jpg` });
      formData.append('type', type);
      formData.append('email', email);
      
      const res = await api.post('/upload', formData, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      
      // Safety check: Backend might return string directly or JSON object
      if (typeof res.data === 'string') return res.data;
      if (res.data && res.data.url) return res.data.url;
      return res.data; 
    };

    // 1. Construct Base Payload
    // Use the constant to ensure correct string comparison
    const formType = applicationData.formType; 

    let payload: any = {
      type: formType, // 'BARBER' or 'BARBER_SHOP'
      name: applicationData.common.name,
      email: applicationData.common.email,
      password: applicationData.common.password,
      phone: applicationData.common.phone,
      otp: otp,
    };

    // 2. Handle Barber Specific
    // Check against the CONSTANT string to be safe
    if (formType === APP_MODE.BARBER && applicationData.barberData) {
      
      // Upload Profile Picture
      if (imageUris?.profile) {
        payload.profilePictureUrl = await uploadFile(imageUris.profile, 'profile');
      }
      
      // Upload License
      if (imageUris?.license) {
        payload.licenseUrl = await uploadFile(imageUris.license, 'license');
      }

      payload.experienceYears = parseInt(applicationData.barberData.exp) || 0;
      payload.city = applicationData.barberData.city;
      payload.bio = applicationData.barberData.bio;
      payload.barbershopId = applicationData.barberData.selectedShopId;
      payload.barbershopName = applicationData.barberData.selectedShopName;

      // Convert Skills string to Array
      let skillsArray: string[] = [];
      if (applicationData.barberData.skills) {
        skillsArray = (applicationData.barberData.skills as string)
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => s);
      }
      payload.skills = skillsArray;
    }

    // 3. Handle Shop Specific
    // ** CRITICAL CHECK **: Must match 'BARBER_SHOP'
    if (formType === APP_MODE.BARBER_SHOP && applicationData.shopData) {
      
      // Upload Business Document
      if (imageUris?.doc) {
        console.log("Uploading document...");
        payload.documentUrl = await uploadFile(imageUris.doc, 'doc');
        console.log("Document URL:", payload.documentUrl);
      }

      // Upload Shop Photos
      if (imageUris?.shopImages && imageUris.shopImages.length > 0) {
        console.log("Uploading shop images...");
        const shopImageUrls = await Promise.all(
          imageUris.shopImages.map((uri: string) => uploadFile(uri, 'shop_image'))
        );
        payload.shopImages = shopImageUrls;
        console.log("Shop Image URLs:", payload.shopImages);
      }

      // Map Shop Fields
      payload.shopName = applicationData.shopData.shopName;
      payload.address = applicationData.shopData.address;
      payload.city = applicationData.shopData.city;
      payload.state = applicationData.shopData.state;
      payload.postalCode = applicationData.shopData.postal;
      payload.latitude = parseFloat(applicationData.shopData.lat);
      payload.longitude = parseFloat(applicationData.shopData.long);
      payload.website = applicationData.shopData.website;
      payload.operatingHours = applicationData.shopData.hours;
      payload.description = applicationData.shopData.desc;
    }

    // 4. Submit Application
    console.log("Submitting payload:", payload);
    await submitApplication(payload);
    Alert.alert('Success', 'Application submitted successfully!');
    navigation.navigate('Landing'); 
  };

  // --- UI Render ---
  const getTitle = () => mode === 'REGISTER' ? 'Verify Email' : 'Verify Application';
  const getButtonText = () => mode === 'REGISTER' ? 'Verify & Create Account' : 'Verify & Submit Application';

  return (
    <View style={[styles.container, { paddingTop: insets.top + 40 }]}>
      <View style={styles.content}>
        <Text style={styles.title}>{getTitle()}</Text>
        <Text style={styles.subtitle}>
          We've sent a 6-digit code to{'\n'}
          <Text style={styles.email}>{email}</Text>
        </Text>

        <View style={styles.otpContainer}>
          <TextInput
            style={styles.otpInput}
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="------"
            placeholderTextColor={theme.colors.border}
            textAlign="center"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={theme.colors.primaryText} />
          ) : (
            <Text style={styles.buttonText}>{getButtonText()}</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={styles.timerText}>
            {timer > 0 ? `Resend code in 00:${timer < 10 ? `0${timer}` : timer}` : "Didn't receive code?"}
          </Text>
          {timer === 0 && (
            <TouchableOpacity onPress={handleResendOtp} disabled={isResending}>
              <Text style={styles.resendLink}>
                {isResending ? 'Sending...' : 'Resend OTP'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xxl,
    lineHeight: 22,
  },
  email: {
    fontWeight: '600',
    color: theme.colors.text,
  },
  otpContainer: {
    width: '100%',
    marginBottom: theme.spacing.xxl,
  },
  otpInput: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 20,
    color: theme.colors.primary,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radius.md,
    width: '100%',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: theme.colors.primaryText,
    fontWeight: '600',
    fontSize: 16,
  },
  resendContainer: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  timerText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  resendLink: {
    color: theme.colors.primary,
    fontWeight: '600',
    marginTop: theme.spacing.xs,
  },
});

export default OtpVerificationScreen;