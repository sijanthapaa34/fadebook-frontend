// src/api/authService.ts
import api from '../api/api';
import type { User } from '@/models/models';

export interface LoginResponse {
  token: string;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    // Assumes backend returns { token: "jwt...", user: {...} }
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    return response.data;
  },

  logout: async (): Promise<void> => {
    // Optional: Call backend logout endpoint to invalidate token server-side
    // await api.post('/auth/logout'); 
    localStorage.removeItem('admin_token');
  },

  getProfile: async (): Promise<User> => {
    // Endpoint to verify token and get current user data
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};