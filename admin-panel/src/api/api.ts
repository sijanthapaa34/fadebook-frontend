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
    if (error.response?.status === 401) {
      // FIX: Clear BOTH keys to fully log out
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin-auth-storage'); // <--- This is the crucial fix
      
      // Force reload to clear Zustand's memory state
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default api;