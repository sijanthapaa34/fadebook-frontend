import api from './api';
import { BarberDTO, PageResponse , FetchBarbersByShopParams} from '../models/models';

export const fetchBarbersByShop = async ({ shopId, page = 0, size = 10 }: FetchBarbersByShopParams): Promise<PageResponse<BarberDTO>> => {
  const response = await api.get(`/barbers/barbershop/${shopId}`, {
    params: { page, size },
  });
  return response.data;
};

export const fetchBarberById = async ({ barberId }: { barberId: number }): Promise<BarberDTO> => {
  const response = await api.get(`/barbers/${barberId}`);
  return response.data;
};