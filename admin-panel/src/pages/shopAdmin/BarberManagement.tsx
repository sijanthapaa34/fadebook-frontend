import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, User, Star, Edit, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { fetchBarbersByShop } from '@/services/barberService';
import AddBarberModal from '@/pages/shopAdmin/AddBarberModal';
import type { BarberDTO } from '@/models/models';

const BarberManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  
  // State for Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState<BarberDTO | null>(null);

  const shopId = user?.shopId;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['barbers', shopId],
    queryFn: () => fetchBarbersByShop({ shopId: shopId! }),
    enabled: !!shopId,
  });

  const barbers = data?.content || [];

  // Handlers
  const handleOpenModal = (barber?: BarberDTO) => {
    setEditingBarber(barber || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBarber(null);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Barber Management</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your team</p>
          </div>
          <Button variant="hero" onClick={() => handleOpenModal()}>
            <Plus size={16} className="mr-2" /> Add Barber
          </Button>
        </div>

        {isLoading && (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {isError && (
          <div className="text-center text-destructive py-10">Failed to load barbers.</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {barbers.map((barber) => (
            <div 
              key={barber.id} 
              className="glass-card p-5 flex items-center justify-between hover:border-primary/20 transition-colors cursor-pointer"
              onClick={() => navigate(`/shop-admin/barbers/${barber.id}`)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary overflow-hidden">
                  {barber.profilePicture ? (
                    <img src={barber.profilePicture} className="w-full h-full object-cover" alt={barber.name} />
                  ) : (
                    <User size={20} />
                  )}
                </div>
                <div>
                  <p className="font-semibold">{barber.name}</p>
                  <p className="text-xs text-muted-foreground">{barber.skills?.slice(0, 2).join(' · ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-sm text-primary">
                  <Star size={14} fill="currentColor" /> {barber.rating?.toFixed(1) || '0.0'}
                </div>
                <Badge variant={barber.active ? "default" : "destructive"} className="text-xs bg-green-500/10 text-green-400 border-green-500/20">
                  {barber.active ? 'Active' : 'Inactive'}
                </Badge>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        handleOpenModal(barber); 
                    }}
                >
                  <Edit size={16}/>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AddBarberModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['barbers'] });
        }}
        editData={editingBarber} 
      />
    </>
  );
};

export default BarberManagement;