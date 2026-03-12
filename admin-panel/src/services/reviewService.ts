import api from '../api/api';
import { PageResponse, ReviewDTO } from '../models/models';

export const getReviewsofShop = async (shopId: number): Promise<PageResponse<ReviewDTO>> => {
  const response = await api.get<PageResponse<ReviewDTO>>(`/barbershop/${shopId}/reviews`);
  return response.data;}


export const getReviewsofBarber = async (barberId: number): Promise<PageResponse<ReviewDTO>> => {
  const response = await api.get<PageResponse<ReviewDTO>>(`/reviews/barber/${barberId}`, {
    params: { page: 0, size: 10 }
  });
  return response.data;
};