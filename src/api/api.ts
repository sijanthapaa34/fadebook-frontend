import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import { Platform } from 'react-native';
import { emitUnauthorized } from './authEvents';

const getBaseURL = () => {
  if (Platform.OS === 'android') return 'http://10.0.2.2:8080/api';
  return 'http://localhost:8080/api';
};

const API_BASE_URL = getBaseURL();

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
        config.headers.Authorization = `Bearer ${credentials.password}`;
      }
    }
  } catch (err) {
    console.error('Error reading token from Keychain:', err);
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor — on 401, emit event so authStore can logout
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      emitUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default api;