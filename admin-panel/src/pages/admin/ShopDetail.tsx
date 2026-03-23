import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchBarbershopById } from '@/services/barbershopService';
import { fetchBarbersByShop } from '@/services/barberService';
import { fetchServicesByShop } from '@/services/serviceService';
import { getReviewsofShop } from '@/services/reviewService';
import { getDisplayableUrl } from '@/utils/imageUtils'; // Ensure this is imported

import { MapPin, Phone, Clock, Star, Scissors, Mail, Globe, 
  Calendar, User, ImageOff, Loader2, Edit 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import ReviewCard from '@/components/ReviewCard';

const ShopDetail = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('overview');

  // --- Data Fetching ---
  const { data: shop, isLoading: isShopLoading } = useQuery({
    queryKey: ['shop', shopId],
    queryFn: () => fetchBarbershopById(Number(shopId)),
    enabled: !!shopId,
  });

  const { data: barbersPage } = useQuery({
    queryKey: ['barbers', shopId],
    queryFn: () => fetchBarbersByShop({ shopId: Number(shopId), page: 0, size: 20 }),
    enabled: !!shopId,
  });

  const { data: servicesPage } = useQuery({
    queryKey: ['services', shopId],
    queryFn: () => fetchServicesByShop({ shopId: Number(shopId), page: 0, size: 20 }),
    enabled: !!shopId,
  });

  const { data: reviewsPage } = useQuery({
    queryKey: ['reviews', 'SHOP', shopId],
    queryFn: () => getReviewsofShop(Number(shopId)),
    enabled: !!shopId,
  });

  // --- States ---
  if (isShopLoading) return <div className="flex justify-center items-center h-[80vh]"><Loader2 className="animate-spin text-primary" /></div>;
  if (!shop) return <div className="text-center py-20 text-muted-foreground">Shop not found.</div>;

  const barbers = barbersPage?.content || [];
  const services = servicesPage?.content || [];
  const reviews = reviewsPage?.content || [];
  const images = shop.shopImages? shop.shopImages : [];
  
  // Fix URL for Shop Profile Picture
  const shopProfileImg = getDisplayableUrl(shop.profilePicture);

  return (
    <div className="space-y-8">
      {/* --- HERO SECTION --- */}
      <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden border border-border">
        {images.length > 0 ? (
          <img 
            src={images[0]} 
            alt={shop.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <ImageOff className="w-16 h-16 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
        
        {/* Floating Header Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
          <div className="flex items-end gap-4">
            {/* Avatar - FIXED */}
            <div className="w-20 h-20 rounded-xl bg-card border-2 border-background shadow-xl overflow-hidden mb-1 shrink-0 flex items-center justify-center">
              {shopProfileImg ? (
                <img 
                    src={shopProfileImg} 
                    alt={shop.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                  {shop.name.charAt(0)}
                </div>
              )}
            </div>
            
            <div className="mb-1">
              <h1 className="text-2xl md:text-3xl font-bold font-serif text-white drop-shadow-md">{shop.name}</h1>
              <div className="flex items-center gap-2 text-sm text-white/80 mt-1">
                <MapPin size={14} /> {shop.city}, {shop.state}
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3 mb-1">
            <Button variant="secondary" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
              <Edit size={14} className="mr-2" /> Edit
            </Button>
          </div>
        </div>
      </div>

      {/* --- STATS BAR --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-1">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary"><Star size={18} /></div>
          <div>
            <p className="text-xs text-muted-foreground">Rating</p>
            <p className="font-bold">{shop.rating?.toFixed(1) || '0.0'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary"><Scissors size={18} /></div>
          <div>
            <p className="text-xs text-muted-foreground">Services</p>
            <p className="font-bold">{services.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary"><User size={18} /></div>
          <div>
            <p className="text-xs text-muted-foreground">Barbers</p>
            <p className="font-bold">{barbers.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary"><Calendar size={18} /></div>
          <div>
            <p className="text-xs text-muted-foreground">Reviews</p>
            <p className="font-bold">{reviews.length}</p>
          </div>
        </div>
      </div>

      {/* --- TABS --- */}
      <div className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10 -mx-4 px-4">
        <div className="flex gap-6 overflow-x-auto">
          {['overview', 'services', 'barbers', 'reviews', 'photos'].map((t) => (
            <button 
              key={t} 
              onClick={() => setActiveTab(t)}
              className={`pb-3 text-sm font-medium capitalize border-b-2 transition-colors whitespace-nowrap ${activeTab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* --- CONTENT --- */}
      <div className="glass-card p-6">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div>
              <h3 className="font-semibold text-lg mb-3">About</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {shop.description || 'No description provided for this shop.'}
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-lg mb-4">Contact & Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">{shop.phone || 'Not Provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{shop.email || 'Not Provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Operating Hours</p>
                    <p className="text-sm font-medium">{shop.operatingHours || 'Not Provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Globe size={16} className="text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Website</p>
                    {shop.website ? (
                      <a href={shop.website} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary hover:underline">{shop.website}</a>
                    ) : (
                      <p className="text-sm font-medium text-muted-foreground">Not Provided</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 col-span-1 md:col-span-2">
                  <MapPin size={16} className="text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Full Address</p>
                    <p className="text-sm font-medium">{shop.address}, {shop.city}, {shop.state} {shop.postalCode}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SERVICES TAB */}
        {activeTab === 'services' && (
          <div className="space-y-3">
            {services.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No services listed.</p>}
            {services.map(s => (
              <div key={s.id} className="flex justify-between items-center p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate(`/admin/services/${s.id}`)}>
                <div>
                  <p className="font-medium">{s.name}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Clock size={10} /> {s.durationMinutes} min</span>
                  </div>
                </div>
                <span className="font-bold text-primary">Rs. {s.price}</span>
              </div>
            ))}
          </div>
        )}

        {/* BARBERS TAB - FIXED SYNTAX */}
        {activeTab === 'barbers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {barbers.length === 0 && <p className="text-sm text-muted-foreground text-center py-8 col-span-2">No barbers assigned.</p>}
             {barbers.map(b => {
               // Fix URL for Barber Profile Picture
               const barberImgUrl = getDisplayableUrl(b.profilePicture);
               
               return (
                 <div 
                    key={b.id} 
                    className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer" 
                    onClick={() => navigate(`/admin/barbers/${b.id}`)}
                  >
                   <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg overflow-hidden shrink-0">
                     {barberImgUrl ? (
                       <img 
                         src={barberImgUrl} 
                         className="w-full h-full object-cover" 
                         referrerPolicy="no-referrer" 
                         alt={b.name}
                       />
                     ) : (
                       <span>{b.name?.charAt(0)}</span>
                     )}
                   </div>

                   <div className="flex-1">
                     <p className="font-semibold">{b.name}</p>
                     <p className="text-xs text-muted-foreground mt-0.5">{b.bio?.substring(0, 30)}...</p>
                   </div>
                   <div className="flex items-center gap-1 text-primary bg-primary/10 px-2 py-1 rounded-full text-xs font-bold">
                     <Star size={12} className="fill-primary" /> {b.rating?.toFixed(1)}
                   </div>
                 </div>
               );
             })}
          </div>
        )}

        {/* REVIEWS TAB */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
             {reviews.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No reviews yet.</p>}
             {reviews.map(r => (
               <ReviewCard key={r.id} review={r} />
             ))}
          </div>
        )}

        {/* PHOTOS TAB */}
        {activeTab === 'photos' && (
          <div>
            {images.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ImageOff className="mx-auto h-12 w-12 opacity-20 mb-2" />
                <p>No photos available</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {images.map((img, index) => (
                  <div key={index} className="aspect-square rounded-md overflow-hidden border border-border hover:border-primary/50 transition-colors cursor-pointer">
                    <img src={img} alt={`Shop photo ${index + 1}`} className="w-full h-full object-cover" />
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

export default ShopDetail;