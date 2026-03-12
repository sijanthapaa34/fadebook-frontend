import React, { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/adminService';
import { uploadProfilePicture } from '@/services/userService';
import { Users, Store, DollarSign, BarChart3, TrendingUp, Activity, Settings, Loader2, Plus } from 'lucide-react'; // Fixed Import
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { getDisplayableUrl } from '@/utils/imageUtils';
import { useToast } from '@/hooks/use-toast';

const MainAdminDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // State for Upload
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Dashboard Data
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: adminService.getDashboard,
    refetchInterval: 60000,
  });

  // --- Handlers ---

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingImage(true);
    try {
      const newImageUrl = await uploadProfilePicture(user.id, file);
      
      setUser({ ...user, profilePicture: newImageUrl });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      
      toast({ title: "Success", description: "Profile picture updated" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to upload image" });
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-20 text-destructive">
        Failed to load dashboard data.
      </div>
    );
  }

  const formatCurrency = (val: number) => `$${val.toLocaleString()}`;
  const formatShortCurrency = (val: number) => `$${(val / 1000).toFixed(0)}K`;

  const displayProfilePicture = user ? getDisplayableUrl(user.profilePicture) : null;

  return (
    <div className="space-y-8">
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*" 
      />

      {/* --- PROFILE GREETING --- */}
      {user && (
        <div className="glass-card p-6 flex items-center gap-6">
          <div className="relative">
            {/* Avatar Container */}
            <div 
              className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold border-2 border-primary/30 overflow-hidden relative cursor-pointer group"
              onClick={handleUploadClick}
            >
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
              
              {isUploadingImage && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
            </div>

            {/* Plus Button Overlay */}
            <Button 
              size="icon" 
              className="absolute bottom-0 right-0 h-6 w-6 rounded-full" 
              onClick={handleUploadClick}
              disabled={isUploadingImage}
            >
              <Plus size={14} />
            </Button>
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

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: data.totalUsers.toLocaleString(), icon: <Users size={20} />, change: 'Users' },
          { label: 'Active Shops', value: data.activeShops.toString(), icon: <Store size={20} />, change: 'Shops' },
          { label: 'Monthly Revenue', value: formatShortCurrency(data.monthlyRevenue), icon: <DollarSign size={20} />, change: 'Revenue' },
          { label: 'Total Bookings', value: data.totalBookings.toLocaleString(), icon: <BarChart3 size={20} />, change: 'Bookings' },
        ].map((s) => (
          <div key={s.label} className="stat-card p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <span className="text-primary">{s.icon}</span>
            </div>
            <p className="text-2xl font-display font-bold">{s.value}</p>
            <span className="text-xs text-muted-foreground mt-2 block">{s.change}</span>
          </div>
        ))}
      </div>

       <div className="grid grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="font-semibold mb-6 flex items-center gap-2 text-lg">
            <TrendingUp size={18} className="text-primary" /> Revenue Distribution
          </h2>
          <div className="space-y-5">
            {[
              { label: 'Barbers', percent: data.config.defaultBarberCut, amount: formatCurrency(data.barberEarnings) },
              { label: 'Shop Admins', percent: data.config.defaultShopCut, amount: formatCurrency(data.shopEarnings) },
              { label: 'Platform', percent: data.config.platformFee, amount: formatCurrency(data.platformEarnings) },
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
        
        {/* Activity Section */}
        <div className="glass-card p-6">
           <h2 className="font-semibold mb-6 flex items-center gap-2 text-lg">
            <Activity size={18} className="text-primary" /> Recent Activity
          </h2>
          <div className="text-center text-muted-foreground py-10 text-sm">
            No recent activity to display.
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainAdminDashboard;