import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import { Platform } from 'react-native';

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
    // FIX: Only attach token from Keychain if NOT already set manually
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

// Response interceptor
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await Keychain.resetGenericPassword();
        const { reset } = require('../navigation/NavigationService');
        reset('Login');
      } catch (err) {
        console.error('Error handling 401 response:', err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;