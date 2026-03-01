import React from 'react';
import { platformStats, seedShops } from '@/data/seed';
import { Users, Store, DollarSign, BarChart3, TrendingUp, Activity, Shield, Settings } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';

const MainAdminDashboard = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-8">
      
      {/* --- PROFILE GREETING --- */}
      {user && (
        <div className="glass-card p-6 flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold border-2 border-primary/30">
              {user.name?.charAt(0) || 'A'}
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

          <Button variant="outline">
            <Settings size={14} className="mr-2" /> Manage Account
          </Button>
        </div>
      )}

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: platformStats.totalUsers.toLocaleString(), icon: <Users size={20} />, change: '+342 this month' },
          { label: 'Active Shops', value: platformStats.activeShops.toString(), icon: <Store size={20} />, change: '+8 this month' },
          { label: 'Monthly Revenue', value: `$${(platformStats.monthlyRevenue / 1000).toFixed(0)}K`, icon: <DollarSign size={20} />, change: '+15% MoM' },
          { label: 'Total Bookings', value: platformStats.totalBookings.toLocaleString(), icon: <BarChart3 size={20} />, change: '+2.1K this month' },
        ].map((s) => (
          <div key={s.label} className="stat-card p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <span className="text-primary">{s.icon}</span>
            </div>
            <p className="text-2xl font-display font-bold">{s.value}</p>
            <span className="text-xs text-green-400 mt-2 block">{s.change}</span>
          </div>
        ))}
      </div>

      {/* --- REVENUE & SHOPS --- */}
      <div className="grid grid-cols-2 gap-6">
        {/* Revenue Split */}
        <div className="glass-card p-6">
          <h2 className="font-semibold mb-6 flex items-center gap-2 text-lg">
            <TrendingUp size={18} className="text-primary" /> Revenue Distribution
          </h2>
          <div className="space-y-5">
            {[
              { label: 'Barbers', percent: 60, amount: '$172,470' },
              { label: 'Shop Admins', percent: 30, amount: '$86,235' },
              { label: 'Platform', percent: 10, amount: '$28,745' },
            ].map((r) => (
              <div key={r.label}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">{r.label} ({r.percent}%)</span>
                  <span className="font-bold text-foreground">{r.amount}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full gold-gradient rounded-full transition-all" style={{ width: `${r.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Shops List */}
        <div className="glass-card p-6">
          <h2 className="font-semibold mb-6 flex items-center gap-2 text-lg">
            <Store size={18} className="text-primary" /> Top Shops
          </h2>
          <div className="space-y-3">
            {seedShops.slice(0, 4).map((shop) => (
              <div key={shop.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div>
                  <p className="text-sm font-medium">{shop.name}</p>
                  <p className="text-xs text-muted-foreground">{shop.city}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-primary font-medium">★ {shop.rating}</span>
                  <span className="px-2 py-1 rounded text-xs bg-green-500/10 text-green-400 font-medium">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- SYSTEM CONFIG --- */}
      <div className="grid grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="font-semibold mb-6 flex items-center gap-2 text-lg"><Activity size={18} className="text-primary" /> System Health</h2>
          <div className="space-y-3">
            {[
              { label: 'API Uptime', value: '99.98%' },
              { label: 'Avg Response', value: '45ms' },
              { label: 'Active Sessions', value: '1,247' },
              { label: 'Error Rate', value: '0.02%' },
            ].map((m) => (
              <div key={m.label} className="flex justify-between text-sm py-1">
                <span className="text-muted-foreground">{m.label}</span>
                <span className="font-medium font-mono">{m.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card p-6">
          <h2 className="font-semibold mb-6 flex items-center gap-2 text-lg"><Shield size={18} className="text-primary" /> Commission Config</h2>
          <div className="space-y-3">
            {[
              { label: 'Platform Fee', value: '10%' },
              { label: 'Default Shop Cut', value: '30%' },
              { label: 'Default Barber Cut', value: '60%' },
              { label: 'Cancellation Fee', value: '20%' },
            ].map((c) => (
              <div key={c.label} className="flex justify-between text-sm py-1">
                <span className="text-muted-foreground">{c.label}</span>
                <span className="font-medium text-primary">{c.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainAdminDashboard;