// src/api/client.ts
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

const API_BASE_URL = 'http://localhost:8080/api';

interface JWTPayload {
  exp: number;
  email: string;
  role: string;
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const isTokenExpiringSoon = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    const currentTime = Date.now() / 1000;
    const timeUntilExpiry = decoded.exp - currentTime;
    // Refresh if token expires in less than 5 minutes (300 seconds)
    return timeUntilExpiry < 300;
  } catch {
    return true;
  }
};

const refreshToken = async (): Promise<string> => {
  const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
    }
  });
  return response.data.token;
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('admin_token');
  
  if (token && config.headers) {
    // Check if token is expiring soon and refresh it
    if (isTokenExpiringSoon(token) && !config.url?.includes('/auth/refresh')) {
      if (isRefreshing) {
        // Wait for the token to be refreshed
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          const newToken = localStorage.getItem('admin_token');
          if (newToken && config.headers) {
            config.headers.Authorization = `Bearer ${newToken}`;
          }
          return config;
        }).catch(() => config);
      }

      isRefreshing = true;

      try {
        const newToken = await refreshToken();
        localStorage.setItem('admin_token', newToken);
        config.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
      } catch (error) {
        processQueue(error as Error, null);
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin-auth-storage');
        window.location.href = '/login';
      } finally {
        isRefreshing = false;
      }
    } else {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and NOT a login/refresh request, try to refresh token
    const isAuthRequest = originalRequest.url?.includes('/auth/login') || 
                         originalRequest.url?.includes('/auth/refresh');
    
    if (error.response?.status === 401 && !isAuthRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          const token = localStorage.getItem('admin_token');
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const newToken = await refreshToken();
        localStorage.setItem('admin_token', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin-auth-storage');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // For other 401 errors or if refresh failed, logout
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin-auth-storage');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;