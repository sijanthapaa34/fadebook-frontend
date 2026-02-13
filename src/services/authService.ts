// import api from '../api';
// import * as Keychain from 'react-native-keychain';
// import { jwtDecode } from 'jwt-decode';
// import { GoogleSignin} from '@react-native-google-signin/google-signin';
// import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
// import { Platform } from 'react-native';
// import { User } from '../models/models';

// // --- TYPES ---
// interface TokenPayload {
//   sub: string;   // user ID from backend
//   email: string; // user's email
//   role: string;  // e.g., "CUSTOMER" | "BARBER"
//   iat: number;
//   exp: number;
// }

// interface RegisterData {
//   name: string;
//   email: string;
//   phone: string;
//   password: string;
//   preferences?: string;
// }

// // --- HELPERS ---
// const decodeToken = (token: string): User => {
//   const decoded: TokenPayload = jwtDecode(token);

//   let cleanRole = decoded.role;
//   if (cleanRole.startsWith('ROLE_')) cleanRole = cleanRole.replace('ROLE_', '');

//   return {
//     id: decoded.sub,
//     email: decoded.email,
//     role: cleanRole.toLowerCase() as User['role'],
//   };
// };

// const storeToken = async (token: string) => {
//   await Keychain.setGenericPassword('auth_token', token);
// };

// // ==========================
// // AUTH FUNCTIONS
// // ==========================

// // Normal login
// export const login = async (email: string, password: string) => {
//   const response = await api.post('/auth/login', { email, password });
//   const { token } = response.data;
//   await storeToken(token);
//   const user = decodeToken(token);
//   return { user, token };
// };

// // Customer registration
// export const registerCustomer = async (data: RegisterData) => {
//   const response = await api.post('/auth/customer', data);
//   return response.data;
// };

// // Google login
// export const loginWithGoogle = async () => {
//   await GoogleSignin.configure({
//     webClientId: 'YOUR_WEB_CLIENT_ID', // Google Cloud Web client ID
//     iosClientId: 'YOUR_IOS_CLIENT_ID', // optional for iOS
//     offlineAccess: true,
//   });

//   await GoogleSignin.hasPlayServices();
//   const userInfo = await GoogleSignin.signIn();
//   const tokens = await GoogleSignin.getTokens();
//   const idToken = tokens.idToken;

//   if (!idToken) throw new Error('Google ID token missing');

//   const platform = Platform.OS;
//   const response = await api.post('/auth/google', null, { params: { idToken, platform } });
//   const { token } = response.data;

//   await storeToken(token);
//   const user = decodeToken(token);
//   return { user, token };
// };

// // Facebook login
// export const loginWithFacebook = async () => {
//   const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
//   if (result.isCancelled) throw new Error('Facebook login cancelled');

//   const data = await AccessToken.getCurrentAccessToken();
//   if (!data) throw new Error('Failed to get Facebook access token');

//   const accessToken = data.accessToken;
//   const platform = Platform.OS;
//   const response = await api.post('/auth/facebook', null, { params: { idToken: accessToken, platform } });

//   const { token } = response.data;
//   await storeToken(token);

//   const user = decodeToken(token);
//   return { user, token };
// };

// export const logout = async () => {
//   try {
//     // Clear local token
//     await Keychain.resetGenericPassword();

//     // Sign out from Google (ignore TypeScript complaints)
//     try {
//       await (GoogleSignin as any).signOut();
//     } catch {}

//     // Sign out from Facebook
//     try {
//       LoginManager.logOut();
//     } catch {}
//   } catch (err) {
//     console.error('Logout error:', err);
//   }
// };



