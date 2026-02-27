import { platformStats, seedShops } from '@/data/seed';
import { Users, Store, DollarSign, BarChart3, TrendingUp, Activity, Shield } from 'lucide-react';

const MainAdminDashboard = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-display font-bold">Platform Overview</h1>
      <p className="text-muted-foreground text-sm mt-1">FadeBook System Dashboard</p>
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: 'Total Users', value: platformStats.totalUsers.toLocaleString(), icon: <Users size={18} />, change: '+342 this month' },
        { label: 'Active Shops', value: platformStats.activeShops.toString(), icon: <Store size={18} />, change: '+8 this month' },
        { label: 'Monthly Revenue', value: `$${(platformStats.monthlyRevenue / 1000).toFixed(0)}K`, icon: <DollarSign size={18} />, change: '+15% MoM' },
        { label: 'Total Bookings', value: platformStats.totalBookings.toLocaleString(), icon: <BarChart3 size={18} />, change: '+2.1K this month' },
      ].map((s) => (
        <div key={s.label} className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{s.label}</span>
            <span className="text-primary">{s.icon}</span>
          </div>
          <p className="text-xl font-display font-bold">{s.value}</p>
          <span className="text-xs text-green-400 mt-1">{s.change}</span>
        </div>
      ))}
    </div>

    {/* Revenue split */}
    <div className="glass-card p-6">
      <h2 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-primary" /> Revenue Distribution</h2>
      <div className="space-y-4">
        {[
          { label: 'Barbers', percent: 60, amount: '$172,470' },
          { label: 'Shop Admins', percent: 30, amount: '$86,235' },
          { label: 'Platform', percent: 10, amount: '$28,745' },
        ].map((r) => (
          <div key={r.label}>
            <div className="flex justify-between text-sm mb-1">
              <span>{r.label} ({r.percent}%)</span>
              <span className="font-semibold">{r.amount}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full gold-gradient rounded-full" style={{ width: `${r.percent}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Active shops */}
    <div className="glass-card p-6">
      <h2 className="font-semibold mb-4 flex items-center gap-2"><Store size={18} className="text-primary" /> Active Shops</h2>
      <div className="space-y-3">
        {seedShops.map((shop) => (
          <div key={shop.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
            <div>
              <p className="text-sm font-medium">{shop.name}</p>
              <p className="text-xs text-muted-foreground">{shop.city} · {shop.reviewCount} reviews</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-primary">★ {shop.rating}</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/10 text-green-400">Active</span>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* System Health */}
    <div className="grid md:grid-cols-2 gap-4">
      <div className="glass-card p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><Activity size={18} className="text-primary" /> System Health</h2>
        <div className="space-y-3">
          {[
            { label: 'API Uptime', value: '99.98%' },
            { label: 'Avg Response', value: '45ms' },
            { label: 'Active Sessions', value: '1,247' },
            { label: 'Error Rate', value: '0.02%' },
          ].map((m) => (
            <div key={m.label} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{m.label}</span>
              <span className="font-medium">{m.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="glass-card p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><Shield size={18} className="text-primary" /> Commission Config</h2>
        <div className="space-y-3">
          {[
            { label: 'Platform Fee', value: '10%' },
            { label: 'Default Shop Cut', value: '30%' },
            { label: 'Default Barber Cut', value: '60%' },
            { label: 'Cancellation Fee', value: '20%' },
          ].map((c) => (
            <div key={c.label} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{c.label}</span>
              <span className="font-medium text-primary">{c.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default MainAdminDashboard;
