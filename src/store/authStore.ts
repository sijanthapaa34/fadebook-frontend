// src/store/authStore.ts
import { create } from 'zustand';
import * as Keychain from 'react-native-keychain';
import { User, UserRole, RegisterCustomerRequest } from '../models/models'; // Ensure UserRole is imported
import { 
  loginRequest, 
  registerRequest, 
  googleSignInRequest 
} from '../api/authService';

// FIX: Return the proper UserRole type instead of hardcoded strings
const normalizeRole = (role: any): UserRole => {
  if (!role) return 'CUSTOMER'; // Default fallback
  
  const upperRole = role.toString().toUpperCase();
  
  // Validate against known roles to prevent invalid data
  // Adjust this list to match your `UserRole` type in models.ts
  const validRoles: UserRole[] = ['CUSTOMER', 'BARBER'];
  
  if (validRoles.includes(upperRole as UserRole)) {
    return upperRole as UserRole;
  }
  
  // Fallback if role is unknown
  console.warn(`Unknown role detected: ${role}, defaulting to CUSTOMER`);
  return 'CUSTOMER';
};

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterCustomerRequest) => Promise<User | null>;
  googleLogin: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => Promise<void>; 
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    try {
      set({ isLoading: true });
      const credentials = await Keychain.getGenericPassword();
      
      if (credentials) {
        // 1. Parse User
        const parsedUser: User = JSON.parse(credentials.username);
        
        // 2. Validate & Normalize role on init
        parsedUser.role = normalizeRole(parsedUser.role);
        
        // 3. Optional: Check if token is expired here (if you have logic for it)
        // otherwise, the API interceptor will handle 401s
        
        set({ 
          user: parsedUser, 
          token: credentials.password, 
          isAuthenticated: true 
        });
      } else {
        // No credentials found
        set({ user: null, token: null, isAuthenticated: false });
      }
    } catch (error) {
      console.error('Error initializing auth store:', error);
      // Clear potentially corrupt storage
      await Keychain.resetGenericPassword();
      set({ user: null, token: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    // Service throws error -> UI catches it. Good.
    const { user, token } = await loginRequest(email, password);
    
    const safeUser = { ...user, role: normalizeRole(user.role) };
    
    await Keychain.setGenericPassword(JSON.stringify(safeUser), token);
    set({ user: safeUser, token, isAuthenticated: true });
  },

  register: async (data) => {
    const { user, token } = await registerRequest(data);
    
    const userWithRole = { ...user, role: normalizeRole(user.role || 'CUSTOMER') };
    
    await Keychain.setGenericPassword(JSON.stringify(userWithRole), token);
    set({ user: userWithRole, token, isAuthenticated: true });
    return userWithRole; 
  },

  googleLogin: async () => {
    const { user, token } = await googleSignInRequest();
    
    const userWithRole = { ...user, role: normalizeRole(user.role || 'CUSTOMER') };
    
    await Keychain.setGenericPassword(JSON.stringify(userWithRole), token);
    set({ user: userWithRole, token, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await Keychain.resetGenericPassword();
    } catch (e) {
      console.warn('Failed to reset keychain on logout', e);
    }
    set({ user: null, token: null, isAuthenticated: false });
  },

  setUser: async (updatedUser) => {
    const token = get().token;
    const safeUser = { ...updatedUser, role: normalizeRole(updatedUser.role) };

    if (token) {
        try {
            await Keychain.setGenericPassword(JSON.stringify(safeUser), token);
        } catch (e) {
            console.warn('Failed to update user in Keychain', e);
        }
    }
    set({ user: safeUser });
  },
}));