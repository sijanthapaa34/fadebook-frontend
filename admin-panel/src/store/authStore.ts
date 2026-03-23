// src/stores/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService } from '@/services/authService';
import type { AdminRole, User } from '@/models/models';

export interface AdminUser extends User {
  shopId?: number;
}

interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  resetError: () => void;
  setUser: (user: AdminUser) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isInitialized: false,
      error: null,

      initialize: async () => {
        const storedToken = localStorage.getItem('admin_token');
        if (!storedToken) {
          set({ isInitialized: true, user: null });
          return;
        }

        set({ isLoading: true });
        try {
          const user = await authService.getProfile();
          set({ user: user as AdminUser, token: storedToken, isInitialized: true });
        } catch (error) {
          localStorage.removeItem('admin_token');
          set({ user: null, token: null, isInitialized: true });
        } finally {
          set({ isLoading: false });
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { token } = await authService.login(email, password);
          localStorage.setItem('admin_token', token);
          
          const user = await authService.getProfile();
          set({ user: user as AdminUser, token });
        } catch (error: any) {
          const message = error.message || 'Login failed. Please try again.';
          set({ error: message });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        localStorage.removeItem('admin_token');
        set({ user: null, token: null });
      },

      resetError: () => set({ error: null }),
      setUser: (user) => set({ user }),
    }),
    {
      name: 'admin-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);