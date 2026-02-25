// src/api/appointmentService.ts
import api from './api';
import { 
  PageResponse, ServiceDTO, BarberDTO, AvailableSlotsResponseDTO, 
  CreateAppointmentRequest, AppointmentDetailsResponse 
} from '../models/models';

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
  const response = await api.put<AppointmentDetailsResponse>(`/appointment/${appointmentId}/reschedule`, { 
    newDateTime 
  });
  return response.data;
};

export const cancelAppointment = async (appointmentId: number): Promise<void> => {
  await api.put(`/appointment/${appointmentId}/cancel`);
};

export const fetchBarberAppointments = async (
  barberId: number,
  startDate: string, // format: YYYY-MM-DD
  endDate: string,   // format: YYYY-MM-DD
  page = 0,
  size = 50 
): Promise<PageResponse<AppointmentDetailsResponse>> => {
  const response = await api.get(`/appointment/barber/${barberId}`, {
    params: {
      startDate,
      endDate,
      page,
      size,
    },
  });
  return response.data;
};
export const fetchBarberEarnings = async (
  barberId: number,
  startDate: string,
  endDate: string
): Promise<number> => {
  const response = await api.get(`/appointment/barber/${barberId}/earnings`, {
    params: {
      startDate,
      endDate,
    },
  });
  return response.data; // Backend returns a simple Double/Number
};