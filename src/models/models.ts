export type UserRole = 'CUSTOMER' | 'BARBER';

// Base user (from JWT)
export interface User {
  id: string;       // from JWT sub
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
  shopId?: string;
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
  id: string;
  name: string;
  duration: number; // in minutes
  price: number;
  category: string;
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
