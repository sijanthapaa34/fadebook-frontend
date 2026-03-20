import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch'; // Import Switch
import { useToast } from '@/hooks/use-toast';
import { addService, updateService, activateService, deactivateService } from '@/services/serviceService';
import type { RegisterServiceRequest, ServiceDTO, ServiceUpdateRequest, ServiceCategory } from '@/models/models';
import { Loader2, Store, Upload, X, DollarSign, Clock, Tag, Power } from 'lucide-react';
import api from '@/api/api';
import { useAuthStore } from '@/store/authStore';

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: ServiceDTO | null;
}

const uploadGenericFile = async (file: File, type: string, email: string): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  formData.append('email', email);
  const response = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  return response.data;
};

const Field = ({ label, name, value, onChange, error, required, icon: Icon, disabled, ...props }: any) => (
  <div className="space-y-1.5">
    <Label htmlFor={name} className="text-xs text-muted-foreground flex items-center gap-1.5">
      {Icon && <Icon size={12} />} {label} {required && <span className="text-destructive">*</span>}
    </Label>
    <Input
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`bg-muted/30 border-border ${error ? 'border-destructive' : ''} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      {...props}
    />
    {error && <p className="text-[10px] text-destructive">{error}</p>}
  </div>
);

const durationOptions = [30, 60, 90, 120, 150, 180, 210, 240];
const categoryOptions: ServiceCategory[] = ['HAIRCUT', 'SHAVE', 'BEARD', 'COLOR', 'TREATMENT', 'PACKAGE'];

const emptyState: RegisterServiceRequest = {
  name: '',
  description: '',
  durationMinutes: 30,
  price: undefined as any,
  category: 'HAIRCUT',
  available: true,
  serviceImages: []
};

const AddServiceModal: React.FC<AddServiceModalProps> = ({ isOpen, onClose, onSuccess, editData }) => {
  const [formData, setFormData] = useState<RegisterServiceRequest>(emptyState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  
  // Local state for immediate status toggle
  const [isAvailable, setIsAvailable] = useState(true);

  const isEditMode = !!editData;

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name,
        description: editData.description,
        durationMinutes: editData.durationMinutes,
        price: editData.price,
        category: editData.category as ServiceCategory,
        available: editData.available,
        serviceImages: []
      });
      setExistingImages(editData.serviceImages || []);
      setIsAvailable(editData.available);
    } else {
      setFormData(emptyState);
      setExistingImages([]);
      setIsAvailable(true);
    }
    setFiles([]);
    setErrors({});
  }, [editData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
    } else if (name === 'category') {
      setFormData(prev => ({ ...prev, category: value as ServiceCategory }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      setFiles(prev => [...prev, ...Array.from(selectedFiles)]);
    }
  };

  const removeNewFile = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx));
  const removeExistingFile = (idx: number) => setExistingImages(prev => prev.filter((_, i) => i !== idx));

  // Handle Status Toggle immediately
  const handleStatusChange = async (checked: boolean) => {
    if (!user?.shopId || !editData) return;
    
    // Optimistic UI update
    setIsAvailable(checked);

    try {
      if (checked) {
        await activateService(user.shopId, editData.id);
        toast({ title: 'Service Activated' });
      } else {
        await deactivateService(user.shopId, editData.id);
        toast({ title: 'Service Deactivated' });
      }
    } catch (err) {
      // Revert on error
      setIsAvailable(!checked);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update status' });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Required';
    if (!formData.description) newErrors.description = 'Required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Price must be > 0';
    if (!formData.durationMinutes) newErrors.durationMinutes = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !user?.shopId) return;
    setIsLoading(true);
    try {
      let newImageUrls: string[] = [];
      if (files.length > 0) {
        toast({ title: 'Uploading images...' });
        const promises = files.map(f => uploadGenericFile(f, 'service_image', user.email));
        newImageUrls = await Promise.all(promises);
      }

      const finalImages = [...existingImages, ...newImageUrls];

      if (editData) {
        // UPDATE: Send only DTO fields (Duration, Price, Images)
        const payload: ServiceUpdateRequest = {
          durationMinutes: formData.durationMinutes,
          price: formData.price,
          serviceImages: finalImages
        };
        await updateService(user.shopId, editData.id, payload);
        toast({ title: 'Success', description: 'Service updated.' });
      } else {
        // CREATE
        const payload = { ...formData, serviceImages: finalImages };
        await addService(user.shopId, payload);
        toast({ title: 'Success', description: 'Service added.' });
      }

      onSuccess();
      handleClose();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.message || 'Failed' });
    } finally { setIsLoading(false); }
  };

  const handleClose = () => {
    setFormData(emptyState);
    setErrors({});
    setFiles([]);
    setExistingImages([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-card border-border text-foreground p-0">
        <div className="sticky top-0 bg-card z-10 p-6 border-b border-border flex justify-between items-start">
          <div>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Store size={20} className="text-primary" />
              {isEditMode ? 'Edit Service' : 'Add New Service'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              {isEditMode ? 'Update pricing, duration and images.' : 'Add a service to your shop menu.'}
            </DialogDescription>
          </div>
          <button onClick={handleClose} className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none">
             <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Disabled in Edit Mode as backend only updates Price/Duration/Images */}
            <Field label="Name" name="name" value={formData.name} onChange={handleChange} required icon={Tag} error={errors.name} disabled={isEditMode} />
            
            <Field label="Price ($)" name="price" type="number" value={formData.price || ''} onChange={handleChange} required icon={DollarSign} error={errors.price} />

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5"><Clock size={12} /> Duration <span className="text-destructive">*</span></Label>
              <select
                name="durationMinutes"
                value={formData.durationMinutes}
                onChange={handleChange}
                className={`w-full h-10 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm ${errors.durationMinutes ? 'border-destructive' : ''}`}
              >
                {durationOptions.map(opt => (<option key={opt} value={opt}>{opt} minutes</option>))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Category</Label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={isEditMode}
                className={`w-full h-10 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm ${isEditMode ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {categoryOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Description</Label>
            <Textarea name="description" value={formData.description} onChange={handleChange} className="bg-muted/30 border-border" disabled={isEditMode} />
          </div>

          {/* Image Upload */}
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground">Service Images</Label>
            <div className="flex gap-2 flex-wrap">
              {existingImages.map((url, i) => (
                <div key={`ex-${i}`} className="relative w-20 h-20 rounded-md overflow-hidden border border-border group">
                  <img src={url} className="w-full h-full object-cover" alt="Existing" />
                  <button type="button" onClick={() => removeExistingFile(i)} className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100"><X size={12} color="white" /></button>
                </div>
              ))}
              {files.map((file, i) => (
                <div key={`new-${i}`} className="relative w-20 h-20 rounded-md overflow-hidden border border-border group">
                  <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="New" />
                  <button type="button" onClick={() => removeNewFile(i)} className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100"><X size={12} color="white" /></button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-md border border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-primary transition-colors"
              >
                <Upload size={16} /><span className="text-[10px] mt-1">Add</span>
              </button>
            </div>
            <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFiles} />
          </div>
        </div>
        
        <DialogFooter className="sticky bottom-0 bg-card z-10 p-4 border-t border-border flex justify-between items-center">
          {/* Status Toggle (Only in Edit Mode) */}
          {isEditMode && (
            <div className="flex items-center gap-2">
              <Power size={16} className={isAvailable ? "text-green-500" : "text-muted-foreground"} />
              <Label htmlFor="status" className="text-sm font-medium">{isAvailable ? 'Available' : 'Unavailable'}</Label>
              <Switch
                id="status"
                checked={isAvailable}
                onCheckedChange={handleStatusChange}
              />
            </div>
          )}
          
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleClose}>Cancel</Button>
            <Button variant="hero" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isEditMode ? 'Update Details' : 'Add Service'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default AddServiceModal;