// src/models/models.ts

// ==========================================
// 1. ENUMS & BASE TYPES
// ==========================================

export type AdminRole = 'SHOP_ADMIN' | 'MAIN_ADMIN';

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type ApplicationStatus = 
  | 'PENDING' 
  | 'PENDING_SHOP_APPROVAL' 
  | 'PENDING_MAIN_APPROVAL' 
  | 'APPROVED' 
  | 'REJECTED';

// Base User (from JWT / Auth Store)
export interface User {
  id: number;
  email: string;
  role: AdminRole;
  name: string;
  phone?: string;
  profilePicture?: string;
}

// ==========================================
// 2. DOMAIN MODELS
// ==========================================

export interface Customer extends User {
  avatar?: string;
  points?: number;
  totalBookings?: number;
  preferences?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'VIP';
}

export interface Barber extends User {
  avatar?: string;
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

export interface AdminDTO extends User {
  shopId?: number;
  barbershopName?: string;
  adminLevel: AdminRole;
  lastLoginAt?: string;
  lastLoginIp?: string;
  preferredContactMethod?: string;
  emailNotificationsEnabled?: boolean;
  smsNotificationsEnabled?: boolean;
}

// ==========================================
// 3. API DTOs
// ==========================================

export interface BarberDTO {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  bio: string;
  active: boolean;
  available: boolean;
  experienceYears: number;
  profilePicture?: string;
  rating: number;
  reviewCount?: number;
  shopId?: number;
  skills?: string[];
  workImages?: string[];
  barbershop: string;
}

export interface CustomerDTO {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  profilePicture?: string;
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
  active: boolean;
  website: string | null;
  operatingHours: string;
  profilePicture?: string;
  reviewCount?: number;
  rating: number;
  latitude?: number;
  longitude?: number;
}

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

export interface ReviewDTO {
  id: number;
  customerId: number;
  customerName?: string;
  rating: number;
  reply?: string;
  targetType: string;
  images?: string[];
  targetId: number;
  date: string;
}

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
// 7. NEW MODELS (Added for Seed Data)
// ==========================================

export interface LeaveRequest {
  id: number;
  barberId: number;
  barberName: string;
  shopId: number;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedAt: string;
  reviewedAt?: string;
  adminNotes?: string;
}

export interface WalletTransaction {
  id: string;
  type: 'REFUND' | 'TOP_UP' | 'PAYMENT';
  amount: number;
  description: string;
  createdAt: string;
}

export interface CustomerWallet {
  customerId: string;
  balance: number;
  transactions: WalletTransaction[];
}

export interface ApplicationRecord {
  id: string;
  type: 'BARBER' | 'SHOP';
  name: string;
  email: string;
  phone: string;
  city: string;
  status: ApplicationStatus;
  submittedAt: string;
  assignedShopId?: string;
  details: Record<string, string>;
  photos: string[];
  shopAdminNotes?: string;
  mainAdminNotes?: string;
}

export interface PlatformStats {
  totalUsers: number;
  activeShops: number;
  totalBookings: number;
  monthlyRevenue: number;
  avgRating: number;
  activeBarbers: number;
}
// src/models/models.ts

// ... existing imports and types

// Status specifically for Barbers (2-step approval)
export type BarberApprovalStatus = 
  | 'PENDING_SHOP_APPROVAL'
  | 'PENDING_MAIN_APPROVAL'
  | 'APPROVED'
  | 'REJECTED';

// Status specifically for Shops (1-step approval by Main Admin)
export type ShopApprovalStatus = 
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED';


// Updated ApplicationRecord interface
export interface ApplicationRecord {
  id: string;
  type: 'BARBER' | 'SHOP';
  name: string;
  email: string;
  phone: string;
  city: string;
  status: ApplicationStatus; // Uses the union type above
  submittedAt: string;
  assignedShopId?: string;
  details: Record<string, string>;
  photos: string[];
  shopAdminNotes?: string;
  mainAdminNotes?: string;
}

export interface SystemHealth {
  uptime: string;
  avgResponseTime: string;
  activeSessions: number;
  errorRate: string;
}

export interface CommissionConfig {
  platformFee: number;
  defaultShopCut: number;
  defaultBarberCut: number;
  cancellationFee: number;
}

export interface AdminDashboardResponse {
  totalUsers: number;
  activeShops: number;
  monthlyRevenue: number;
  totalBookings: number;
  barberEarnings: number;
  shopEarnings: number;
  platformEarnings: number;
  health: SystemHealth;
  config: CommissionConfig;
  topShops: BarbershopDTO[];
}

export interface ShopAdminDashboardResponse {
  totalReviews: number;
  totalBarbers: number;

  // 2. Today
  todayAppointments: number;
  todayRevenue: number;
  pendingAppointments: number;
  availableBarbers: number;

  // 3. Monthly
  monthlyRevenue: number;
  monthlyAppointments: number;
  revenueGrowth: number;

  // 4. Distribution
  shopEarnings: number;
  barbersEarnings: number;
  platformFees: number;

  // 5. Lists
  topBarbers: BarberDTO[];
  popularServices: ServiceDTO[];
  upcomingAppointments: AppointmentDetailsResponse[];
}