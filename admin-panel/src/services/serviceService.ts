import api from '../api/api';
import {ServiceDTO, PageResponse , FetchServicesByShopParams, RegisterServiceRequest, ServiceUpdateRequest} from '../models/models';

export const fetchServicesByShop = async ({ shopId, page = 0, size = 10 }: FetchServicesByShopParams): Promise<PageResponse<ServiceDTO>> => {
  const response = await api.get(`/service/barbershop/${shopId}`, {
    params: { page, size },
  });
  return response.data;
};

export const fetchServiceById = async ({ serviceId }: { serviceId: number }): Promise<ServiceDTO> => {
  const response = await api.get(`/service/${serviceId}`);
  return response.data;
};

export const addService = async (shopId: number, data: RegisterServiceRequest): Promise<ServiceDTO> => {
  const response = await api.post<ServiceDTO>(`/service/${shopId}`, data);
  return response.data;
};

export const updateService = async (barbershopId: number, serviceId: number, data: ServiceUpdateRequest): Promise<ServiceDTO> => {
  const response = await api.patch<ServiceDTO>(`/service/${barbershopId}/update/${serviceId}`, data);
  return response.data;
};
export const activateService = async (shopId: number, serviceId: number) => {
  await api.patch(`/service/${shopId}/activate/${serviceId}`);
};

export const deactivateService = async (shopId: number, serviceId: number) => {
  await api.patch(`/service/${shopId}/deactivate/${serviceId}`);
};
