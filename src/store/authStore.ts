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

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterCustomerRequest) => Promise<void>;
  googleLogin: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
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
        
        // Validate role on init
        if (parsedUser && parsedUser.role) {
             parsedUser.role = parsedUser.role.toString().toUpperCase() as any;
        }
        
        set({ 
          user: parsedUser, 
          token: credentials.password, 
          isAuthenticated: true 
        });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    try {
      const { user, token } = await loginRequest(email, password);
      
      // Force role to be safe
      const safeUser = { ...user, role: user.role || 'CUSTOMER' };
      
      await Keychain.setGenericPassword(JSON.stringify(safeUser), token);
      set({ user: safeUser, token, isAuthenticated: true });
    } catch (error) {
      console.error('Login Action Error:', error);
      throw error; // Re-throw to show alert in UI
    }
  },

  register: async (data) => {
    const { user, token } = await registerRequest(data);
    const userWithRole = { ...user, role: 'CUSTOMER' as const };
    await Keychain.setGenericPassword(JSON.stringify(userWithRole), token);
    set({ user: userWithRole, token, isAuthenticated: true });
  },

  googleLogin: async () => {
    const { user, token } = await googleSignInRequest();
    const userWithRole = { ...user, role: 'CUSTOMER' as const };
    await Keychain.setGenericPassword(JSON.stringify(userWithRole), token);
    set({ user: userWithRole, token, isAuthenticated: true });
  },

  logout: async () => {
    await Keychain.resetGenericPassword();
    set({ user: null, token: null, isAuthenticated: false });
  },
}));