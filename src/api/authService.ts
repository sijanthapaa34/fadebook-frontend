import api from './api';
import { jwtDecode } from 'jwt-decode';
import { User, UserRole } from '../models/models';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

interface JWTPayload {
  role: string;
  sub: string;
  email: string;
}

export interface RegisterCustomerRequest { 
  name: string; 
  email: string; 
  phone?: string; 
  password: string; 
  preferences?: string; 
}

// --- Helper: Fetch Full Profile ---
const fetchUserProfile = async (token: string): Promise<User> => {
  try {
    const res = await api.get<User>('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const user = res.data;
    if (user.role) {
        user.role = user.role.toUpperCase() as UserRole;
    }
    return user;
  } catch (error) {
    console.error('Failed to fetch user profile', error);
    throw new Error('Could not fetch user details after login');
  }
};

// --- Google Configuration (Call this in App.tsx) ---
export const configureGoogleSignin = () => {
  GoogleSignin.configure({
    webClientId: '330770558960-rst7s8nhiormbq19dddgorhq9p1uo0q5.apps.googleusercontent.com', 
    iosClientId: '330770558960-satr5o193upaq318m5k0959b1or3pf90.apps.googleusercontent.com',
    offlineAccess: false,
  });
};

// --- API Methods ---

export const loginRequest = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  const res = await api.post('/auth/login', { email, password });
  const token = res.data.token;
  if (!token) throw new Error('No token returned');
  const userProfile = await fetchUserProfile(token);
  return { user: userProfile, token };
};

export const registerRequest = async (data: RegisterCustomerRequest): Promise<{ user: User; token: string }> => {
  const res = await api.post('/auth/customer', data);
  const token = res.data.token;
  if (!token) throw new Error('No token returned from registration');
  const userProfile = await fetchUserProfile(token);
  return { user: userProfile, token };
};

export const googleSignInRequest = async (): Promise<{ user: User; token: string }> => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    const tokens = await GoogleSignin.getTokens();
    const idToken = tokens.idToken;
    
    if (!idToken) throw new Error('No Google ID token returned');

    const res = await api.post('/auth/google', { idToken });
    const token = res.data.token;
    if (!token) throw new Error('No token returned from backend');
    
    const userProfile = await fetchUserProfile(token);
    return { user: userProfile, token };
  } catch (err: any) {
    if (err.code === statusCodes.SIGN_IN_CANCELLED) {
      throw new Error('Google Sign-In cancelled');
    } else if (err.code === statusCodes.IN_PROGRESS) {
      throw new Error('Google Sign-In already in progress');
    } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      throw new Error('Google Play Services not available');
    } else {
      throw err;
    }
  }
};