export type UserRole = 'CUSTOMER' | 'BARBER';

// Base user (from JWT)
export interface User {
  id: number;       // from JWT sub
  email: string;    // from JWT
  role: UserRole;   // from JWT
  name: string;
  phone?: string;
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
  address: string;
  city: string;
  state: string | null;
  postalCode: string;
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
  category: string;
  shopId: number;
}

// Appointment info
export interface Appointment {
  id: string;
  customerId: string;
  barberId: string;
  shopId: string;
  customerName: string;
  barberName: string;
  shopName: string;
  serviceIds: string[];
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'missed';
  totalPrice: number;
  loyaltyDiscount?: number;
}

// Review info
export interface Review {
  id: string;
  customerId: string;
  customerName?: string;
  barberId: string;
  rating: number;
  comment: string;
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
  price: number;
  durationMinutes: number;
  barberShop: string;
}

export interface BarberDTO {
  id: number;
  name: string;
  barbershop: string;
  active: boolean;
  email: string;
  phone: string;
  bio: string;
  profilePicture: string | null;
  rating: number;
  experienceYears: number;
  available: boolean;
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
  services: ServiceDTO[];
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
// Add this interface if not already present
export interface ServiceItemDTO {
  serviceId: number; // Matches your backend
  name: string;
  price: number;
  durationMinutes: number;
}

// Update RescheduleData interface
export interface RescheduleData {
  appointmentId: number;
  shopId: number;
  shopName: string;
  services: ServiceItemDTO[]; // CHANGED: Pass the whole array
  barberId: number;
  barberName: string;
  price: number;    // Total price
  duration: number; // Total duration
}