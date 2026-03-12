// src/api/barbershopService.ts
import api from '../api/api';
import { PageResponse, BarbershopDTO } from '../models/models';

export const fetchShopsBySearch = async (search: string): Promise<PageResponse<BarbershopDTO>> => {
  const response = await api.get<PageResponse<BarbershopDTO>>(`/barbershop/search/${encodeURIComponent(search)}`, { params: { page: 0, size: 100 } });
  return response.data;
};

export const fetchBarbershopById = async (id: number): Promise<BarbershopDTO> => {
  const response = await api.get<BarbershopDTO>(`/barbershop/${id}`);
  return response.data;
};
export const fetchAllBarbershop = async (): Promise<PageResponse<BarbershopDTO>> => {
  const response = await api.get<PageResponse<BarbershopDTO>>(`/barbershop/all`, {
    params: { page: 0, size: 100 },
  });
  return response.data;
};
export const updateBarbershop = async (shopId: number, data: Partial<BarbershopDTO>): Promise<BarbershopDTO> => {
  const response = await api.put<BarbershopDTO>(`/barbershop/${shopId}`, data);
  return response.data;
};

export const uploadShopImage = async (shopId: number, file: File): Promise<BarbershopDTO> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<BarbershopDTO>(`/barbershop/${shopId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const removeShopImage = async (shopId: number, imageUrl: string): Promise<BarbershopDTO> => {
  const response = await api.delete<BarbershopDTO>(`/barbershop/${shopId}/images`, { 
    data: imageUrl,
    headers: { 'Content-Type': 'application/json' } 
  });
  return response.data;
};