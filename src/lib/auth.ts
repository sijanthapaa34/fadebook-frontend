import api from './api';
import { jwtDecode } from 'jwt-decode';
import { User, UserRole } from '../models/models';

interface JWTPayload {
  role: string;
  sub: string;
  email: string;
}
export interface RegisterCustomerRequest { name: string; email: string; phone?: string; password: string; preferences?: string; }

export const login = async (email: string, password: string): Promise<{
  user: User;
  token: string;
}> => {
  const res = await api.post('/auth/login', { email, password });

  const token = res.data.token;
  if (!token) throw new Error('No token returned');

  const decoded: JWTPayload = jwtDecode(token);

  const user: User = {
    id: decoded.sub,
    email: decoded.email,
    role: decoded.role.toUpperCase() as UserRole,
  };

  return { user, token };
};

export const registerCustomer = async (data: RegisterCustomerRequest): Promise<{ user: User; token: string }> => {
  const res = await api.post('/auth/customer', data);
  const token = res.data.token;
  if (!token) throw new Error('No token returned from registration');

  const decoded: JWTPayload = jwtDecode(token);

  const user: User = {
    id: decoded.sub,
    email: decoded.email,
    role: decoded.role.toUpperCase() as UserRole,
  };

  return { user, token };
};