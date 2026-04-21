import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { fetchBarbershopById, updateBarbershop, uploadShopImage, removeShopImage } from '@/services/barbershopService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, ArrowLeft, MapPin, Navigation, X, Upload, ImageOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getDisplayableUrl } from '@/utils/imageUtils';
import LocationPicker from '@/components/LocationPicker';

const ManageShop = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
    email: '',
    website: '',
    operatingHours: '',
    latitude: '',
    longitude: '',
    description: ''
  });

  const [images, setImages] = useState<string[]>([]);

  // Fetch Shop Data
  useEffect(() => {
    const fetchShop = async () => {
      if (!user?.shopId) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const shop = await fetchBarbershopById(user.shopId);
        setFormData({
          name: shop.name || '',
          address: shop.address || '',
          city: shop.city || '',
          state: shop.state || '',
          postalCode: shop.postalCode || '',
          phone: shop.phone || '',
          email: shop.email || '',
          website: shop.website || '',
          operatingHours: shop.operatingHours || '',
          latitude: shop.latitude?.toString() || '',
          longitude: shop.longitude?.toString() || '',
          description: shop.description || ''
        });
        setImages(shop.shopImages || []);
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load shop data' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchShop();
  }, [user]);

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast({ variant: 'destructive', title: 'Error', description: 'Geolocation not supported' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6)
        }));
        toast({ title: 'Location Updated', description: 'Coordinates set to your current location' });
      },
      (error) => toast({ variant: 'destructive', title: 'Error', description: error.message })
    );
  };

  const handleMapLocationChange = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.shopId) return;

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        latitude: parseFloat(formData.latitude) || undefined,
        longitude: parseFloat(formData.longitude) || undefined
      };
      
      await updateBarbershop(user.shopId, payload);
      queryClient.invalidateQueries({ queryKey: ['shop', user.shopId] });
      toast({ title: 'Success', description: 'Shop details updated' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.response?.data?.message || 'Failed to update' });
    } finally {
      setIsSaving(false);
    }
  };

  // Image Handlers
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.shopId) return;

    setIsUploadingImage(true);
    try {
      const updatedShop = await uploadShopImage(user.shopId, file);
      setImages(updatedShop.shopImages || []);
      toast({ title: 'Success', description: 'Image uploaded' });
    } catch (error: any) {
       toast({ variant: 'destructive', title: 'Error', description: 'Failed to upload image' });
    } finally {
       setIsUploadingImage(false);
       if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = async (imageUrl: string) => {
    if (!user?.shopId) return;
    try {
      const updatedShop = await removeShopImage(user.shopId, imageUrl);
      setImages(updatedShop.shopImages || []);
      toast({ title: 'Success', description: 'Image removed' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to remove image' });
    }
  };

  if (isLoading) return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-display font-bold">Manage Shop</h1>
          <p className="text-muted-foreground text-sm">Update your barbershop details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 {/* ... Inputs same as before ... */}
                 <div className="space-y-2">
                  <Label htmlFor="name">Shop Name</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
                    </div>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" name="website" value={formData.website} onChange={handleChange} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="operatingHours">Operating Hours</Label>
                  <Input id="operatingHours" name="operatingHours" value={formData.operatingHours} onChange={handleChange} />
                </div>
              </CardContent>
            </Card>

             {/* IMAGES CARD */}
             <Card>
              <CardHeader>
                <CardTitle>Shop Gallery</CardTitle>
                <CardDescription>Add or remove photos of your shop.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((img, index) => {
                     const displayUrl = getDisplayableUrl(img);
                     return (
                       <div key={index} className="relative aspect-square rounded-md overflow-hidden border border-border group">
                         {displayUrl ? (
                           <img src={displayUrl} alt={`Shop ${index}`} className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full bg-muted flex items-center justify-center">
                             <ImageOff size={20} className="text-muted-foreground"/>
                           </div>
                         )}
                         
                         {/* Delete Button */}
                         <button 
                           type="button"
                           onClick={() => handleRemoveImage(img)}
                           className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                         >
                           <X size={14} />
                         </button>
                       </div>
                     );
                  })}
                  
                  {/* Add New Image Button */}
                  <div 
                    className="aspect-square rounded-md border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                     {isUploadingImage ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload size={20} />}
                     <span className="text-xs mt-2">Add Photo</span>
                  </div>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    className="hidden" 
                    accept="image/*" 
                  />
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Sidebar Details */}
          <div className="space-y-6">
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><MapPin size={18} /> Location</CardTitle>
                <CardDescription>Click on the map to set your shop location or use your current location</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Interactive Map */}
                {(formData.latitude && formData.longitude) ? (
                  <LocationPicker
                    latitude={parseFloat(formData.latitude)}
                    longitude={parseFloat(formData.longitude)}
                    onLocationChange={handleMapLocationChange}
                  />
                ) : (
                  <div className="w-full h-[300px] rounded-lg border border-border bg-muted/20 flex flex-col items-center justify-center text-muted-foreground">
                    <MapPin size={32} className="mb-2 opacity-50" />
                    <p className="text-sm">Set your location to see the map</p>
                    <p className="text-xs mt-1">Click "Use My Current Location" or enter coordinates</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input id="address" name="address" value={formData.address} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" value={formData.city} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" name="state" value={formData.state} onChange={handleChange} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleChange} />
                  </div>
                </div>

                <div className="border-t pt-4 mt-2">
                    <Button type="button" variant="outline" size="sm" onClick={handleGetLocation} className="w-full">
                        <Navigation size={14} className="mr-2" /> Use My Current Location
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input id="latitude" name="latitude" type="number" step="any" value={formData.latitude} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input id="longitude" name="longitude" type="number" step="any" value={formData.longitude} onChange={handleChange} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save size={16} className="mr-2" />}
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ManageShop;