// src/store/authStore.ts
import { create } from 'zustand';
import * as Keychain from 'react-native-keychain';
import { User } from '../models/models';
import { login as loginApi } from '../lib/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (user: User, token: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  // Initialize auth state from Keychain
  initialize: async () => {
    try {
      set({ isLoading: true });

      const credentials = await Keychain.getGenericPassword();
      if (credentials) {
        const { username, password } = credentials; // username = user JSON, password = token
        const parsedUser: User = JSON.parse(username);

        set({
          user: parsedUser,
          token: password,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ isLoading: false });
    }
  },

  // Set auth manually (used after registration or social login)
  setAuth: async (user: User, token: string) => {
    try {
      await Keychain.setGenericPassword(JSON.stringify(user), token);
      set({ user, token, isAuthenticated: true });
    } catch (error) {
      console.error('Error setting auth:', error);
    }
  },

  // Login using API
  login: async (email: string, password: string) => {
    try {
      const { user, token } = await loginApi(email, password);

      // Save to Keychain securely
      await Keychain.setGenericPassword(JSON.stringify(user), token);

      set({ user, token, isAuthenticated: true });
    } catch (error) {
      console.error('Login failed:', error);
      throw error; // rethrow for screens to handle
    }
  },

  // Logout
  logout: async () => {
    try {
      await Keychain.resetGenericPassword();
      set({ user: null, token: null, isAuthenticated: false });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  },
}));
