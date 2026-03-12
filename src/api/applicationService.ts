import api from './api';
import type { ApplicationResponseDTO, ShopApplicationData, BarberApplicationData } from '../models/models';


export const submitApplication = async (
  data: BarberApplicationData | ShopApplicationData
): Promise<ApplicationResponseDTO> => {
  const response = await api.post<ApplicationResponseDTO>('/applications', data);
  return response.data;
};