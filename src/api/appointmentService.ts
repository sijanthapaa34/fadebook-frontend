// src/api/appointmentService.ts
import api from './api';
import { 
  PageResponse, ServiceDTO, BarberDTO, AvailableSlotsResponseDTO, 
  CreateAppointmentRequest, AppointmentDetailsResponse 
} from '../models/models';

interface FetchServicesParams {
  shopId: number | string;
  page?: number;
  size?: number;
}

interface FetchBarbersParams {
  shopId: number | string;
  page?: number;
  size?: number;
}

export const fetchServicesByShop = async ({ shopId, page = 0, size = 10 }: FetchServicesParams): Promise<PageResponse<ServiceDTO>> => {
  const response = await api.get(`/service/barberShop/${shopId}`, {
    params: { page, size },
  });
  return response.data;
};

export const fetchBarbersByShop = async ({ shopId, page = 0, size = 10 }: FetchBarbersParams): Promise<PageResponse<BarberDTO>> => {
  const response = await api.get(`/barbers/barbershop/${shopId}`, {
    params: { page, size },
  });
  return response.data;
};

export const fetchAvailableSlots = async (
  barberId: number, 
  serviceIds: number[], 
  date: string
): Promise<AvailableSlotsResponseDTO> => {
  const response = await api.get(`/appointment/${barberId}/availability`, {
    params: {
      serviceIds: serviceIds, 
      date,
    },
  });
  return response.data;
};

export const bookAppointment = async (data: CreateAppointmentRequest): Promise<AppointmentDetailsResponse> => {
  const response = await api.post<AppointmentDetailsResponse>('/appointment', data);
  return response.data;
};

// --- NEW APIS ---

export const fetchUpcomingAppointments = async (page = 0, size = 10): Promise<PageResponse<AppointmentDetailsResponse>> => {
  const response = await api.get('/appointment/upcoming', { params: { page, size } });
  return response.data;
};

export const fetchPastAppointments = async (page = 0, size = 10): Promise<PageResponse<AppointmentDetailsResponse>> => {
  const response = await api.get('/appointment/past', { params: { page, size } });
  return response.data;
};

export const rescheduleAppointment = async (appointmentId: number, newDateTime: string): Promise<AppointmentDetailsResponse> => {
  // Backend expects @RequestBody RescheduleAppointmentRequest
  const response = await api.put<AppointmentDetailsResponse>(`/appointment/${appointmentId}/reschedule`, { 
    newDateTime 
  });
  return response.data;
};

export const cancelAppointment = async (appointmentId: number): Promise<void> => {
  await api.put(`/appointment/${appointmentId}/cancel`);
};