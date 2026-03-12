import api from '../api/api';
import type { ApplicationResponseDTO, PageResponse } from '../models/models';

// Get Applications for Main Admin (Shops + Approved Barbers)
export const getMainAdminApplications = async (
  page: number = 0,
  size: number = 10
): Promise<PageResponse<ApplicationResponseDTO>> => {
  const response = await api.get<PageResponse<ApplicationResponseDTO>>('/applications/main-admin', {
    params: { page, size }
  });
  return response.data;
};

// Get Applications for Shop Admin (Pending Barbers for their shop)
export const getShopAdminApplications = async (
  shopId: number,
  page: number = 0,
  size: number = 10
): Promise<PageResponse<ApplicationResponseDTO>> => {
  const response = await api.get<PageResponse<ApplicationResponseDTO>>(`/applications/shop/${shopId}`, {
    params: { page, size }
  });
  return response.data;
};

// Get Single Application Details
export const getApplicationById = async (
  id: number
): Promise<ApplicationResponseDTO> => {
  const response = await api.get<ApplicationResponseDTO>(`/applications/${id}`);
  return response.data;
};

// Main Admin Approve
export const approveApplication = async (id: number): Promise<void> => {
  await api.patch(`/applications/${id}/approve`);
};

// Shop Admin Approve
export const approveByShopAdmin = async (id: number): Promise<void> => {
  await api.patch(`/applications/${id}/shop-approve`);
};

// Reject (Universal)
export const rejectApplication = async (id: number, reason: string): Promise<void> => {
  await api.patch(`/applications/${id}/reject`, { reason });
};