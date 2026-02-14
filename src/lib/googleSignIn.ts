import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import api from './api';
import { User, UserRole } from '../models/models';
import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  role: string;
  sub: string;
  email: string;
}

// Call this once in App.tsx or Register.tsx
export const configureGoogleSignin = () => {
  GoogleSignin.configure({
    webClientId: '330770558960-rst7s8nhiormbq19dddgorhq9p1uo0q5.apps.googleusercontent.com', 
    iosClientId: '330770558960-satr5o193upaq318m5k0959b1or3pf90.apps.googleusercontent.com',
    offlineAccess: false,
  });
};

// Perform Google Sign-In and send ID token to backend
export const signInWithGoogle = async (): Promise<{ user: User; token: string }> => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();

    // Get the ID token separately using getTokens()
    const tokens = await GoogleSignin.getTokens();
    const idToken = tokens.idToken;
    if (!idToken) throw new Error('No Google ID token returned');

    // Send token to backend
    const res = await api.post('/auth/google', { idToken });
    const token = res.data.token;
    if (!token) throw new Error('No token returned from backend');

    const decoded: JWTPayload = jwtDecode(token);
    const user: User = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role.toUpperCase() as UserRole,
    };

    return { user, token };
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
