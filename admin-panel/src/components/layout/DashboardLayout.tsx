import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard, Calendar, Users, Settings, LogOut,
  Scissors, Store, ClipboardList, MessageSquare
} from 'lucide-react';
import type { AdminRole } from '@/models/models';
import { getDisplayableUrl } from '@/utils/imageUtils';
import { NotificationBell } from '@/components/NotificationBell';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navConfig: Record<AdminRole, NavItem[]> = {
  SHOP_ADMIN: [
    { label: 'Dashboard', path: '/shop-admin/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Manage Shop', path: '/shop-admin/manage-shop', icon: <Store size={18} /> },
    { label: 'Barbers', path: '/shop-admin/barbers', icon: <Scissors size={18} /> },
    { label: 'Services', path: '/shop-admin/services', icon: <Settings size={18} /> },
    { label: 'Customers', path: '/shop-admin/customers', icon: <Users size={18} /> },
    { label: 'Leave Requests', path: '/shop-admin/leave', icon: <ClipboardList size={18} /> },
    { label: 'Appointments', path: '/shop-admin/appointments', icon: <Calendar size={18} /> },
    { label: 'Applications', path: '/shop-admin/applications', icon: <Users size={18} /> },
    { label: 'Messages', path: '/shop-admin/chat', icon: <MessageSquare size={18} /> },
  ],
  MAIN_ADMIN: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Shops', path: '/admin/shops', icon: <Store size={18} /> },
    { label: 'Customers', path: '/admin/customers', icon: <Users size={18} /> },
    { label: 'Applications', path: '/admin/applications', icon: <ClipboardList size={18} /> },
  ],
};

const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const navItems = navConfig[user.role];
  
  // FIX: Process image URL for display
  const displayProfilePicture = getDisplayableUrl(user.profilePicture);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* --- Permanent Sidebar --- */}
      <aside className="w-64 flex flex-col border-r border-border bg-card/50 h-screen sticky top-0">
        {/* Logo Area */}
        <div className="p-6 border-b border-border">
          <Link to="/"><Logo size="sm" /></Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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

        {/* User Profile Section at Bottom */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold overflow-hidden shrink-0 border border-border">
              {displayProfilePicture ? (
                <img 
                  src={displayProfilePicture} 
                  alt={user.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span>{user.name.charAt(0)}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-border flex items-center justify-end px-6 bg-card/30">
          <NotificationBell />
        </header>
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;