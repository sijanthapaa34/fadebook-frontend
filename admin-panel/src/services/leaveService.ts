import api from '../api/api';
import type { BarberLeaveDTO, LeaveRequestDTO, PageResponse } from '../models/models';

export const applyLeave = async (barberId: number, data: LeaveRequestDTO): Promise<string> => {
  const response = await api.post(`/leave/${barberId}`, data);
  return response.data; // Returns success message string
};

export const getBarberLeaves = async (barberId: number, page = 0, size = 10): Promise<PageResponse<BarberLeaveDTO>> => {
  const response = await api.get(`/leave/barber/${barberId}`, {
    params: { page, size }
  });
  return response.data;
};

export const getShopLeaves = async (shopId: number, page = 0, size = 10): Promise<PageResponse<BarberLeaveDTO>> => {
  const response = await api.get(`/leave/shop/${shopId}`, {
    params: { page, size }
  });
  return response.data;
};

export const approveLeave = async (leaveId: number): Promise<BarberLeaveDTO> => {
  const response = await api.put(`/leave/${leaveId}/approve`);
  return response.data;
};

export const rejectLeave = async (leaveId: number): Promise<BarberLeaveDTO> => {
  const response = await api.put(`/leave/${leaveId}/reject`);
  return response.data;
};