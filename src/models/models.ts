export type UserRole = 'CUSTOMER' | 'BARBER';

// Base user (from JWT)
export interface User {
  id: number;       // from JWT sub
  email: string;    // from JWT
  role: UserRole;   // from JWT
  name: string;
  phone?: string;
  profilePicture?: string;
}

// Customer info (fetched from backend)
export interface Customer extends User {
  avatar?: string;
  points?: number;
  totalBookings?: number;
  preferences?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'VIP';
}

// Barber info (fetched from backend)
export interface Barber extends User {
  avatar?: string; // profilePicture
  bio?: string;
  experienceYears?: number;
  workingHours?: { start: string; end: string };
  rating?: number;
  reviewCount?: number;
  workImages?: string[];
  available?: boolean;
  isActive?: boolean;
  commissionRate?: number;
  skills?: string[];
  shopId?: number;
}

// src/types/barbershop.ts
export interface Barbershop {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string | null;
  postalCode: string;
  shopImages?: string[];
  phone: string;
  email: string;
  website: string | null;
  operatingHours: string;
  profilePicture: string;
  rating: number;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// Service info
export interface Service {
  id: number;
  name: string;
  duration: number; // in minutes
  price: number;
  serviceImages?: string[];
  category: string;
  shopId: number;
}

// Appointment info
export interface Appointment {
  id: number;
  customerId: number;
  barberId: number;
  shopId: number;
  customerName: string;
  barberName: string;
  shopName: string;
  serviceIds: number[];
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'missed';
  totalPrice: number;
  loyaltyDiscount?: number;
}

// Review info
export interface Review {
  id: number;
  customerId: number;
  customerName?: string;
  rating: number;
  comment: string;
  targetType: string;
  images?: string[];
  targetId: number;
  date: string;
}

// Loyalty points
export interface LoyaltyPoints {
  customerId: string;
  points: number;
  history: { date: string; points: number; description: string }[];
}
// Add these to your existing models.ts file

export interface ServiceDTO {
  id: number;
  name: string;
  description: string;
  images: string[];
  price: number;
  durationMinutes: number;
  barberShop: string;
}

export interface BarbershopDTO {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string | null;
  postalCode: string;
  shopImages?: string[];
  phone: string;
  email: string;
  website: string | null;
  operatingHours: string;
  profilePicture?: string;
  rating: number;
}

export interface CustomerDTO {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  profilePicture?: string;
}

export interface BarberDTO {
  id: number;
  name: string;
  barbershop: string;
  active: boolean;
  email: string;
  phone: string;
  bio: string;
  workImages?: string[];
  profilePicture: string | null;
  rating: number;
  experienceYears: number;
  available: boolean;
}
export interface ReviewDTO {
  id: number;
  customerId: number;
  customerName?: string;
  rating: number;
  comment: string;
  targetType: string;
  images?: string[];
  targetId: number;
  date: string;
}

export interface TimeSlotDTO {
  startTime: string; // LocalDateTime string e.g. "2023-10-27T09:00:00"
  endTime: string;
}

export interface AvailableSlotsResponseDTO {
  date: string;
  availableSlots: TimeSlotDTO[];
  bookedSlots: TimeSlotDTO[];
}

export interface CreateAppointmentRequest {
  barberId: number;
  barbershopId: number; 
  serviceIds: number[];
  scheduledTime: string; // Format: "YYYY-MM-DDTHH:mm:ss"
}


export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED';

export interface AppointmentDetailsResponse {
  appointmentId: number;
  customerId: number;
  customerName: string;
  barberId: number;
  barberName: string;
  barbershopId: number;
  barbershopName: string;
  services: ServiceItemDTO[];
  totalPrice: number;
  totalDurationMinutes: number;
  status: AppointmentStatus;
  scheduledTime: string;
  checkInTime?: string;
  completedTime?: string;
  paymentStatus: PaymentStatus;
  paidAmount?: number;
  paymentMethod?: string;
  customerNotes?: string;
  barberNotes?: string;
  createdAt: string;
}

export interface ServiceItemDTO {
  serviceId: number; 
  name: string;
  price: number;
  durationMinutes: number;

}

export interface RescheduleData {
  appointmentId: number;
  shopId: number;
  shopName: string;
  services: ServiceItemDTO[]; 
  barberId: number;
  barberName: string;
  price: number;    
  duration: number; 
}

export interface FetchServicesByShopParams {
  shopId: number | string;
  page?: number;
  size?: number;
}

export interface FetchBarbersByShopParams {
  shopId: number | string;
  page?: number;
  size?: number;
}

export interface ReviewsByShopParams {
  shopId: number | string;
  page?: number;
  size?: number;
}
export interface ReviewsByBarberParams {
  barberId: number | string;
  page?: number;
  size?: number;
}
