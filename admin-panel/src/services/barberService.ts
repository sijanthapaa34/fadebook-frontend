// src/api/barberService.ts
import api from '../api/api';
import { BarberDTO, PageResponse, FetchBarbersByShopParams ,UpdateBarberRequest, ChangePasswordRequest} from '../models/models';

export const fetchBarbersByShop = async ({ shopId, page = 0, size = 10 }: FetchBarbersByShopParams): Promise<PageResponse<BarberDTO>> => {
  const response = await api.get<PageResponse<BarberDTO>>(`/barbers/barbershop/${shopId}`, {
    params: { page, size },
  });
  return response.data;
};

export const fetchBarberById = async (id: number): Promise<BarberDTO> => {
  const response = await api.get<BarberDTO>(`/barbers/${id}`);
  return response.data;
};
export const updateBarberProfile = async (barberId: number, data: UpdateBarberRequest): Promise<BarberDTO> => {
  const response = await api.put<BarberDTO>(`/barbers/${barberId}/update`, data);
  return response.data;
};

export const changePassword = async (barberId: number, data: ChangePasswordRequest): Promise<void> => {
  await api.put(`/barbers/${barberId}/change-password`, data);
};