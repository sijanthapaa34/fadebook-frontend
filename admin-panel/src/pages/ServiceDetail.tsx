import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchServiceById } from '@/services/serviceService';
import { ArrowLeft, Clock, Tag, DollarSign, Loader2, ImageOff, Scissors, CheckCircle, XCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getDisplayableUrl } from '@/utils/imageUtils';

const ServiceDetail = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // 1. Fetch Service Details
  const { data: service, isLoading } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: () => fetchServiceById({ serviceId: Number(serviceId) }),
    enabled: !!serviceId,
  });

  if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-primary" /></div>;
  if (!service) return <div className="text-center py-20 text-muted-foreground">Service not found.</div>;

  // Process URLs - Use the first image in the array for the main display
  const mainImageUrl = service.serviceImages && service.serviceImages.length > 0 
    ? getDisplayableUrl(service.serviceImages[0]) 
    : null;
    
  const galleryImages = (service.serviceImages || []).map(url => getDisplayableUrl(url)).filter(Boolean) as string[];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </Button>

        {/* Service Image/Icon */}
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold overflow-hidden border-2 border-background shadow-lg shrink-0">
          {mainImageUrl ? (
            <img 
              src={mainImageUrl} 
              alt={service.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <Scissors size={32} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold font-serif truncate">{service.name}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
             <Badge variant="outline">{service.category?.replace('_', ' ')}</Badge>
             <div className="flex items-center gap-1 font-bold text-primary">
               {/* <DollarSign size={12} />  */}
               Rs. {service.price}
             </div>
             {/* Availability Badge */}
             {service.available ? (
                <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">Active</Badge>
             ) : (
                <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">Inactive</Badge>
             )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10 -mx-4 px-4">
        <div className="flex gap-6 overflow-x-auto">
          {['overview', 'gallery'].map((t) => (
            <button 
              key={t} 
              onClick={() => setActiveTab(t)}
              className={`pb-3 text-sm font-medium capitalize border-b-2 transition-colors whitespace-nowrap ${activeTab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              {t === 'gallery' ? 'Service Images' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="glass-card p-6">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Description Card */}
            <div className="glass-card p-6 space-y-4">
              <h3 className="text-lg font-semibold border-b border-border pb-2">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {service.description || 'No description provided.'}
              </p>
            </div>

            {/* Details Card */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold border-b border-border pb-2 mb-4">Details</h3>
              <div className="space-y-4">
                
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign size={18} />
                    <span className="text-sm">Price</span>
                  </div>
                  <span className="font-bold text-lg text-foreground">Rs. {service.price}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock size={18} />
                    <span className="text-sm">Duration</span>
                  </div>
                  <span className="font-bold text-foreground">{service.durationMinutes} min</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Tag size={18} />
                    <span className="text-sm">Category</span>
                  </div>
                  <Badge variant="secondary">{service.category?.replace('_', ' ')}</Badge>
                </div>

                {/* Target Gender */}
                {service.targetGender && (
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users size={18} />
                      <span className="text-sm">Target</span>
                    </div>
                    <span className="font-semibold text-foreground capitalize">{service.targetGender}</span>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        {/* GALLERY TAB (Service Images) */}
        {activeTab === 'gallery' && (
          <div>
            {galleryImages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ImageOff className="mx-auto h-12 w-12 opacity-20 mb-2" />
                <p>No service images uploaded</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {galleryImages.map((img, index) => (
                  <div key={index} className="aspect-square rounded-md overflow-hidden border border-border hover:border-primary/50 transition-colors cursor-pointer">
                    <img 
                      src={img} 
                      alt={`Service ${index + 1}`} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceDetail;