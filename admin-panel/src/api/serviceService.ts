import api from './api';
import {ServiceDTO, PageResponse , FetchServicesByShopParams} from '../models/models';

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