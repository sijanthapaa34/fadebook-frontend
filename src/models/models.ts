// src/models/models.ts

// ==========================================
// 1. ENUMS & BASE TYPES
// ==========================================

export type UserRole = 'CUSTOMER' | 'BARBER';

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED';

// Base User (from JWT / Auth Store)
export interface User {
  id: number;
  email: string;
  role: UserRole;
  name: string;
  phone?: string;
  profilePicture?: string;
}

// ==========================================
// 2. DOMAIN MODELS (Frontend Application State)
// ==========================================

// Customer Model (Used in App State)
export interface Customer extends User {
  avatar?: string;
  points?: number;
  totalBookings?: number;
  preferences?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'VIP';
}

// Barber Model (Used in App State)
// Note: Maps from BarberDTO (active -> isActive)
export interface Barber extends User {
  avatar?: string;
  bio?: string;
  experienceYears?: number;
  workingHours?: { start: string; end: string };
  rating?: number;
  reviewCount?: number;
  workImages?: string[];
  available?: boolean;
  isActive?: boolean; // Mapped from DTO 'active'
  commissionRate?: number;
  skills?: string[];
  shopId?: number;
}

// ==========================================
// 3. API DTOs (Backend Response Shapes)
// ==========================================

// --- Barber DTO ---
export interface BarberDTO {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  bio: string;
  active: boolean; // Backend field
  available: boolean;
  experienceYears: number;
  profilePicture?: string;
  rating: number;
  reviewCount?: number;
  shopId?: number;
  skills?: string[];
  workImages?: string[];
  barbershop: string; // Name of shop
}

// --- Customer DTO ---
export interface CustomerDTO {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  profilePicture?: string;
  // Add other fields backend sends (points, status, etc.)
}

// --- Barbershop DTO ---
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
  reviewCount?: number;
  rating: number;
  latitude?: number;
  longitude?: number;
}

// --- Service DTOs ---
export interface ServiceDTO {
  id: number;
  name: string;
  description: string;
  shopId: number;
  barbershop: string;
  images: string[];
  price: number;
  durationMinutes: number;
}

export interface ServiceItemDTO {
  serviceId: number; 
  name: string;
  price: number;
  durationMinutes: number;
}

// --- Appointment DTOs ---
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
  scheduledTime: string; // ISO String
  
  checkInTime?: string;
  completedTime?: string;
  
  paymentStatus: PaymentStatus;
  paidAmount?: number;
  paymentMethod?: string;
  
  customerNotes?: string;
  barberNotes?: string;
  
  createdAt: string;
}

// --- Review DTO ---
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

// --- Availability DTOs ---
export interface TimeSlotDTO {
  startTime: string; 
  endTime: string;
}

export interface AvailableSlotsResponseDTO {
  date: string;
  availableSlots: TimeSlotDTO[];
  bookedSlots: TimeSlotDTO[];
}

// ==========================================
// 4. API REQUEST TYPES
// ==========================================

export interface RegisterCustomerRequest { 
  name: string; 
  email: string; 
  phone?: string; 
  password: string; 
  preferences?: string; 
}

export interface CreateAppointmentRequest {
  barberId: number;
  barbershopId: number; 
  serviceIds: number[];
  scheduledTime: string; 
}

export interface UpdateCustomerRequest {
  name: string;
  phone: string;
}

export interface UpdateBarberRequest {
  name: string;
  phone: string;
  bio?: string;
  experienceYears?: number;
  skills?: string[];
  active?: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ==========================================
// 5. WRAPPERS & PAGINATION
// ==========================================

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface UploadResponse {
  url: string;
}

// ==========================================
// 6. QUERY PARAMS
// ==========================================

export interface FetchShopsParams {
  page: number;
  size: number;
  search?: string;
  latitude?: number | null;
  longitude?: number | null;
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

// ==========================================
// 7. LEGACY / UNUSED (Can be removed if not used elsewhere)
// ==========================================

export interface LoyaltyPoints {
  customerId: string;
  points: number;
  history: { date: string; points: number; description: string }[];
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


export interface BarberApplicationData {
  type: 'BARBER';
  name: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  profilePictureUrl?: string;
  experienceYears: number;
  skills: string[];
  bio: string;
  licenseUrl?: string;
  barbershopId: number;
  barbershopName: string;
}

export interface ShopApplicationData {
  type: 'BARBER_SHOP';
  name: string; // Owner Name
  email: string; // Admin Email
  password: string;
  phone: string;
  shopName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  latitude: number;
  longitude: number;
  website?: string;
  operatingHours?: string;
  description?: string;
  documentUrl?: string;
  shopImages?: string[]; 
}
export interface ApplicationResponseDTO {
  id: number;
  type: 'BARBER' | 'BARBER_SHOP';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';

  // Common Account Info
  name: string;
  email: string;
  phone: string;
  createdAt: string; // ISO Date string

  // Barber Specific
  experienceYears?: number;
  skills?: string[];
  bio?: string;
  city?: string;
  profilePictureUrl?: string;
  licenseUrl?: string;
  barbershop: string;

  // Shop Specific
  shopName?: string;
  address?: string;
  state?: string;
  postalCode?: string;
  latitude?: number; // BigDecimal maps to number in TS
  longitude?: number;
  website?: string;
  operatingHours?: string;
  description?: string;
  documentUrl?: string;
  shopImages?: string[]; 

  // Admin Review Info
  reviewedBy?: string;
  reviewedAt?: string; // ISO Date string
  rejectionReason?: string;
}