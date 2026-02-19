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
    const { user, token } = await loginRequest(email, password);
    await Keychain.setGenericPassword(JSON.stringify(user), token);
    set({ user, token, isAuthenticated: true });
  },

  register: async (data) => {
    const { user, token } = await registerRequest(data);
    // Force role to CUSTOMER for safety
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