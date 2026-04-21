import { create } from 'zustand';
import * as Keychain from 'react-native-keychain';
import { User, UserRole, RegisterCustomerRequest } from '../models/models';
import { loginRequest, registerRequest, googleSignInRequest } from '../api/authService';
import { setUnauthorizedHandler } from '../api/authEvents';
import api from '../api/api';
import notificationService from '../api/pushNotificationService';

const MOBILE_ROLES: UserRole[] = ['CUSTOMER', 'BARBER'];

const normalizeRole = (role: any): UserRole => {
  if (!role) return 'CUSTOMER';
  const upperRole = role.toString().toUpperCase();
  if (MOBILE_ROLES.includes(upperRole as UserRole)) {
    return upperRole as UserRole;
  }
  return 'CUSTOMER';
};

// Throws if the role is not allowed on the mobile app
const assertMobileRole = (role: any): void => {
  const upperRole = role?.toString().toUpperCase();
  if (!MOBILE_ROLES.includes(upperRole as UserRole)) {
    throw new Error('This account is not authorized to use the mobile app. Please use the admin panel.');
  }
};

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterCustomerRequest) => Promise<User | null>;
  googleLogin: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => Promise<void>; 
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    try {
      set({ isLoading: true });
      const credentials = await Keychain.getGenericPassword();

      if (!credentials) {
        set({ user: null, token: null, isAuthenticated: false });
        return;
      }

      const token = credentials.password;

      // Validate token against backend with a 5s timeout
      try {
        const res = await Promise.race([
          api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 5000)
          ),
        ]) as any;

        const parsedUser = res.data as User;
        parsedUser.role = normalizeRole(parsedUser.role);
        await Keychain.setGenericPassword(JSON.stringify(parsedUser), token);
        set({ user: parsedUser, token, isAuthenticated: true });
      } catch {
        // Token expired, invalid, or network timeout — clear everything
        await Keychain.resetGenericPassword().catch(() => {});
        set({ user: null, token: null, isAuthenticated: false });
      }
    } catch (error) {
      console.error('Error initializing auth store:', error);
      await Keychain.resetGenericPassword().catch(() => {});
      set({ user: null, token: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    const { user, token } = await loginRequest(email, password);
    assertMobileRole(user.role);
    const safeUser = { ...user, role: normalizeRole(user.role) };
    await Keychain.setGenericPassword(JSON.stringify(safeUser), token);
    set({ user: safeUser, token, isAuthenticated: true });
    
    // ✅ Register FCM token after successful login
    try {
      await notificationService.getToken();
    } catch (e) {
      console.warn('Failed to register FCM token after login:', e);
    }
  },

  register: async (data) => {
    const { user, token } = await registerRequest(data);
    assertMobileRole(user.role);
    const userWithRole = { ...user, role: normalizeRole(user.role || 'CUSTOMER') };
    await Keychain.setGenericPassword(JSON.stringify(userWithRole), token);
    set({ user: userWithRole, token, isAuthenticated: true });
    
    // ✅ Register FCM token after successful registration
    try {
      await notificationService.getToken();
    } catch (e) {
      console.warn('Failed to register FCM token after registration:', e);
    }
    
    return userWithRole;
  },

  googleLogin: async () => {
    const { user, token } = await googleSignInRequest();
    assertMobileRole(user.role);
    const userWithRole = { ...user, role: normalizeRole(user.role || 'CUSTOMER') };
    await Keychain.setGenericPassword(JSON.stringify(userWithRole), token);
    set({ user: userWithRole, token, isAuthenticated: true });
    
    // ✅ Register FCM token after successful Google login
    try {
      await notificationService.getToken();
    } catch (e) {
      console.warn('Failed to register FCM token after Google login:', e);
    }
  },

  logout: async () => {
    // Always clear state first — never let Keychain failure block logout
    set({ user: null, token: null, isAuthenticated: false });
    try {
      await Keychain.resetGenericPassword();
    } catch (e) {
      console.warn('Keychain reset failed on logout (non-critical):', e);
    }
  },

  setUser: async (updatedUser) => {
    const token = get().token;
    const safeUser = { ...updatedUser, role: normalizeRole(updatedUser.role) };

    if (token) {
        try {
            await Keychain.setGenericPassword(JSON.stringify(safeUser), token);
        } catch (e) {
            console.warn('Failed to update user in Keychain', e);
        }
    }
    set({ user: safeUser });
  },
}));

// Register 401 handler — when any API call gets 401, auto-logout immediately
setUnauthorizedHandler(() => {
  useAuthStore.getState().logout();
});
