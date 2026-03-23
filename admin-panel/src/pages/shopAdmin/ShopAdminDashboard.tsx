import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { getShopAdminDashboard } from '@/services/adminService';
import { getDisplayableUrl } from '@/utils/imageUtils';
import { Users, Scissors, Calendar, DollarSign, TrendingUp, BarChart3, Settings, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const ShopAdminDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['shopAdminDashboard', user?.id],
    queryFn: () => getShopAdminDashboard(user!.id),
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-destructive gap-2">
        <AlertCircle size={32} />
        <p>Failed to load dashboard data.</p>
        <p className="text-xs text-muted-foreground">Please try again later.</p>
      </div>
    );
  }

  // Process profile picture
  const displayProfilePicture = user ? getDisplayableUrl(user.profilePicture) : null;

  return (
    <div className="space-y-6">
      
      {/* Profile Greeting */}
      {user && (
        <div className="glass-card p-6 flex items-center gap-6">
          <div className="relative">
            {/* Avatar Container */}
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold border-2 border-primary/30 overflow-hidden relative">
              {displayProfilePicture ? (
                <img 
                  src={displayProfilePicture} 
                  alt={user.name} 
                  className="absolute inset-0 w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span>{user.name?.charAt(0) || 'A'}</span>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background" />
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-display font-bold text-foreground">
              Welcome back, {user.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              Logged in as <span className="text-primary font-medium">{user.role.replace('_', ' ')}</span> • {user.email}
            </p>
          </div>

          <Button variant="outline" onClick={() => navigate('/admin/settings')}>
            <Settings size={14} className="mr-2" /> Manage Account
          </Button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Today's Bookings", value: data.todayAppointments, icon: <Calendar size={18} />, change: `${data.pendingAppointments} pending` },
          { label: "Today's Revenue", value: `$${data.todayRevenue?.toFixed(2)}`, icon: <DollarSign size={18} />, change: 'Net earnings' },
          { label: 'Monthly Revenue', value: `$${data.monthlyRevenue?.toFixed(2)}`, icon: <TrendingUp size={18} />, change: `${data.revenueGrowth}% growth` },
          { label: 'Active Barbers', value: data.availableBarbers, icon: <Scissors size={18} />, change: `${data.totalBarbers} total` },
        ].map((s) => (
          <div key={s.label} className="stat-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <span className="text-primary">{s.icon}</span>
            </div>
            <p className="text-xl font-display font-bold">{s.value}</p>
            <span className="text-[10px] text-muted-foreground mt-1">{s.change}</span>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Barbers */}
        <div className="glass-card p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2 text-lg">
            <Users size={18} className="text-primary" /> Top Barbers (This Month)
          </h2>
          <div className="space-y-3">
            {data.topBarbers?.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No data</p>}
            {data.topBarbers?.map((b) => {
              const img = getDisplayableUrl(b.profilePicture);
              return (
                <div key={b.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer" onClick={() => navigate(`/shop-admin/barbers/${b.id}`)}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary overflow-hidden shrink-0">
                       {img ? <img src={img} className="w-full h-full object-cover" /> : <span className="text-xs font-bold">{b.name?.charAt(0)}</span>}
                    </div>
                    <span className="text-sm font-medium">{b.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-primary font-bold">{b.rating?.toFixed(1)} ★</span>
                    {/* Assuming reviewCount is in BarberDTO or mapped to rating count */}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Popular Services */}
        <div className="glass-card p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2 text-lg"><BarChart3 size={18} className="text-primary" /> Popular Services</h2>
          <div className="space-y-3">
            {data.popularServices?.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No data</p>}
            {data.popularServices?.map((srv) => (
              <div key={srv.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/20">
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">{srv.name}</span>
                </div>
                <span className="font-medium text-primary">Rs. {srv.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="glass-card p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2 text-lg"><Calendar size={18} className="text-primary" /> Upcoming Appointments</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="pb-2 font-medium">Customer</th>
                <th className="pb-2 font-medium">Service</th>
                <th className="pb-2 font-medium">Barber</th>
                <th className="pb-2 font-medium">Time</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {data.upcomingAppointments?.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No upcoming appointments</td></tr>
              )}
              {data.upcomingAppointments?.map((a) => (
                <tr key={a.appointmentId} className="hover:bg-muted/20">
                  <td className="py-3">{a.customerName}</td>
                  <td className="py-3 text-muted-foreground">{a.services?.map(s => s.name).join(', ')}</td>
                  <td className="py-3">{a.barberName}</td>
                  <td className="py-3 text-muted-foreground">
                    {new Date(a.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3">
                    <Badge variant={a.status === 'CONFIRMED' ? 'default' : 'secondary'} className="text-[10px]">
                       {a.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ShopAdminDashboard;