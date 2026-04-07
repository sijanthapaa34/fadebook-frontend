import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import { Platform } from 'react-native';
import { emitUnauthorized } from './authEvents';
import { jwtDecode } from 'jwt-decode';

const getBaseURL = () => {
  if (Platform.OS === 'android') return 'http://10.0.2.2:8080/api';
  return 'http://localhost:8080/api';
};

const API_BASE_URL = getBaseURL();

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

const refreshToken = async (currentToken: string): Promise<string> => {
  const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
    headers: {
      'Authorization': `Bearer ${currentToken}`
    }
  });
  return response.data.token;
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(async (config) => {
  try {
    if (!config.headers.Authorization && !config.headers.authorization) {
      const credentials = await Keychain.getGenericPassword();
      if (credentials) {
        const token = credentials.password;
        
        // Check if token is expiring soon and refresh it
        if (isTokenExpiringSoon(token) && !config.url?.includes('/auth/refresh')) {
          if (isRefreshing) {
            // Wait for the token to be refreshed
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            }).then(async () => {
              const newCredentials = await Keychain.getGenericPassword();
              if (newCredentials && config.headers) {
                config.headers.Authorization = `Bearer ${newCredentials.password}`;
              }
              return config;
            }).catch(() => config);
          }

          isRefreshing = true;

          try {
            const newToken = await refreshToken(token);
            await Keychain.setGenericPassword('token', newToken);
            config.headers.Authorization = `Bearer ${newToken}`;
            processQueue(null, newToken);
          } catch (error) {
            processQueue(error as Error, null);
            await Keychain.resetGenericPassword();
            emitUnauthorized();
          } finally {
            isRefreshing = false;
          }
        } else {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }
  } catch (err) {
    console.error('Error reading token from Keychain:', err);
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor — on 401, try to refresh token or emit event
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and NOT a login/refresh request, try to refresh token
    const isAuthRequest = originalRequest.url?.includes('/auth/login') || 
                         originalRequest.url?.includes('/auth/refresh') ||
                         originalRequest.url?.includes('/auth/google');
    
    if (error.response?.status === 401 && !isAuthRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(async () => {
          const credentials = await Keychain.getGenericPassword();
          if (credentials) {
            originalRequest.headers.Authorization = `Bearer ${credentials.password}`;
          }
          return api(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const credentials = await Keychain.getGenericPassword();
        if (credentials) {
          const newToken = await refreshToken(credentials.password);
          await Keychain.setGenericPassword('token', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        await Keychain.resetGenericPassword();
        emitUnauthorized();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // For other 401 errors or if refresh failed, logout
    if (error.response?.status === 401) {
      await Keychain.resetGenericPassword();
      emitUnauthorized();
    }
    
    return Promise.reject(error);
  }
);

export default api;