import { seedAppointments, seedBarbers, seedServices } from '@/data/seed';
import { Users, Scissors, Calendar, DollarSign, TrendingUp, BarChart3 } from 'lucide-react';

const ShopDashboard = () => {
  const totalRevenue = seedAppointments.reduce((s, a) => s + a.totalPrice, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Shop Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">The Gold Standard · Performance Overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Bookings', value: seedAppointments.length.toString(), icon: <Calendar size={18} />, change: '+18%' },
          { label: 'Active Barbers', value: seedBarbers.filter((b) => b.shopId === 1).length.toString(), icon: <Scissors size={18} />, change: '' },
          { label: 'Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: <DollarSign size={18} />, change: '+12%' },
          { label: 'Avg Rating', value: '4.9', icon: <TrendingUp size={18} />, change: '+0.1' },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <span className="text-primary">{s.icon}</span>
            </div>
            <p className="text-xl font-display font-bold">{s.value}</p>
            {s.change && <span className="text-xs text-green-400 mt-1">{s.change}</span>}
          </div>
        ))}
      </div>

      {/* Popular Services */}
      <div className="glass-card p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><BarChart3 size={18} className="text-primary" /> Popular Services</h2>
        <div className="space-y-3">
          {seedServices.slice(0, 4).map((srv, i) => (
            <div key={srv.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                <span className="text-sm">{srv.name}</span>
              </div>
              <span className="text-sm font-medium text-primary">${srv.price}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="glass-card p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><Calendar size={18} className="text-primary" /> Recent Appointments</h2>
        <div className="space-y-3">
          {seedAppointments.slice(0, 5).map((apt) => (
            <div key={apt.appointmentId} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <div>
                <p className="text-sm font-medium">{apt.customerName}</p>
                {/* <p className="text-xs text-muted-foreground">{apt.services} with {apt.barberName}</p> */}
              </div>
              <div className="text-right">
                <p className="text-sm">{apt.scheduledTime}</p>
                {/* <p className="text-xs text-muted-foreground">{apt.date}</p> */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopDashboard;
