import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, Clock, DollarSign, Edit, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { fetchServicesByShop } from '@/services/serviceService';
import AddServiceModal from '@/pages/shopAdmin/AddServiceModal';
import type { ServiceDTO } from '@/models/models';

const ServiceManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  
  // State for Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceDTO | null>(null);

  const shopId = user?.shopId;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['services', shopId],
    queryFn: () => fetchServicesByShop({ shopId: shopId! }),
    enabled: !!shopId,
  });

  const services = data?.content || [];

  // Handlers
  const handleOpenModal = (service?: ServiceDTO) => {
    setEditingService(service || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Services</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your service menu</p>
          </div>
          <Button variant="hero" onClick={() => handleOpenModal()}>
            <Plus size={16} className="mr-2" /> Add Service
          </Button>
        </div>

        {isLoading && (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {isError && (
          <div className="text-center text-destructive py-10">Failed to load services.</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((srv) => (
            <div 
              key={srv.id} 
              className="glass-card p-5 flex items-center justify-between hover:border-primary/20 transition-colors cursor-pointer"
              onClick={() => navigate(`/shop-admin/services/${srv.id}`)}
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{srv.name}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{srv.description}</p>
                <div className="flex items-center gap-6 mt-3 text-xs font-medium">
                  <span className="text-primary flex items-center gap-1">
                    <DollarSign size={12} /> {srv.price}
                  </span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock size={12} /> {srv.durationMinutes} min
                  </span>
                </div>
              </div>

              <Button 
                variant="ghost" 
                size="icon" 
                className="ml-4 flex-shrink-0"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  handleOpenModal(srv); 
                }}
              >
                <Edit size={16} />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <AddServiceModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
        }}
        editData={editingService}
      />
    </>
  );
};

export default ServiceManagement;