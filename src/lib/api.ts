// src/api/api.ts
import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import { Platform } from 'react-native';

// Get base URL depending on platform
const getBaseURL = () => {
    if (Platform.OS === 'ios') return 'http://localhost:8080/api';
    if (Platform.OS === 'android') return 'http://10.0.2.2:3000/api';
};

const API_BASE_URL = getBaseURL();

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Request interceptor: attach token from Keychain
api.interceptors.request.use(async (config) => {
  try {
    const credentials = await Keychain.getGenericPassword();
    if (credentials) {
      config.headers.Authorization = `Bearer ${credentials.password}`;
    }
  } catch (err) {
    console.error('Error reading token from Keychain:', err);
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor: handle 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        // Clear Keychain token
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
