// src/api/appointmentService.ts
import api from './api';
import { 
  PageResponse, AvailableSlotsResponseDTO, 
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
  // Increase timeout to 60 seconds for cancellation (includes refund processing)
  await api.put(`/appointment/${appointmentId}/cancel`, {}, { timeout: 60000 });
};

export const fetchBarberAppointments = async (
  barberId: number,
  startDate: string,
  endDate: string,  
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
  return response.data; 
};

export const fetchBarberUpcoming = async (
  barberId: number,
  page = 0,
  size = 10
): Promise<PageResponse<AppointmentDetailsResponse>> => {
  const response = await api.get(`/appointment/barber/${barberId}/upcoming`, { 
    params: { page, size } 
  });
  return response.data;
};

export const fetchBarberPast = async (
  barberId: number,
  page = 0,
  size = 10
): Promise<PageResponse<AppointmentDetailsResponse>> => {
  const response = await api.get(`/appointment/barber/${barberId}/past`, { 
    params: { page, size } 
  });
  return response.data;
};

export const notifyCustomer = async (appointmentId: number): Promise<{ message: string; customerName: string }> => {
  const response = await api.post(`/appointment/${appointmentId}/notify`);
  return response.data;
};