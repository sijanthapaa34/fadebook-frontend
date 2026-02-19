// import { format, parse, addMinutes, isAfter, isBefore, isSameDay, startOfDay } from 'date-fns';
// import { Barber, Appointment } from '../types';

// export interface TimeSlot {
//   time: string;
//   available: boolean;
//   isPast: boolean;
//   isBreak: boolean;
// }

// export interface BarberSchedule {
//   workingDays: number[]; // 0 = Sunday, 6 = Saturday
//   workingHours: {
//     start: string; // "09:00"
//     end: string; // "18:00"
//   };
//   breakTimes: {
//     start: string;
//     end: string;
//   }[];
//   slotDuration: number; // minutes
//   offDays: string[]; // ["2024-01-15", ...]
// }

// export const defaultSchedule: BarberSchedule = {
//   workingDays: [1, 2, 3, 4, 5, 6], // Monday to Saturday
//   workingHours: {
//     start: '09:00',
//     end: '18:00',
//   },
//   breakTimes: [
//     { start: '12:00', end: '13:00' }, // Lunch break
//   ],
//   slotDuration: 30,
//   offDays: [],
// };

// export const generateTimeSlots = (
//   date: Date,
//   barberSchedule: BarberSchedule,
//   existingAppointments: Appointment[]
// ): TimeSlot[] => {
//   const slots: TimeSlot[] = [];
//   const dayOfWeek = date.getDay();
//   const dateStr = format(date, 'yyyy-MM-dd');

//   // Check if it's a working day
//   if (!barberSchedule.workingDays.includes(dayOfWeek)) {
//     return slots;
//   }

//   // Check if it's an off day
//   if (barberSchedule.offDays.includes(dateStr)) {
//     return slots;
//   }

//   const now = new Date();
//   const isToday = isSameDay(date, now);

//   // Parse working hours
//   const startTime = parse(barberSchedule.workingHours.start, 'HH:mm', date);
//   const endTime = parse(barberSchedule.workingHours.end, 'HH:mm', date);
//   const slotDuration = barberSchedule.slotDuration;

//   let currentSlot = startTime;

//   while (isBefore(currentSlot, endTime)) {
//     const timeStr = format(currentSlot, 'HH:mm');
//     const nextSlot = addMinutes(currentSlot, slotDuration);

//     // Check if slot is in the past (for today)
//     const isPast = isToday && isBefore(currentSlot, now);

//     // Check if slot is during break time
//     const isBreak = barberSchedule.breakTimes.some((breakTime) => {
//       const breakStart = parse(breakTime.start, 'HH:mm', date);
//       const breakEnd = parse(breakTime.end, 'HH:mm', date);
//       return (
//         (isAfter(currentSlot, breakStart) || currentSlot.getTime() === breakStart.getTime()) &&
//         isBefore(currentSlot, breakEnd)
//       );
//     });

//     // Check if slot is already booked
//     const isBooked = existingAppointments.some((apt) => {
//       if (apt.date !== dateStr) return false;
//       const aptTime = parse(apt.time, 'HH:mm', date);
//       // Check if the slot overlaps with the appointment
//       return currentSlot.getTime() === aptTime.getTime();
//     });

//     slots.push({
//       time: timeStr,
//       available: !isPast && !isBreak && !isBooked,
//       isPast,
//       isBreak,
//     });

//     currentSlot = nextSlot;
//   }

//   return slots;
// };

// export const isDateAvailable = (date: Date, barberSchedule: BarberSchedule): boolean => {
//   const dayOfWeek = date.getDay();
//   const dateStr = format(date, 'yyyy-MM-dd');

//   // Check if it's a working day
//   if (!barberSchedule.workingDays.includes(dayOfWeek)) {
//     return false;
//   }

//   // Check if it's an off day
//   if (barberSchedule.offDays.includes(dateStr)) {
//     return false;
//   }

//   // Don't allow booking in the past
//   const today = startOfDay(new Date());
//   if (isBefore(startOfDay(date), today)) {
//     return false;
//   }

//   return true;
// };