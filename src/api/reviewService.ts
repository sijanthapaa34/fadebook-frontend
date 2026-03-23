import api from './api';
import { 
  ReviewDTO, 
  CreateReviewRequest, 
  CreateReplyRequest, 
  ReviewType,
  PageResponse
} from '../models/models';

// FIX: Added customerId parameter to match backend controller
export const createReview = async (customerId: number, data: CreateReviewRequest): Promise<ReviewDTO> => {
  const response = await api.post(`/reviews/${customerId}`, data);
  return response.data;
};

export const getReviews = async (
  type: ReviewType, 
  targetId: number, 
  page = 0, 
  size = 10
): Promise<PageResponse<ReviewDTO>> => {
  const response = await api.get('/reviews', {
    params: { type, targetId, page, size }
  });
  return response.data;
};

export const replyToReview = async (
  reviewId: number, 
  replierId: number, 
  data: CreateReplyRequest
): Promise<ReviewDTO> => {
  const response = await api.post(`/reviews/${reviewId}/reply/${replierId}`, data);
  return response.data;
};