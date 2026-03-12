import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchServiceById } from '@/services/serviceService';
import { ArrowLeft, Clock, Tag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ServiceDetail = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const { data: service, isLoading } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: () => fetchServiceById({ serviceId: Number(serviceId) }),
    enabled: !!serviceId,
  });

  if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-primary" /></div>;
  if (!service) return <div className="text-center py-20 text-muted-foreground">Service not found.</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
       <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
         <ArrowLeft size={16} className="mr-2" /> Back
       </Button>

       <div className="glass-card p-6">
         <div className="flex justify-between items-start mb-6">
           <div>
             <h1 className="text-2xl font-bold font-serif">{service.name}</h1>
             <p className="text-muted-foreground mt-1">{service.description}</p>
           </div>
           <div className="text-right">
             <p className="text-3xl font-bold text-primary">${service.price}</p>
             <p className="text-xs text-muted-foreground">Fixed Price</p>
           </div>
         </div>

         <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg">
              <Clock className="text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="font-semibold">{service.durationMinutes} Minutes</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg">
              <Tag className="text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Shop</p>
                <p className="font-semibold truncate">{service.barbershop}</p>
              </div>
            </div>
         </div>
       </div>
    </div>
  );
};

export default ServiceDetail;