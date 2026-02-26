// src/api/barbershopService.ts
import api from './api';
import { PageResponse, BarbershopDTO } from '../models/models';
import { FetchShopsParams } from '../models/models';

export const fetchShops = async ({ page, size, search, latitude, longitude }: FetchShopsParams): Promise<PageResponse<BarbershopDTO>> => {
  
  let url = '';
  const params: any = { page, size };

  if (search && search.length > 1) {
    url = `/barbershop/search/${encodeURIComponent(search)}`;
  } else if (latitude && longitude) {
    url = '/barbershop/nearby';
    params.latitude = latitude;
    params.longitude = longitude;
    params.radiusKm = 10.0;
  } else {
    url = '/barbershop/top-rated';
  }

  const response = await api.get<PageResponse<BarbershopDTO>>(url, { params });
  return response.data;
};

export const fetchBarbershopById = async (id: number): Promise<BarbershopDTO> => {
  const response = await api.get<BarbershopDTO>(`/barbershop/${id}`);
  return response.data;
};