// src/stores/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService } from '@/api/authService';
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

  // Actions
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginAs: (role: AdminRole) => void; // For Demo
  logout: () => void;
  resetError: () => void;
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
        // 1. Check if we have a token in localStorage manually (because zustand persist might not be hydrated yet)
        const storedToken = localStorage.getItem('admin_token');
        if (!storedToken) {
          set({ isInitialized: true, user: null });
          return;
        }

        set({ isLoading: true });
        try {
          // 2. Validate token with backend
          const user = await authService.getProfile();
          set({ user: user as AdminUser, token: storedToken, isInitialized: true });
        } catch (error) {
          // Token invalid or expired
          localStorage.removeItem('admin_token');
          set({ user: null, token: null, isInitialized: true });
        } finally {
          set({ isLoading: false });
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { token} = await authService.login(email, password);
          
          // Store token separately for Axios interceptor access
          localStorage.setItem('admin_token', token);
          
          const user = await authService.getProfile();
          set({ user: user as AdminUser, token });
        } catch (error: any) {
          const message = error.response?.data?.message || 'Login failed. Please try again.';
          set({ error: message });
          throw new Error(message);
        } finally {
          set({ isLoading: false });
        }
      },

      loginAs: (role) => {
        const mockUser: AdminUser = 
          role === 'MAIN_ADMIN'
            ? { id: 0, email: 'main@admin.com', name: 'Super Admin', role: 'MAIN_ADMIN' }
            : { id: 1, email: 'shop@admin.com', name: 'Shop Admin', role: 'BARBERSHOP_ADMIN', shopId: 1 };

        const mockToken = 'demo-mock-token';
        
        localStorage.setItem('admin_token', mockToken);
        set({ user: mockUser, token: mockToken });
      },

      logout: () => {
        localStorage.removeItem('admin_token');
        set({ user: null, token: null });
      },

      resetError: () => set({ error: null }),
    }),
    {
      name: 'admin-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token }), // Only persist these
    }
  )
);