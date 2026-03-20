// src/api/authService.ts
import api from './api';
import { OtpResponse, User, UserRole } from '../models/models';
import Config from 'react-native-config';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { RegisterCustomerRequest } from '../models/models';
import axios, { AxiosError } from 'axios';

// --- Helper: Extract Readable Error Message ---
const getErrorMessage = (error: any): string => {
  // 1. Check for Axios response (Server responded with error status)
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;

    // PRIORITIZE STATUS CODES FOR AUTH ERRORS
    // This prevents showing "Unauthorized" or "Bad credentials" raw strings
    if (status === 401) {
      return 'Invalid email or password. Please try again.';
    }
    if (status === 403) {
      return 'Access denied. Your account may be unverified.';
    }
    if (status === 404) {
      return 'Service not found (404).';
    }
    if (status === 500) {
      return 'Server error. Please try again later.';
    }

    // If not a specific status, try to read backend message
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    
    // Request was made but no response received (Network Error)
    if (error.request) {
      return 'Network error. Check your internet connection.';
    }
    
    // Axios setup error
    return error.message || 'An unexpected request error occurred.';
  }

  // 2. Check for standard JS Error
  if (error instanceof Error) {
    return error.message;
  }

  // 3. Fallback
  return 'An unknown error occurred.';
};

// --- Helper: Fetch Full Profile ---
const fetchUserProfile = async (token: string): Promise<User> => {
  try {
    const res = await api.get<User>('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    const rawUser = res.data;

    const safeUser: User = {
      ...rawUser,
      name: rawUser.name, 
      role: (rawUser.role).toString().toUpperCase() as UserRole,
      phone: rawUser.phone || '',
    };
    
    console.log('Fetched & Normalized User:', safeUser);
    return safeUser;
  } catch (error) {
    console.error('Failed to fetch user profile', error);
    throw new Error('Logged in, but failed to fetch user details.');
  }
};

// --- Google Configuration ---
export const configureGoogleSignin = () => {
  GoogleSignin.configure({
    webClientId: Config.GOOGLE_WEB_CLIENT_ID, 
    iosClientId: Config.GOOGLE_IOS_CLIENT_ID,
    offlineAccess: false,
  });
};

// --- API Methods ---

export const loginRequest = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  try {
    const res = await api.post('/auth/login', { email, password });
    const token = res.data.token || res.data; 
    if (!token) throw new Error('No token returned from server.');
    
    const userProfile = await fetchUserProfile(token);
    return { user: userProfile, token };
  } catch (err: any) {
    throw new Error(getErrorMessage(err));
  }
};


export const googleSignInRequest = async (): Promise<{ user: User; token: string }> => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    const tokens = await GoogleSignin.getTokens();
    const idToken = tokens.idToken;
    
    if (!idToken) throw new Error('Failed to retrieve Google ID Token.');

    const res = await api.post('/auth/google', { idToken });
    const token = res.data.token;
    if (!token) throw new Error('No token returned from backend.');
    
    const userProfile = await fetchUserProfile(token);
    return { user: userProfile, token };

  } catch (err: any) {
    // Handle Google Sign In specific errors
    if (err.code === statusCodes.SIGN_IN_CANCELLED) {
      throw new Error('Google Sign-In cancelled.');
    } else if (err.code === statusCodes.IN_PROGRESS) {
      throw new Error('Google Sign-In already in progress.');
    } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      throw new Error('Google Play Services not available.');
    }
    // Handle Network/API errors
    throw new Error(getErrorMessage(err));
  }
};

export const sendOtp = async (email: string): Promise<void> => {
  try {
    // We assume backend returns 200 OK even if email exists to prevent scraping, 
    // or throws error if you implemented the check.
    await api.post('/email/send-otp', { email });
  } catch (error) {
    // If backend sends an error for existing email, we throw it up
    throw new Error(getErrorMessage(error));
  }
};

export const registerRequest = async (data: RegisterCustomerRequest): Promise<{ user: User; token: string }> => {
  try {
    const res = await api.post('/auth/customer', data);
    const token = res.data.token;
    if (!token) throw new Error('No token returned from registration.');
    
    const userProfile = await fetchUserProfile(token);
    return { user: userProfile, token };
  } catch (err: any) {
    throw new Error(getErrorMessage(err));
  }
};