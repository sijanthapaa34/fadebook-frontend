import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchBarberById } from '@/api/barberService';
import { getReviewsofBarber } from '@/api/reviewService'; // Import the review fetcher
import { ArrowLeft, Star, Award, Scissors, Loader2, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ReviewCard from '@/components/ReviewCard';
import { getDisplayableUrl } from '@/utils/imageUtils';

const BarberDetail = () => {
  const { barberId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // 1. Fetch Barber Details
  const { data: barber, isLoading } = useQuery({
    queryKey: ['barber', barberId],
    queryFn: () => fetchBarberById(Number(barberId)),
    enabled: !!barberId,
  });

  // 2. Fetch Barber Reviews
  const { data: reviewsPage } = useQuery({
    queryKey: ['reviews', 'BARBER', barberId],
    queryFn: () => getReviewsofBarber(Number(barberId)),
    enabled: !!barberId,
  });

  if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-primary" /></div>;
  if (!barber) return <div className="text-center py-20 text-muted-foreground">Barber not found.</div>;

  // Process URLs
  const imageUrl = getDisplayableUrl(barber.profilePicture);
  const workImages = (barber.workImages || []).map(url => getDisplayableUrl(url)).filter(Boolean) as string[];
  const reviews = reviewsPage?.content || [];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </Button>

        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold overflow-hidden border-2 border-background shadow-lg shrink-0">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={barber.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span>{barber.name?.charAt(0)}</span>
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-2xl font-bold font-serif">{barber.name}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
             <Badge variant="outline">{barber.role}</Badge>
             <div className="flex items-center gap-1">
               <Star size={12} className="text-primary fill-primary" /> {barber.rating?.toFixed(1)}
             </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10 -mx-4 px-4">
        <div className="flex gap-6 overflow-x-auto">
          {['overview', 'portfolio', 'reviews'].map((t) => (
            <button 
              key={t} 
              onClick={() => setActiveTab(t)}
              className={`pb-3 text-sm font-medium capitalize border-b-2 transition-colors whitespace-nowrap ${activeTab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              {t === 'portfolio' ? 'Work Images' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="glass-card p-6">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 gap-6">
            <div className="glass-card p-6 space-y-4">
              <h3 className="text-lg font-semibold border-b border-border pb-2">Profile Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="text-foreground">{barber.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="text-foreground">{barber.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Experience</span>
                  <span className="text-foreground">{barber.experienceYears} Years</span>
                </div>
              </div>
              <div className="pt-4">
                <h4 className="font-medium mb-2 text-foreground">Bio</h4>
                <p className="text-sm text-muted-foreground">{barber.bio || 'No bio provided.'}</p>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold border-b border-border pb-2 mb-4 text-foreground">Skills & Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 p-4 rounded-lg text-center">
                  <Award className="mx-auto mb-2 text-primary" size={24} />
                  <p className="text-2xl font-bold text-foreground">{barber.experienceYears || 0}</p>
                  <p className="text-xs text-muted-foreground">Years Exp</p>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg text-center">
                  <Scissors className="mx-auto mb-2 text-primary" size={24} />
                  <p className="text-2xl font-bold text-foreground">{barber.reviewCount || reviews.length}</p>
                  <p className="text-xs text-muted-foreground">Reviews</p>
                </div>
              </div>
              
              {/* Skills Section */}
              <div className="mt-4">
                <h4 className="font-medium mb-2 text-sm text-muted-foreground">Skills</h4>
                {barber.skills && barber.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {barber.skills.map((s, i) => <Badge key={i} variant="secondary">{s}</Badge>)}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No skills listed.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PORTFOLIO TAB (Work Images) */}
        {activeTab === 'portfolio' && (
          <div>
            {workImages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ImageOff className="mx-auto h-12 w-12 opacity-20 mb-2" />
                <p>No work images uploaded</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {workImages.map((img, index) => (
                  <div key={index} className="aspect-square rounded-md overflow-hidden border border-border hover:border-primary/50 transition-colors cursor-pointer">
                    <img 
                      src={img} 
                      alt={`Work ${index + 1}`} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}
              </div>
            )}
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
      </div>
    </div>
  );
};

export default BarberDetail;