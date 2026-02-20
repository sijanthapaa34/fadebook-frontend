import api from './api'; // Assuming you have an axios instance configured
import { PageResponse, ServiceDTO, BarberDTO, AvailableSlotsResponseDTO, CreateAppointmentRequest, AppointmentDetailsResponse } from '../models/models';

interface FetchServicesParams {
  shopId: string;
  page?: number;
  size?: number;
}

interface FetchBarbersParams {
  shopId: string;
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
  // Using the endpoint structure provided: /api/barbers/barbershop/{id}
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