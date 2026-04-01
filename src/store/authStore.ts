// src/store/authStore.ts
import { create } from 'zustand';
import * as Keychain from 'react-native-keychain';
import { User, UserRole, RegisterCustomerRequest } from '../models/models'; // Ensure UserRole is imported
import { 
  loginRequest, 
  registerRequest, 
  googleSignInRequest 
} from '../api/authService';

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
      
      if (credentials) {
        // 1. Parse User
        const parsedUser: User = JSON.parse(credentials.username);
        
        // 2. Validate & Normalize role on init
        parsedUser.role = normalizeRole(parsedUser.role);
        
        // 3. Optional: Check if token is expired here (if you have logic for it)
        // otherwise, the API interceptor will handle 401s
        
        set({ 
          user: parsedUser, 
          token: credentials.password, 
          isAuthenticated: true 
        });
      } else {
        // No credentials found
        set({ user: null, token: null, isAuthenticated: false });
      }
    } catch (error) {
      console.error('Error initializing auth store:', error);
      // Clear potentially corrupt storage
      await Keychain.resetGenericPassword();
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
  },

  register: async (data) => {
    const { user, token } = await registerRequest(data);
    assertMobileRole(user.role);
    const userWithRole = { ...user, role: normalizeRole(user.role || 'CUSTOMER') };
    await Keychain.setGenericPassword(JSON.stringify(userWithRole), token);
    set({ user: userWithRole, token, isAuthenticated: true });
    return userWithRole;
  },

  googleLogin: async () => {
    const { user, token } = await googleSignInRequest();
    assertMobileRole(user.role);
    const userWithRole = { ...user, role: normalizeRole(user.role || 'CUSTOMER') };
    await Keychain.setGenericPassword(JSON.stringify(userWithRole), token);
    set({ user: userWithRole, token, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await Keychain.resetGenericPassword();
    } catch (e) {
      console.warn('Failed to reset keychain on logout', e);
    }
    set({ user: null, token: null, isAuthenticated: false });
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