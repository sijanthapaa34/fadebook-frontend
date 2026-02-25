// src/api/customerService.ts
import api from './api';
import { CustomerDTO } from '../models/models';

export interface UpdateUserRequest {
  name: string;
  phone: string;
  profilePicture?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const getCustomerProfile = async (customerId: number): Promise<CustomerDTO> => {
  const response = await api.get<CustomerDTO>(`/customers/${customerId}`);
  return response.data;
};

export const updateCustomerProfile = async (customerId: number, data: UpdateUserRequest): Promise<CustomerDTO> => {
  const response = await api.put<CustomerDTO>(`/customers/${customerId}/update`, data);
  return response.data;
};

export const changePassword = async (customerId: number, data: ChangePasswordRequest): Promise<void> => {
  await api.put(`/customers/${customerId}/password`, data);
};