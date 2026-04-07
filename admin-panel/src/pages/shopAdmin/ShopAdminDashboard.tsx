import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { getShopAdminDashboard } from '@/services/adminService';
import { uploadProfilePicture } from '@/services/userService';
import { getDisplayableUrl } from '@/utils/imageUtils';
import { Users, Scissors, Calendar, DollarSign, TrendingUp, BarChart3, Settings, Loader2, AlertCircle, RefreshCw, Plus, Camera, Activity, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useState, useRef, useEffect } from 'react';

const ShopAdminDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Redirect if not SHOP_ADMIN
  useEffect(() => {
    if (user && user.role !== 'SHOP_ADMIN') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // State for Upload
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['shopAdminDashboard', user?.id],
    queryFn: () => getShopAdminDashboard(user!.id),
    enabled: !!user?.id && user.role === 'SHOP_ADMIN', // Only fetch if user is SHOP_ADMIN
    retry: 2,
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

  if (isError || !data) {
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

  // Process profile picture
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
          <h1 className="text-2xl font-display font-bold text-foreground">Shop Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Overview of your shop performance and metrics</p>
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

      {/* Profile Greeting */}
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

          <Button variant="outline" onClick={() => navigate('/shop-admin/settings')}>
            <Settings size={14} className="mr-2" /> Manage Account
          </Button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: "Today's Bookings", 
            value: (data.todayAppointments || 0).toString(), 
            icon: <Calendar size={20} />, 
            sub: `${data.pendingAppointments || 0} pending`,
            color: 'text-blue-500'
          },
          { 
            label: "Today's Revenue", 
            value: `Rs. ${(data.todayRevenue || 0).toFixed(2)}`, 
            icon: <DollarSign size={20} />, 
            sub: 'Net earnings',
            color: 'text-green-500'
          },
          { 
            label: 'Monthly Revenue', 
            value: `Rs. ${(data.monthlyRevenue || 0).toFixed(2)}`, 
            icon: <TrendingUp size={20} />, 
            sub: `${data.revenueGrowth || 0}% growth`,
            positive: (data.revenueGrowth || 0) >= 0,
            color: 'text-emerald-500'
          },
          { 
            label: 'Active Barbers', 
            value: (data.availableBarbers || 0).toString(), 
            icon: <Scissors size={20} />, 
            sub: `${data.totalBarbers || 0} total`,
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
              {s.positive !== undefined && (s.positive ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />)}
              {s.sub}
            </span>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Barbers */}
        <div className="glass-card p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2 text-lg">
            <Users size={18} className="text-primary" /> Top Barbers
            <span className="ml-auto text-xs text-muted-foreground font-normal">This Month</span>
          </h2>
          {(!data.topBarbers || Object.keys(data.topBarbers).length === 0) ? (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-12">
              <Scissors size={32} className="mb-2 opacity-50" />
              <p className="text-sm">No barber data available</p>
              <p className="text-xs mt-1">Top barbers will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(data.topBarbers).map(([id, name]) => (
                <div key={id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <span className="text-sm font-bold">{name?.charAt(0)}</span>
                    </div>
                    <span className="text-sm font-medium">{name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Popular Services */}
        <div className="glass-card p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2 text-lg">
            <BarChart3 size={18} className="text-primary" /> Popular Services
            <span className="ml-auto text-xs text-muted-foreground font-normal">Most Booked</span>
          </h2>
          {(!data.popularServices || Object.keys(data.popularServices).length === 0) ? (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-12">
              <Activity size={32} className="mb-2 opacity-50" />
              <p className="text-sm">No service data available</p>
              <p className="text-xs mt-1">Popular services will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(data.popularServices).map(([id, name]) => (
                <div key={id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                  <span className="text-sm font-medium text-muted-foreground">{name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="glass-card p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2 text-lg">
          <Calendar size={18} className="text-primary" /> Upcoming Appointments
          <span className="ml-auto text-xs text-muted-foreground font-normal">Next scheduled bookings</span>
        </h2>
        {(!data.upcomingAppointments || data.upcomingAppointments.length === 0) ? (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-12">
            <Calendar size={32} className="mb-2 opacity-50" />
            <p className="text-sm">No upcoming appointments</p>
            <p className="text-xs mt-1">Appointments will appear here when scheduled</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Service</th>
                  <th className="pb-3 font-medium">Barber</th>
                  <th className="pb-3 font-medium">Time</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {data.upcomingAppointments.map((a) => (
                  <tr key={a.appointmentId} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 font-medium">{a.customerName}</td>
                    <td className="py-3 text-muted-foreground">{a.services?.map(s => s.name).join(', ')}</td>
                    <td className="py-3">{a.barberName}</td>
                    <td className="py-3 text-muted-foreground">
                      {new Date(a.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3">
                      <Badge 
                        variant={a.status === 'CONFIRMED' ? 'default' : a.status === 'PENDING' ? 'secondary' : 'outline'} 
                        className="text-[10px]"
                      >
                        {a.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopAdminDashboard;