// src/store/authStore.ts
import { create } from 'zustand';
import * as Keychain from 'react-native-keychain';
import { User } from '../models/models';
import { 
  loginRequest, 
  registerRequest, 
  googleSignInRequest,
  RegisterCustomerRequest 
} from '../api/authService';

// Helper to ensure role is always standardized
const normalizeRole = (role: any): 'CUSTOMER' | 'BARBER' => {
  if (!role) return 'CUSTOMER';
  return role.toString().toUpperCase() as any;
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
        const parsedUser: User = JSON.parse(credentials.username);
        
        // 1. Validate & Normalize role on init
        parsedUser.role = normalizeRole(parsedUser.role);
        
        set({ 
          user: parsedUser, 
          token: credentials.password, 
          isAuthenticated: true 
        });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      // Clear potentially corrupt storage
      await Keychain.resetGenericPassword();
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    const { user, token } = await loginRequest(email, password);
    
    // 2. Normalize role on login
    const safeUser = { ...user, role: normalizeRole(user.role) };
    
    await Keychain.setGenericPassword(JSON.stringify(safeUser), token);
    set({ user: safeUser, token, isAuthenticated: true });
  },

  register: async (data) => {
    const { user, token } = await registerRequest(data);
    
    // 3. Normalize role on register (defaults to CUSTOMER usually)
    const userWithRole = { ...user, role: normalizeRole(user.role || 'CUSTOMER') };
    
    await Keychain.setGenericPassword(JSON.stringify(userWithRole), token);
    set({ user: userWithRole, token, isAuthenticated: true });
    return userWithRole; 
  },

  googleLogin: async () => {
    const { user, token } = await googleSignInRequest();
    
    // 4. Normalize role on Google Sign-in
    const userWithRole = { ...user, role: normalizeRole(user.role || 'CUSTOMER') };
    
    await Keychain.setGenericPassword(JSON.stringify(userWithRole), token);
    set({ user: userWithRole, token, isAuthenticated: true });
  },

  logout: async () => {
    await Keychain.resetGenericPassword();
    set({ user: null, token: null, isAuthenticated: false });
  },

  setUser: async (updatedUser) => {
    const token = get().token;
    const safeUser = { ...updatedUser, role: normalizeRole(updatedUser.role) };

    if (token) {
        await Keychain.setGenericPassword(JSON.stringify(safeUser), token);
    }
    set({ user: safeUser });
  },
}));