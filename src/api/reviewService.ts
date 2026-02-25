import api from './api';
import { PageResponse, ReviewDTO, ReviewsByBarberParams, ReviewsByShopParams } from '../models/models';

export const getReviewsofShop = async ({ shopId, page = 0, size = 10 }: ReviewsByShopParams): Promise<PageResponse<ReviewDTO>> => {
  const response = await api.get(`/review/shop/${shopId}`, {
    params: { page, size },
  });
  return response.data;
};
export const getReviewsofBarber = async ({ barberId, page = 0, size = 10 }: ReviewsByBarberParams): Promise<PageResponse<ReviewDTO>> => {
  const response = await api.get(`/review/barber/${barberId}`, {
    params: { page, size },
  });
  return response.data;
};
export const fetchReviewOfService = async ({ shopId, serviceId, page = 0, size = 10 }: ReviewsByShopParams & { serviceId: number }): Promise<PageResponse<ReviewDTO>> => {
  const response = await api.get(`/review/service/${serviceId}`, {
    params: { page, size },
  });
  return response.data;
};