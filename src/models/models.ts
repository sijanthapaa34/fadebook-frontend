export type UserRole = 'CUSTOMER' | 'BARBER';

// Base user (from JWT)
export interface User {
  id: string;       // from JWT sub
  email: string;    // from JWT
  role: UserRole;   // from JWT
}

// Customer info (fetched from backend)
export interface Customer extends User {
  name: string;
  phone?: string;
  avatar?: string;
  points?: number;
  totalBookings?: number;
  preferences?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'VIP';
}

// Barber info (fetched from backend)
export interface Barber extends User {
  name: string;
  phone?: string;
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

// Shop info (minimal for mobile)
export interface Shop {
  id: string;
  name: string;
  address: string;
  lat?: number;
  lng?: number;
  rating?: number;
  reviewCount?: number;
  priceCategory?: 1 | 2 | 3;
  hours?: { open: string; close: string };
  image?: string;
  services?: string[];
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
