// src/api/api.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api'; 

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Request interceptor: Attaches the token to every request
api.interceptors.request.use(async (config) => {
  // Use the same key as defined in authService
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor: Handles global errors like 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('admin_token');
      // Force reload to trigger logout state
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default api;