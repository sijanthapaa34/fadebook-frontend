import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard, Calendar, DollarSign, Users, Settings, LogOut,
  Scissors, Store, BarChart3, Sliders, UserCircle, MessageSquare, MapPin, CreditCard, ClipboardList, Image, Star
} from 'lucide-react';
import type { AdminRole } from '@/models/models';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navConfig: Record<AdminRole, NavItem[]> = {
  BARBERSHOP_ADMIN: [
    { label: 'Dashboard', path: '/shop-admin/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Barbers', path: '/shop-admin/barbers', icon: <Scissors size={18} /> },
    { label: 'Services', path: '/shop-admin/services', icon: <Settings size={18} /> },
    { label: 'Leave Requests', path: '/shop-admin/leave', icon: <ClipboardList size={18} /> },
    { label: 'Appointments', path: '/shop-admin/appointments', icon: <Calendar size={18} /> },
    { label: 'Customers', path: '/shop-admin/customers', icon: <Users size={18} /> },
    { label: 'Messages', path: '/shop-admin/chat', icon: <MessageSquare size={18} /> },
  ],
  MAIN_ADMIN: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Shops', path: '/admin/shops', icon: <Store size={18} /> },
    { label: 'Applications', path: '/admin/applications', icon: <ClipboardList size={18} /> },
    { label: 'Analytics', path: '/admin/analytics', icon: <BarChart3 size={18} /> },
    { label: 'Commission', path: '/admin/commission', icon: <Sliders size={18} /> },
  ],
};

const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const navItems = navConfig[user.role];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card/50">
        <div className="p-6 border-b border-border">
          <Link to="/"><Logo size="sm" /></Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
            <LogOut size={16} className="mr-2" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex-1 flex flex-col">
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card/50">
          <Logo size="sm" />
          <Button variant="ghost" size="icon" onClick={handleLogout}><LogOut size={18} /></Button>
        </header>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t border-border flex justify-around py-2 z-50">
          {navItems.slice(0, 5).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-2 py-1 text-xs transition-colors ${
                location.pathname === item.path ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
