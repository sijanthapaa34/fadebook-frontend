// src/services/appointmentService.ts
import api from '../api/api';
import type { PageResponse, AppointmentDetailsResponse } from '@/models/models';

export const appointmentService = {
  getShopAppointments: async (
    shopId: number,
    filter?: 'today' | 'upcoming' | 'past' | null,
    page: number = 0,
    size: number = 10
  ): Promise<PageResponse<AppointmentDetailsResponse>> => {
    const params: Record<string, any> = { page, size };
    if (filter) {
      params.filter = filter;
    }
    const response = await api.get<PageResponse<AppointmentDetailsResponse>>(
      `/appointment/shop/${shopId}/all`,
      { params }
    );
    return response.data;
  },

  getAppointmentDetails: async (appointmentId: number): Promise<AppointmentDetailsResponse> => {
    const response = await api.get<AppointmentDetailsResponse>(`/appointment/${appointmentId}`);
    return response.data;
  },
};
