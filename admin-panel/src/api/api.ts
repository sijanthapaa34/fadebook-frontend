// src/api/client.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('admin_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and NOT a login request, clear storage and redirect
    // We don't want to redirect if the user is just typing the wrong password on the login screen
    const isLoginRequest = originalRequest.url?.includes('/auth/login');
    
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin-auth-storage');
      
      // Force reload to clear Zustand's memory state
      window.location.href = '/login'; 
    }
    
    return Promise.reject(error);
  }
);

export default api;