// src/api/barberService.ts
import api from '../api/api';
import { BarberDTO, PageResponse, FetchBarbersByShopParams ,UpdateBarberRequest, ChangePasswordRequest, RegisterBarberRequest} from '../models/models';

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
  const response = await api.patch<BarberDTO>(`/barbers/${barberId}/update`, data);
  return response.data;
};

export const changePassword = async (barberId: number, data: ChangePasswordRequest): Promise<void> => {
  await api.patch(`/barbers/${barberId}/change-password`, data);
};

export const registerBarber = async (shopId: number, data: RegisterBarberRequest): Promise<BarberDTO> => {
  const response = await api.post<BarberDTO>(`/auth/barber/${shopId}`, data);
  return response.data;
};
export const activateBarber = async (shopId: number, barberId: number) => {
  await api.patch(`/barbers/${shopId}/activate/${barberId}`);
};

export const deactivateBarber = async (shopId: number, barberId: number) => {
  await api.patch(`/barbers/${shopId}/deactivate/${barberId}`);
};