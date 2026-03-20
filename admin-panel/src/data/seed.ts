import type { 
  BarbershopDTO, BarberDTO, ServiceDTO, AppointmentDetailsResponse, ReviewDTO,
  LeaveRequest, CustomerWallet, ApplicationRecord, PlatformStats
} from '@/models/models';



export const seedBarbers: BarberDTO[] = [
  { 
    id: 1, name: 'Marcus Johnson', email: 'marcus@fadebook.com', phone: '555-0101', role: 'BARBER',
    shopId: 1, rating: 4.9, reviewCount: 120, barbershop: 'The Gold Standard', commissionRate: 30,
    bio: 'Expert in fades and beard styling.', active: true, available: true, experienceYears: 8, skills: ['Fades', 'Beard'], workImages: [] 
  },
  { 
    id: 2, name: 'Andre Williams', email: 'andre@fadebook.com', phone: '555-0102', role: 'BARBER',
    shopId: 1, rating: 4.8, reviewCount: 95, barbershop: 'The Gold Standard', commissionRate: 30,
    bio: 'Classic cuts specialist.', active: true, available: true, experienceYears: 6, skills: ['Classic', 'Shaves'], workImages: [] 
  },
  { 
    id: 3, name: 'Terrence Brooks', email: 'terrence@fadebook.com', phone: '555-0103', role: 'BARBER',
    shopId: 2, rating: 4.7, reviewCount: 80, barbershop: 'Crown & Blade', commissionRate: 25,
    bio: 'Modern styles and designs.', active: true, available: true, experienceYears: 4, skills: ['Designs', 'Color'], workImages: [] 
  },
  { 
    id: 4, name: 'DeShawn Carter', email: 'deshawn@fadebook.com', phone: '555-0104', role: 'BARBER',
    shopId: 2, rating: 4.6, reviewCount: 60, barbershop: 'Crown & Blade', commissionRate: 25,
    bio: 'Quick and precise.', active: true, available: false, experienceYears: 3, skills: ['Fades'], workImages: [] 
  },
  { 
    id: 5, name: 'Jamal Thompson', email: 'jamal@fadebook.com', phone: '555-0105', role: 'BARBER',
    shopId: 3, rating: 4.9, reviewCount: 150, barbershop: 'Noir Cuts', commissionRate: 35,
    bio: 'The artist.', active: true, available: true, experienceYears: 10, skills: ['Art', 'Fades'], workImages: [] 
  },
];

export const seedAppointments: AppointmentDetailsResponse[] = [
  {
    appointmentId: 1,
    customerId: 101,
    customerName: 'James Wilson',
    barberId: 1,
    barberName: 'Marcus Johnson',
    barbershopId: 1,
    barbershopName: 'The Gold Standard',
    services: [{ serviceId: 2, name: 'Premium Fade', price: 45, durationMinutes: 45 }],
    totalPrice: 45,
    totalDurationMinutes: 45,
    status: 'CONFIRMED',
    scheduledTime: '2026-02-13T10:00:00',
    paymentStatus: 'PAID',
    createdAt: '2026-02-12T14:00:00',
  },
  {
    appointmentId: 2,
    customerId: 101,
    customerName: 'James Wilson',
    barberId: 3,
    barberName: 'Terrence Brooks',
    barbershopId: 2,
    barbershopName: 'Crown & Blade',
    services: [{ serviceId: 1, name: 'Classic Haircut', price: 35, durationMinutes: 30 }],
    totalPrice: 35,
    totalDurationMinutes: 30,
    status: 'PENDING',
    scheduledTime: '2026-02-14T14:00:00',
    paymentStatus: 'PENDING',
    createdAt: '2026-02-12T15:00:00',
  },
  {
    appointmentId: 3,
    customerId: 102,
    customerName: 'Robert Taylor',
    barberId: 1,
    barberName: 'Marcus Johnson',
    barbershopId: 1,
    barbershopName: 'The Gold Standard',
    services: [{ serviceId: 5, name: 'Haircut + Beard', price: 55, durationMinutes: 50 }],
    totalPrice: 55,
    totalDurationMinutes: 50,
    status: 'COMPLETED',
    scheduledTime: '2026-02-13T11:00:00',
    paymentStatus: 'PAID',
    createdAt: '2026-02-11T10:00:00',
  },
  {
    appointmentId: 4,
    customerId: 103,
    customerName: 'Mike Davis',
    barberId: 1,
    barberName: 'Marcus Johnson',
    barbershopId: 1,
    barbershopName: 'The Gold Standard',
    services: [{ serviceId: 4, name: 'Hot Towel Shave', price: 40, durationMinutes: 35 }],
    totalPrice: 40,
    totalDurationMinutes: 35,
    status: 'CONFIRMED',
    scheduledTime: '2026-02-13T13:00:00',
    paymentStatus: 'PAID',
    createdAt: '2026-02-10T09:00:00',
  },
  {
    appointmentId: 5,
    customerId: 104,
    customerName: 'Chris Brown',
    barberId: 2,
    barberName: 'Andre Williams',
    barbershopId: 1,
    barbershopName: 'The Gold Standard',
    services: [{ serviceId: 1, name: 'Classic Haircut', price: 35, durationMinutes: 30 }],
    totalPrice: 35,
    totalDurationMinutes: 30,
    status: 'CANCELLED',
    scheduledTime: '2026-02-13T15:00:00',
    paymentStatus: 'REFUNDED',
    createdAt: '2026-02-12T12:00:00',
  },
];

export const platformStats: PlatformStats = {
  totalUsers: 12847,
  activeShops: 156,
  totalBookings: 45623,
  monthlyRevenue: 287450,
  avgRating: 4.7,
  activeBarbers: 489,
};

export const seedReviews: ReviewDTO[] = [
  { id: 1, customerId: 101, customerName: 'James Wilson', targetType: 'SHOP', targetId: 1, rating: 5, reply: 'Absolutely phenomenal experience.', images: [], date: '2026-02-10' },
  { id: 2, customerId: 102, customerName: 'Robert Taylor', targetType: 'BARBER', targetId: 1, rating: 5, reply: 'Marcus is a true artist.', images: [], date: '2026-02-11' },
  { id: 3, customerId: 103, customerName: 'Mike Davis', targetType: 'SERVICE', targetId: 4, rating: 4, reply: 'Great hot towel shave.', images: [], date: '2026-02-10' },
{ id: 4, customerId: 104, customerName: 'Chris Brown', targetType: 'SHOP', targetId: 1, rating: 5, reply: 'Best barbershop in the city.', images: [], date: '2026-02-09' },
  { id: 5, customerId: 101, customerName: 'James Wilson', targetType: 'BARBER', targetId: 3, rating: 4, reply: 'Terrence does solid work.', images: [], date: '2026-02-08' },
  { id: 6, customerId: 102, customerName: 'Robert Taylor', targetType: 'SHOP', targetId: 2, rating: 4, reply: 'Crown & Blade has a great vibe.', images: [], date: '2026-02-07' },
  { id: 7, customerId: 103, customerName: 'Mike Davis', targetType: 'BARBER', targetId: 2, rating: 5, reply: 'Andre is the best.', images: [], date: '2026-02-06' },
  { id: 8, customerId: 104, customerName: 'Chris Brown', targetType: 'SERVICE', targetId: 2, rating: 5, reply: 'Premium Fade is worth every penny.', images: [], date: '2026-02-05' },
];

export const seedLeaveRequests: LeaveRequest[] = [
  {
    id: 1, barberId: 1, barberName: 'Marcus Johnson', shopId: 1,
    startDate: '2026-03-01', endDate: '2026-03-02', reason: 'Family event',
    status: 'APPROVED', appliedAt: '2026-02-20', reviewedAt: '2026-02-21', adminNotes: 'Approved. No conflicts.',
  },
  {
    id: 2, barberId: 1, barberName: 'Marcus Johnson', shopId: 1,
    startDate: '2026-03-10', endDate: '2026-03-10', reason: 'Medical appointment',
    status: 'PENDING', appliedAt: '2026-02-22',
  },
  {
    id: 3, barberId: 2, barberName: 'Andre Williams', shopId: 1,
    startDate: '2026-02-28', endDate: '2026-02-28', reason: 'Personal day',
    status: 'REJECTED', appliedAt: '2026-02-18', reviewedAt: '2026-02-19', adminNotes: 'High booking volume that day.',
  },
];

export const seedWallets: CustomerWallet[] = [
  {
    customerId: '101', balance: 25,
    transactions: [
      { id: 'wt1', type: 'REFUND', amount: 25, description: 'Refund for cancelled appointment', createdAt: '2026-02-10' },
    ],
  },
];

export const seedApplications: ApplicationRecord[] = [
  {
    id: 'app1', type: 'BARBER', name: 'David Brown', email: 'david@email.com', phone: '+1 555-9001', city: 'New York',
    status: 'PENDING_SHOP_APPROVAL', submittedAt: '2026-02-20', assignedShopId: '1',
    details: { experience: '7 years', specialization: 'Fades, Designs', bio: 'Passionate about creative fades.' },
    photos: ['https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=300&h=300&fit=crop'],
  },
  {
    id: 'app2', type: 'SHOP', name: 'Elite Cuts Studio', email: 'elite@email.com', phone: '+1 555-9002', city: 'Brooklyn',
    status: 'PENDING', submittedAt: '2026-02-19',
    details: { owner: 'Michael Scott', barberCount: '4', address: '99 Atlantic Ave, Brooklyn', description: 'Modern barbershop.' },
    photos: ['https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300&h=300&fit=crop'],
  },
  {
    id: 'app3', type: 'BARBER', name: 'Kevin Hart', email: 'kevin@email.com', phone: '+1 555-9003', city: 'Queens',
    status: 'PENDING_MAIN_APPROVAL', submittedAt: '2026-02-15', assignedShopId: '2',
    details: { experience: '10 years', specialization: 'Classic Cuts', bio: 'Old school barber with modern style.' },
    photos: ['https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=300&h=300&fit=crop'],
    shopAdminNotes: 'Great portfolio. Approved by shop.',
  },
  {
    id: 'app4', type: 'SHOP', name: 'Quick Snips', email: 'quick@email.com', phone: '+1 555-9004', city: 'Bronx',
    status: 'REJECTED', submittedAt: '2026-02-14',
    details: { owner: 'Tom Jones', barberCount: '1', address: '12 Fordham Rd' },
    photos: [],
    mainAdminNotes: 'Insufficient documentation.',
  },
  {
    id: 'app5', type: 'BARBER', name: 'Tony Stark', email: 'tony@email.com', phone: '+1 555-9005', city: 'Manhattan',
    status: 'APPROVED', submittedAt: '2026-02-10', assignedShopId: '1',
    details: { experience: '5 years', specialization: 'Beard Trim, Styling', bio: 'Detail-oriented stylist.' },
    photos: [],
    shopAdminNotes: 'Approved.', mainAdminNotes: 'Fully approved.',
  },
];