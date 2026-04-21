import React, { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/adminService';
import { uploadProfilePicture } from '@/services/userService';
import { Users, Store, DollarSign, BarChart3, TrendingUp, TrendingDown, Activity, Settings, Loader2, Plus, Calendar, Scissors, RefreshCw, AlertCircle, Camera, MapPin } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { getDisplayableUrl } from '@/utils/imageUtils';
import { useToast } from '@/hooks/use-toast';
import ShopsMap from '@/components/ShopsMap';
import type { ActivityItem } from '@/models/models';

const MainAdminDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Redirect if not MAIN_ADMIN
  React.useEffect(() => {
    if (user && user.role !== 'MAIN_ADMIN') {
      navigate('/shop-admin/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // State for Upload
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Dashboard Data
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: adminService.getDashboard,
    refetchInterval: 60000,
    retry: 2,
    enabled: user?.role === 'MAIN_ADMIN', // Only fetch if user is MAIN_ADMIN
  });

  // --- Handlers ---

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ 
        variant: "destructive", 
        title: "Invalid File", 
        description: "Please select an image file" 
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ 
        variant: "destructive", 
        title: "File Too Large", 
        description: "Image must be less than 5MB" 
      });
      return;
    }

    setIsUploadingImage(true);
    try {
      const newImageUrl = await uploadProfilePicture(user.id, file);
      
      setUser({ ...user, profilePicture: newImageUrl });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      
      toast({ 
        title: "Success", 
        description: "Profile picture updated successfully" 
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({ 
        variant: "destructive", 
        title: "Upload Failed", 
        description: error.response?.data?.message || "Failed to upload image. Please try again." 
      });
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
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <p className="text-lg font-semibold text-destructive">Failed to load dashboard</p>
          <p className="text-sm text-muted-foreground mt-1">Unable to fetch dashboard data</p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  const formatCurrency = (val: number) => val.toLocaleString();
  const formatShortCurrency = (val: number) => {
    if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}K`;
    }
    return val.toFixed(2);
  };

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

      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Main Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Overview of platform performance and metrics</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* --- PROFILE GREETING --- */}
      {user && (
        <div className="glass-card p-6 flex items-center gap-6">
          <div className="relative group">
            {/* Avatar Container */}
            <div 
              className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold border-2 border-primary/30 overflow-hidden relative cursor-pointer transition-all hover:border-primary/50"
              onClick={handleUploadClick}
            >
              {displayProfilePicture ? (
                <>
                  <img 
                    src={displayProfilePicture} 
                    alt={user.name} 
                    className="absolute inset-0 w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </>
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
              className="absolute bottom-0 right-0 h-6 w-6 rounded-full shadow-lg" 
              onClick={handleUploadClick}
              disabled={isUploadingImage}
            >
              <Plus size={14} />
            </Button>
          </div>

          <div className="flex-1">
            <h2 className="text-3xl font-display font-bold text-foreground">
              Welcome back, {user.name}
            </h2>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: 'Total Users', 
            value: (data.totalUsers || 0).toLocaleString(), 
            icon: <Users size={20} />, 
            sub: 'All registered users',
            color: 'text-blue-500'
          },
          { 
            label: 'Active Shops', 
            value: (data.activeShops || 0).toString(), 
            icon: <Store size={20} />, 
            sub: 'Live barbershops',
            color: 'text-emerald-500'
          },
          { 
            label: 'Monthly Revenue', 
            value: `Rs. ${formatShortCurrency(data.monthlyRevenue || 0)}`, 
            icon: <DollarSign size={20} />, 
            sub: (data.revenueGrowthPercent || 0) >= 0 
              ? `+${data.revenueGrowthPercent || 0}% vs last month` 
              : `${data.revenueGrowthPercent || 0}% vs last month`, 
            positive: (data.revenueGrowthPercent || 0) >= 0,
            color: 'text-green-500'
          },
          { 
            label: 'Total Bookings', 
            value: (data.totalBookings || 0).toLocaleString(), 
            icon: <BarChart3 size={20} />, 
            sub: 'All time',
            color: 'text-purple-500'
          },
        ].map((s) => (
          <div key={s.label} className="stat-card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground font-medium">{s.label}</span>
              <span className={s.color}>{s.icon}</span>
            </div>
            <p className="text-3xl font-display font-bold mb-2">{s.value}</p>
            <span className={`text-xs flex items-center gap-1 ${s.positive === false ? 'text-destructive' : 'text-muted-foreground'}`}>
              {s.positive !== undefined && (s.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />)}
              {s.sub}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Distribution */}
        {data.config ? (
          <div className="glass-card p-6">
            <h2 className="font-semibold mb-6 flex items-center gap-2 text-lg">
              <TrendingUp size={18} className="text-primary" /> Revenue Distribution
              <span className="ml-auto text-xs text-muted-foreground font-normal">
                This month · Rs. {formatCurrency(data.monthlyRevenue || 0)}
              </span>
            </h2>
            <div className="space-y-5">
              {[
                { 
                  label: 'Barbers', 
                  percent: data.config.defaultBarberCut, 
                  amount: formatCurrency(data.barberEarnings || 0), 
                  color: 'bg-primary' 
                },
                { 
                  label: 'Shop Admins', 
                  percent: data.config.defaultShopCut, 
                  amount: formatCurrency(data.shopEarnings || 0), 
                  color: 'bg-blue-500' 
                },
                { 
                  label: 'Platform', 
                  percent: data.config.platformFee, 
                  amount: formatCurrency(data.platformEarnings || 0), 
                  color: 'bg-emerald-500' 
                },
              ].map((r) => (
                <div key={r.label}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">{r.label} ({r.percent}%)</span>
                    <span className="font-bold text-foreground">Rs. {r.amount}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${r.color} rounded-full transition-all duration-500`} 
                      style={{ width: `${r.percent}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Last month comparison */}
            <div className="mt-6 pt-4 border-t border-border flex justify-between text-sm">
              <span className="text-muted-foreground">Last month</span>
              <span className="font-medium">Rs. {formatCurrency(data.lastMonthRevenue || 0)}</span>
            </div>
          </div>
        ) : (
          <div className="glass-card p-6">
            <h2 className="font-semibold mb-6 flex items-center gap-2 text-lg">
              <TrendingUp size={18} className="text-primary" /> Revenue Distribution
            </h2>
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-12">
              <DollarSign size={32} className="mb-2 opacity-50" />
              <p className="text-sm">No revenue data available</p>
              <p className="text-xs mt-1">Revenue distribution will appear here</p>
            </div>
          </div>
        )}

        {/* Recent Activities */}
        <div className="glass-card p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2 text-lg">
            <Activity size={18} className="text-primary" /> Recent Activity
          </h2>
          {!data.recentActivities || data.recentActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-12">
              <Activity size={32} className="mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
              <p className="text-xs mt-1">Activity will appear here as it happens</p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-72 pr-2">
              {data.recentActivities.map((a: ActivityItem, i: number) => (
                <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/20 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    {a.type === 'BOOKING' ? (
                      <Calendar size={14} className="text-primary" />
                    ) : (
                      <Scissors size={14} className="text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.subtitle}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0 mt-1">{a.timestamp}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Shops Section */}
      {data.topShops && data.topShops.length > 0 && (
        <>
          {/* Shops Map */}
          <div className="glass-card p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2 text-lg">
              <MapPin size={18} className="text-primary" /> Shop Locations
              <span className="ml-auto text-xs text-muted-foreground font-normal">
                {data.topShops.filter(s => s.latitude && s.longitude).length} shops on map
              </span>
            </h2>
            <ShopsMap shops={data.topShops} />
          </div>

          {/* Top Shops Grid */}
          <div className="glass-card p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2 text-lg">
              <Store size={18} className="text-primary" /> Top Performing Shops
              <span className="ml-auto text-xs text-muted-foreground font-normal">Based on ratings and bookings</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.topShops.slice(0, 6).map((shop) => (
                <div 
                  key={shop.id} 
                  className="p-4 rounded-lg border border-border hover:border-primary/50 transition-all cursor-pointer hover:shadow-md"
                  onClick={() => navigate(`/admin/shops/${shop.id}`)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                      {shop.profilePicture && getDisplayableUrl(shop.profilePicture) ? (
                        <img 
                          src={getDisplayableUrl(shop.profilePicture)!} 
                          alt={shop.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Store size={20} className="text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{shop.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">{shop.city}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium text-yellow-600">
                          ⭐ {shop.rating?.toFixed(1) || 'N/A'}
                        </span>
                        {shop.reviewCount !== undefined && (
                          <span className="text-xs text-muted-foreground">
                            ({shop.reviewCount} reviews)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* System Health */}
      {data.health && (
        <div className="glass-card p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2 text-lg">
            <Activity size={18} className="text-primary" /> System Health
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-muted/20">
              <p className="text-xs text-muted-foreground mb-1">Uptime</p>
              <p className="text-lg font-bold">{data.health.uptime || 'N/A'}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/20">
              <p className="text-xs text-muted-foreground mb-1">Avg Response Time</p>
              <p className="text-lg font-bold">{data.health.avgResponseTime || 'N/A'}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/20">
              <p className="text-xs text-muted-foreground mb-1">Active Sessions</p>
              <p className="text-lg font-bold">{data.health.activeSessions ?? 0}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/20">
              <p className="text-xs text-muted-foreground mb-1">Error Rate</p>
              <p className="text-lg font-bold">{data.health.errorRate || '0%'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainAdminDashboard;