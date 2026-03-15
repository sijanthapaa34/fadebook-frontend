import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { createBarbershop } from '@/services/barbershopService';
import { uploadProfilePicture } from '@/services/userService'; // IMPORTED FROM USER SERVICE
import type { RegisterBarbershopRequest } from '@/models/models';
import { Loader2, MapPin, Store, User, Mail, Phone, Globe, Clock, Lock, Navigation, Upload, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import api from '@/api/api';

interface AddShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const initialState: RegisterBarbershopRequest = {
  shopName: '',
  shopEmail: '',
  phone: '',
  website: '',
  operatingHours: '',
  description: '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  latitude: 0,
  longitude: 0,
  shopImages: [],
  adminName: '',
  adminEmail: '',
  password: '',
  adminProfile: '',
};

// --- HELPER: Generic Upload (Used only for Shop Images) ---
const uploadGenericFile = async (file: File, type: string, email: string): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  formData.append('email', email);

  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// --- FIELD COMPONENT ---
interface FieldProps {
  label: string;
  name: string;
  value: string | number | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  icon?: React.ElementType;
  [key: string]: any;
}

const Field: React.FC<FieldProps> = ({ label, name, value, onChange, error, required, icon: Icon, ...props }) => (
  <div className="space-y-1.5">
    <Label htmlFor={name} className="text-xs text-muted-foreground flex items-center gap-1.5">
      {Icon && <Icon size={12} />} {label} {required && <span className="text-destructive">*</span>}
    </Label>
    <Input
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className={`bg-muted/30 border-border ${error ? 'border-destructive' : ''}`}
      {...props}
    />
    {error && <p className="text-[10px] text-destructive">{error}</p>}
  </div>
);

// --- MAIN COMPONENT ---

const AddShopModal: React.FC<AddShopModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<RegisterBarbershopRequest>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const { toast } = useToast();

  // Refs
  const profileInputRef = useRef<HTMLInputElement>(null);
  const shopImagesInputRef = useRef<HTMLInputElement>(null);

  // File State
  const [adminProfileFile, setAdminProfileFile] = useState<File | null>(null);
  const [shopImageFiles, setShopImageFiles] = useState<File[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // --- File Handlers ---
  const handleProfileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setAdminProfileFile(e.target.files[0]);
    }
  };

  const handleShopImagesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setShopImageFiles(prev => [...prev, ...filesArray]);
    }
  };

  const removeShopImage = (index: number) => {
    setShopImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  // --- Location ---
  const handleLocation = () => {
    setLocLoading(true);
    if (!navigator.geolocation) {
      toast({ variant: 'destructive', title: 'Error', description: 'Geolocation not supported.' });
      setLocLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({
          ...prev,
          latitude: parseFloat(pos.coords.latitude.toFixed(6)),
          longitude: parseFloat(pos.coords.longitude.toFixed(6))
        }));
        setLocLoading(false);
        toast({ title: 'Location', description: 'Coordinates updated.' });
      },
      () => {
        setLocLoading(false);
        toast({ variant: 'destructive', title: 'Error', description: 'Unable to retrieve location.' });
      }
    );
  };

  // --- Validation ---
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.shopName) newErrors.shopName = 'Shop name is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    
    if (!formData.adminName) newErrors.adminName = 'Admin name is required';
    if (!formData.adminEmail) newErrors.adminEmail = 'Admin email is required';
    if (!formData.password || formData.password.length < 6) newErrors.password = 'Password min 6 chars';
    if (!formData.shopEmail) newErrors.shopEmail = 'Shop email is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Submit ---
  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      let shopImageUrls: string[] = [];

      // STEP 1: Upload Shop Images (Generic Upload)
      // We do this first because createBarbershop needs the URLs in the body.
      if (shopImageFiles.length > 0) {
        toast({ title: 'Uploading...', description: `Uploading ${shopImageFiles.length} shop images...` });
        const uploadPromises = shopImageFiles.map(file => 
          uploadGenericFile(file, 'shop_image', formData.shopEmail)
        );
        shopImageUrls = await Promise.all(uploadPromises);
      }

      // STEP 2: Register Shop & Admin
      // We pass empty adminProfile initially
      const payload: RegisterBarbershopRequest = {
        ...formData,
        shopImages: shopImageUrls,
        adminProfile: '', 
        latitude: formData.latitude || 0,
        longitude: formData.longitude || 0,
      };

      // We expect the backend to return the created User object (with ID)
      const newUser = await createBarbershop(payload);
      
      // STEP 3: Upload Admin Profile (User Specific Upload)
      if (newUser && newUser.id && adminProfileFile) {
        try {
          toast({ title: 'Uploading...', description: 'Uploading admin profile...' });
          // USING THE IMPORTED SERVICE FUNCTION
          await uploadProfilePicture(newUser.id, adminProfileFile);
        } catch (uploadError) {
          console.warn("Shop created, but admin photo failed:", uploadError);
          toast({ variant: 'destructive', title: 'Warning', description: 'Shop created, but admin photo failed to upload.' });
        }
      }

      toast({ title: 'Success', description: 'Barbershop registered successfully.' });
      onSuccess();
      handleClose();
      
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to create shop.';
      toast({ variant: 'destructive', title: 'Error', description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(initialState);
    setErrors({});
    setAdminProfileFile(null);
    setShopImageFiles([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-card border-border text-foreground p-0">
        {/* Header */}
        <div className="sticky top-0 bg-card z-10 p-6 border-b border-border">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Store size={20} className="text-primary" />
            Register New Barbershop
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Fill in the details below to create a shop and its admin account.
          </DialogDescription>
        </div>

        <div className="p-6 space-y-8">
          {/* --- SECTION 1: SHOP INFO --- */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary flex items-center gap-2">
              <Store size={14} /> Shop Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Shop Name" name="shopName" value={formData.shopName} onChange={handleChange} required icon={Store} placeholder="The Fade House" error={errors.shopName} />
              <Field label="Shop Email" name="shopEmail" value={formData.shopEmail} onChange={handleChange} type="email" required icon={Mail} placeholder="contact@fadehouse.com" error={errors.shopEmail} />
              <Field label="Phone" name="phone" value={formData.phone} onChange={handleChange} required icon={Phone} placeholder="+977 98XXXXXXXX" />
              <Field label="Website" name="website" value={formData.website} onChange={handleChange} icon={Globe} placeholder="https://fadehouse.com" />
              <Field label="Operating Hours" name="operatingHours" value={formData.operatingHours} onChange={handleChange} icon={Clock} placeholder="Mon-Sat: 9AM-6PM" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                className="bg-muted/30 border-border min-h-[80px]" 
                placeholder="Brief description of the shop..."
              />
            </div>
             
             {/* --- SHOP IMAGE UPLOAD SECTION --- */}
             <div className="space-y-3">
                <Label className="text-xs text-muted-foreground">Shop Images</Label>
                <div className="flex gap-2 flex-wrap">
                    {shopImageFiles.map((file, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-md overflow-hidden border border-border group">
                            <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="Shop" />
                            <button 
                                type="button"
                                onClick={() => removeShopImage(i)} 
                                className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={12} color="white" />
                            </button>
                        </div>
                    ))}
                    <button 
                        type="button"
                        onClick={() => shopImagesInputRef.current?.click()}
                        className="w-20 h-20 rounded-md border border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                        <Upload size={16} />
                        <span className="text-[10px] mt-1">Add</span>
                    </button>
                </div>
                <input 
                    ref={shopImagesInputRef} 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleShopImagesSelect} 
                />
             </div>
          </div>

          <Separator />

          {/* --- SECTION 2: LOCATION --- */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary flex items-center gap-2">
              <MapPin size={14} /> Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Field label="Full Address" name="address" value={formData.address} onChange={handleChange} required placeholder="123 Main St" error={errors.address} />
              </div>
              <Field label="City" name="city" value={formData.city} onChange={handleChange} required placeholder="Kathmandu" error={errors.city} />
              <div className="grid grid-cols-2 gap-2">
                 <Field label="State" name="state" value={formData.state} onChange={handleChange} placeholder="Bagmati" />
                 <Field label="Postal Code" name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="44600" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                 <Label className="text-xs text-muted-foreground">Coordinates (Optional)</Label>
                 <Button type="button" size="sm" variant="outline" onClick={handleLocation} disabled={locLoading}>
                   {locLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Navigation size={12} className="mr-1" />}
                   Auto-Detect
                 </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input 
                  placeholder="Lat" 
                  name="latitude"
                  value={formData.latitude || ''} 
                  onChange={(e) => setFormData(prev => ({...prev, latitude: parseFloat(e.target.value)}))} 
                  className="bg-muted/30 border-border"
                />
                <Input 
                  placeholder="Long" 
                  name="longitude"
                  value={formData.longitude || ''} 
                  onChange={(e) => setFormData(prev => ({...prev, longitude: parseFloat(e.target.value)}))} 
                  className="bg-muted/30 border-border"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* --- SECTION 3: ADMIN INFO --- */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary flex items-center gap-2">
              <User size={14} /> Administrator Account
            </h3>
            <div className="p-4 rounded-lg bg-muted/10 border border-dashed border-muted-foreground/20">
              <p className="text-[10px] text-muted-foreground mb-4">This user will be the Shop Admin and can login immediately.</p>
              
              {/* Admin Profile Upload */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden">
                        {adminProfileFile ? (
                            <img src={URL.createObjectURL(adminProfileFile)} className="w-full h-full object-cover" />
                        ) : (
                            <User size={20} className="text-muted-foreground" />
                        )}
                    </div>
                    <button 
                        type="button"
                        onClick={() => profileInputRef.current?.click()}
                        className="absolute -bottom-1 -right-1 bg-primary text-black rounded-full p-1"
                    >
                        <Upload size={10} />
                    </button>
                </div>
                <div className="flex-1">
                    <p className="text-xs font-medium">Admin Profile Photo</p>
                    <p className="text-[10px] text-muted-foreground">JPG, PNG. Max 2MB</p>
                </div>
                <input 
                    ref={profileInputRef} 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleProfileSelect} 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Admin Name" name="adminName" value={formData.adminName} onChange={handleChange} required placeholder="John Doe" error={errors.adminName} />
                <Field label="Admin Email" name="adminEmail" value={formData.adminEmail} onChange={handleChange} type="email" required placeholder="john@example.com" error={errors.adminEmail} />
                <Field label="Password" name="password" value={formData.password} onChange={handleChange} type="password" required placeholder="Min 6 characters" error={errors.password} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="sticky bottom-0 bg-card z-10 p-4 border-t border-border">
          <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          <Button variant="hero" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Create Shop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddShopModal;