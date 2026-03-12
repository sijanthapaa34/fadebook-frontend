// src/api/adminService.ts
import api from '../api/api';
import type { AdminDashboardResponse, ShopAdminDashboardResponse } from '@/models/models';

export const adminService = {
  getDashboard: async (): Promise<AdminDashboardResponse> => {
    const response = await api.get<AdminDashboardResponse>('/admin/main/dashboard');
    return response.data;
  },
};


export const getShopAdminDashboard = async (adminId: number): Promise<ShopAdminDashboardResponse> => {
  const response = await api.get<ShopAdminDashboardResponse>(`/admin/${adminId}/dashboard`);
  return response.data;
};

export const updateAdminProfile = async (adminId: number, data: { name: string; phone: string }): Promise<void> => {
  await api.put(`/admin/${adminId}/update`, data);
};

// Standalone export for changing password
export const changeAdminPassword = async (adminId: number, data: { currentPassword: string; newPassword: string }): Promise<void> => {
  await api.put(`/admin/${adminId}/change-password`, data);
};