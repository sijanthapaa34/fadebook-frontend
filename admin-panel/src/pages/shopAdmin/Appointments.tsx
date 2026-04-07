import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { getShopByAdmin } from '@/services/adminService';
import { appointmentService } from '@/services/appointmentService';
import { Calendar, Clock, User, Scissors, DollarSign, Loader2, Search, CreditCard, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import type { AppointmentDetailsResponse } from '@/models/models';

type FilterType = 'ALL' | 'TODAY' | 'UPCOMING' | 'PAST';

const statusConfig: Record<string, { label: string; color: string }> = {
  CONFIRMED: { label: 'Confirmed', color: 'text-emerald-500 bg-emerald-500/10' },
  SCHEDULED: { label: 'Scheduled', color: 'text-blue-500 bg-blue-500/10' },
  COMPLETED: { label: 'Completed', color: 'text-gray-500 bg-gray-500/10' },
  CANCELLED: { label: 'Cancelled', color: 'text-destructive bg-destructive/10' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-yellow-500 bg-yellow-500/10' },
  NO_SHOW: { label: 'No Show', color: 'text-destructive bg-destructive/10' },
};

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  PAID: { label: 'Paid', color: 'text-emerald-500 bg-emerald-500/10' },
  PENDING: { label: 'Pending', color: 'text-yellow-500 bg-yellow-500/10' },
  REFUNDED: { label: 'Refunded', color: 'text-blue-500 bg-blue-500/10' },
};

const Appointments = () => {
  const user = useAuthStore((state) => state.user);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const pageSize = 50;

  // Get shop ID
  const { data: shopData } = useQuery({
    queryKey: ['shopByAdmin', user?.id],
    queryFn: () => getShopByAdmin(user!.id),
    enabled: !!user?.id,
  });

  // Fetch appointments
  const { data, isLoading } = useQuery({
    queryKey: ['shopAppointments', shopData?.id, filter, page],
    queryFn: () => {
      const filterMap: Record<FilterType, string | null> = {
        ALL: null,
        TODAY: 'today',
        UPCOMING: 'upcoming',
        PAST: 'past',
      };
      return appointmentService.getShopAppointments(
        shopData!.id,
        filterMap[filter],
        page,
        pageSize
      );
    },
    enabled: !!shopData?.id,
  });

  const appointments: AppointmentDetailsResponse[] = data?.content || [];

  const filtered = appointments.filter(a =>
    a.customerName.toLowerCase().includes(search.toLowerCase()) ||
    a.barberName.toLowerCase().includes(search.toLowerCase()) ||
    a.services.some(s => s.name.toLowerCase().includes(search.toLowerCase()))
  );

  const selected = appointments.find(a => a.appointmentId === selectedId);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateTime = (dateString: string) => {
    return `${formatDate(dateString)} at ${formatTime(dateString)}`;
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Appointments</h1>
          <p className="text-sm text-muted-foreground">Manage and view all shop appointments</p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by customer, barber, or service..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-muted/50 border-border"
            />
          </div>
          <div className="flex gap-1 bg-muted/30 p-1 rounded-md">
            {(['ALL', 'TODAY', 'UPCOMING', 'PAST'] as FilterType[]).map(f => (
              <button
                key={f}
                onClick={() => { setFilter(f); setPage(0); }}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  filter === f
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-6 h-[calc(100vh-220px)]">
          <div className="flex-1 space-y-2 overflow-y-auto pr-2">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-muted-foreground py-10">
                <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                <p>No appointments found</p>
              </div>
            ) : (
              filtered.map(appointment => {
                const sc = statusConfig[appointment.status] || statusConfig.SCHEDULED;
                const pc = paymentStatusConfig[appointment.paymentStatus] || paymentStatusConfig.PENDING;
                
                return (
                  <div
                    key={appointment.appointmentId}
                    onClick={() => setSelectedId(appointment.appointmentId)}
                    className={`glass-card p-4 cursor-pointer transition-colors hover:border-primary/30 ${
                      selectedId === appointment.appointmentId ? 'border-primary ring-1 ring-primary/20' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-9 h-9 rounded-md flex items-center justify-center bg-primary/10 text-primary">
                          <Calendar size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{appointment.customerName}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {appointment.barberName} • {formatDate(appointment.scheduledTime)} at {formatTime(appointment.scheduledTime)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-medium ${sc.color}`}>
                          {sc.label}
                        </span>
                        <span className="text-sm font-bold text-primary">Rs. {appointment.totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {selected && (
            <div className="w-[400px] glass-card p-6 flex flex-col overflow-y-auto sticky top-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 className="font-semibold">Appointment #{selected.appointmentId}</h3>
                  <p className="text-xs text-muted-foreground">{formatDateTime(selected.scheduledTime)}</p>
                </div>
              </div>

              <div className="space-y-4 text-sm mb-4 border-b border-border pb-4">
                {/* Customer Info */}
                <div className="flex items-center gap-2">
                  <User size={14} className="text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Customer</p>
                    <p className="font-medium">{selected.customerName}</p>
                  </div>
                </div>

                {/* Barber Info */}
                <div className="flex items-center gap-2">
                  <Scissors size={14} className="text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Barber</p>
                    <p className="font-medium">{selected.barberName}</p>
                  </div>
                </div>

                {/* Shop Info */}
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Shop</p>
                    <p className="font-medium">{selected.barbershopName}</p>
                  </div>
                </div>

                {/* Time Info */}
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="font-medium">{selected.totalDurationMinutes} minutes</p>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className="mb-4">
                <p className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wide">Services</p>
                <div className="space-y-2">
                  {selected.services.map((service, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 rounded bg-muted/30">
                      <div>
                        <p className="text-sm font-medium">{service.name}</p>
                        <p className="text-xs text-muted-foreground">{service.durationMinutes} min</p>
                      </div>
                      <p className="text-sm font-bold">Rs. {service.price}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Info */}
              <div className="mb-4 p-3 rounded-lg bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Payment Status</span>
                  <Badge variant={selected.paymentStatus === 'PAID' ? 'default' : 'secondary'}>
                    {selected.paymentStatus}
                  </Badge>
                </div>
                {selected.paymentMethod && (
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard size={14} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Payment Method:</span>
                    <span className="text-xs font-medium uppercase">{selected.paymentMethod}</span>
                  </div>
                )}
                {selected.paidAmount !== undefined && selected.paidAmount !== null && (
                  <div className="flex items-center gap-2">
                    <DollarSign size={14} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Paid Amount:</span>
                    <span className="text-xs font-medium">Rs. {selected.paidAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Total Price */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 mb-4">
                <span className="font-medium">Total Price</span>
                <span className="text-xl font-bold text-primary">Rs. {selected.totalPrice.toFixed(2)}</span>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-muted-foreground">Appointment Status</span>
                <Badge variant={selected.status === 'COMPLETED' ? 'default' : 'secondary'}>
                  {selected.status}
                </Badge>
              </div>

              {/* Notes */}
              {selected.customerNotes && (
                <div className="mb-4">
                  <p className="text-xs font-medium mb-1 text-muted-foreground">Customer Notes</p>
                  <p className="text-xs text-muted-foreground italic p-2 bg-muted/30 rounded">{selected.customerNotes}</p>
                </div>
              )}

              {selected.barberNotes && (
                <div className="mb-4">
                  <p className="text-xs font-medium mb-1 text-muted-foreground">Barber Notes</p>
                  <p className="text-xs text-muted-foreground italic p-2 bg-muted/30 rounded">{selected.barberNotes}</p>
                </div>
              )}

              {/* Timestamps */}
              <div className="mt-auto pt-4 border-t border-border space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Created</span>
                  <span>{formatDateTime(selected.createdAt)}</span>
                </div>
                {selected.checkInTime && (
                  <div className="flex justify-between">
                    <span>Check-in</span>
                    <span>{formatDateTime(selected.checkInTime)}</span>
                  </div>
                )}
                {selected.completedTime && (
                  <div className="flex justify-between">
                    <span>Completed</span>
                    <span>{formatDateTime(selected.completedTime)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Appointments;
