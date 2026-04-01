// src/api/authService.ts
import api from '../api/api';
import type { User } from '@/models/models';
import type { AdminUser } from '@/store/authStore';
import axios from 'axios';

export interface LoginResponse {
  token: string;
}

// --- Helper: Extract Readable Error Message ---
const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;

    // Handle specific HTTP status codes
    if (status === 401) {
      return 'Invalid email or password.';
    }
    if (status === 403) {
      return 'Access denied. Your account may be disabled.';
    }
    if (status === 404) {
      return 'Service not found (404).';
    }
    if (status === 500) {
      return 'Server error. Please try again later.';
    }

    // Try to read backend message
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    
    // Network Error
    if (error.request) {
      return 'Network error. Check your internet connection.';
    }
    
    return error.message || 'An unexpected request error occurred.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred.';
};

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>('/auth/login', { email, password });
      return response.data;
    } catch (err) {
      // Throw a clean error message that the UI can display directly
      throw new Error(getErrorMessage(err));
    }
  },

  logout: async (): Promise<void> => {
    try {
      // Optional: Call backend logout endpoint
      // await api.post('/auth/logout'); 
    } finally {
      localStorage.removeItem('admin_token');
    }
  },

  getProfile: async (): Promise<AdminUser> => {
    try {
      const response = await api.get<AdminUser>('/auth/me');
      return response.data;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },
};