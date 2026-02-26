// src/api/customerService.ts
import api from './api';
import { CustomerDTO } from '../models/models';
import { UpdateCustomerRequest, ChangePasswordRequest } from '../models/models';

export const getCustomerProfile = async (customerId: number): Promise<CustomerDTO> => {
  const response = await api.get<CustomerDTO>(`/customers/${customerId}`);
  return response.data;
};

export const updateCustomerProfile = async (customerId: number, data: UpdateCustomerRequest): Promise<CustomerDTO> => {
  const response = await api.put<CustomerDTO>(`/customers/${customerId}/update`, data);
  return response.data;
};

export const changePassword = async (customerId: number, data: ChangePasswordRequest): Promise<void> => {
  await api.put(`/customers/${customerId}/change-password`, data);
};