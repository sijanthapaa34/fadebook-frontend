import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch'; 
import { useToast } from '@/hooks/use-toast';
import { registerBarber, updateBarberProfile, activateBarber, deactivateBarber } from '@/services/barberService';
import { uploadProfilePicture } from '@/services/userService';
import type { RegisterBarberRequest, BarberDTO, UpdateBarberRequest } from '@/models/models';
import { Loader2, User, Mail, Phone, Lock, Upload, X, Power } from 'lucide-react';
import api from '@/api/api';
import { useAuthStore } from '@/store/authStore';

interface AddBarberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: BarberDTO | null;
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

const emptyState: RegisterBarberRequest = {
  name: '',
  email: '',
  password: '',
  phone: '',
  bio: '',
  experienceYears: 0,
  skills: [] as any,
  workImages: [],
  commissionRate: 30
};

const AddBarberModal: React.FC<AddBarberModalProps> = ({ isOpen, onClose, onSuccess, editData }) => {
  const [formData, setFormData] = useState<RegisterBarberRequest>(emptyState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);

  const profileInputRef = useRef<HTMLInputElement>(null);
  const workImagesInputRef = useRef<HTMLInputElement>(null);

  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [workImageFiles, setWorkImageFiles] = useState<File[]>([]);
  const [existingWorkImages, setExistingWorkImages] = useState<string[]>([]);
  
  // Status State
  const [isActive, setIsActive] = useState(true);

  const isEditMode = !!editData;

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || '',
        email: editData.email || '',
        password: '', 
        phone: editData.phone || '',
        bio: editData.bio || '',
        experienceYears: editData.experienceYears || 0,
        skills: editData.skills || [],
        workImages: [],
        commissionRate: editData.commissionRate || 30,
      });
      setExistingWorkImages(editData.workImages || []);
      // Assuming BarberDTO has an 'active' or similar field, else default true
      setIsActive((editData as any).active ?? true); 
    } else {
      setFormData(emptyState);
      setExistingWorkImages([]);
      setIsActive(true);
    }
    setProfileFile(null);
    setWorkImageFiles([]);
    setErrors({});
  }, [editData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleProfileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setProfileFile(e.target.files[0]);
  };

  const handleWorkImagesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      setWorkImageFiles(prev => [...prev, ...Array.from(selectedFiles)]);
    }
  };

  const removeNewImage = (idx: number) => setWorkImageFiles(prev => prev.filter((_, i) => i !== idx));
  const removeExistingImage = (idx: number) => setExistingWorkImages(prev => prev.filter((_, i) => i !== idx));

  // Handle Status Toggle
  const handleStatusChange = async (checked: boolean) => {
    if (!user?.shopId || !editData) return;
    setIsActive(checked);

    try {
      if (checked) {
        await activateBarber(user.shopId, editData.id);
        toast({ title: 'Barber Activated' });
      } else {
        await deactivateBarber(user.shopId, editData.id);
        toast({ title: 'Barber Deactivated' });
      }
    } catch (err) {
      setIsActive(!checked);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update status' });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!isEditMode) {
        if (!formData.name) newErrors.name = 'Required';
        if (!formData.email) newErrors.email = 'Required';
        if (!formData.phone) newErrors.phone = 'Required';
        if (!formData.password || formData.password.length < 6) newErrors.password = 'Min 6 chars';
    }
    
    if (formData.commissionRate === undefined || formData.commissionRate < 0) newErrors.commissionRate = 'Valid % required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !user?.shopId) return;
    setIsLoading(true);
    try {
      let newImageUrls: string[] = [];
      if (workImageFiles.length > 0) {
        toast({ title: 'Uploading images...' });
        const promises = workImageFiles.map(f => uploadGenericFile(f, 'shop_image', formData.email));
        newImageUrls = await Promise.all(promises);
      }

      const finalWorkImages = [...existingWorkImages, ...newImageUrls];

      let skillsArray: string[] = [];
      if (formData.skills) {
        if (typeof formData.skills === 'string') {
          skillsArray = (formData.skills as string).split(',').map(s => s.trim()).filter(s => s);
        } else {
          skillsArray = formData.skills;
        }
      }

      if (isEditMode) {
        // UPDATE: Only send allowed mutable fields
        const payload: UpdateBarberRequest = {
          bio: formData.bio || undefined, // Send undefined if empty, or keep existing
          experienceYears: formData.experienceYears,
          skills: skillsArray,
          workImages: finalWorkImages,
          commissionRate: formData.commissionRate,
        };
        
        // Ensure we don't send empty values if backend expects strings
        if (!payload.bio) delete (payload as any).bio;

        await updateBarberProfile(editData.id, payload);

        if (profileFile) {
          try { await uploadProfilePicture(editData.id, profileFile); }
          catch (e) { console.warn("Profile pic update failed", e); }
        }

        toast({ title: 'Success', description: 'Barber profile updated.' });
      } else {
        // CREATE: Send everything
        const payload = { ...formData, workImages: finalWorkImages, skills: skillsArray };
        const newBarber = await registerBarber(user.shopId, payload);

        if (newBarber && newBarber.id && profileFile) {
          try { await uploadProfilePicture(newBarber.id, profileFile); }
          catch (e) { console.warn("Profile pic upload failed", e); }
        }
        toast({ title: 'Success', description: 'Barber registered.' });
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
    setProfileFile(null);
    setWorkImageFiles([]);
    setExistingWorkImages([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-card border-border text-foreground p-0">
        <div className="sticky top-0 bg-card z-10 p-6 border-b border-border flex justify-between items-start">
            <div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <User size={20} className="text-primary" />
                {isEditMode ? 'Edit Barber Profile' : 'Register New Barber'}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-1">
                {isEditMode ? 'Update professional details, commission and status.' : 'Create an account for a new barber.'}
                </DialogDescription>
            </div>
            <button onClick={handleClose} className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none">
                 <X className="h-4 w-4" />
            </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Profile Picture Section */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden">
                {profileFile ? (
                  <img src={URL.createObjectURL(profileFile)} className="w-full h-full object-cover" alt="Profile" />
                ) : editData?.profilePicture ? (
                  <img src={editData.profilePicture} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <User size={20} className="text-muted-foreground" />
                )}
              </div>
              <button type="button" onClick={() => profileInputRef.current?.click()} className="absolute -bottom-1 -right-1 bg-primary text-black rounded-full p-1">
                <Upload size={10} />
              </button>
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium">Profile Picture</p>
              <p className="text-[10px] text-muted-foreground">JPG, PNG. Max 2MB</p>
            </div>
            <input ref={profileInputRef} type="file" accept="image/*" className="hidden" onChange={handleProfileSelect} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Identity Fields: Disabled in Edit Mode */}
            <Field label="Full Name" name="name" value={formData.name} onChange={handleChange} required={!isEditMode} icon={User} error={errors.name} disabled={isEditMode} />
            <Field label="Phone" name="phone" value={formData.phone} onChange={handleChange} required={!isEditMode} icon={Phone} error={errors.phone} disabled={isEditMode} />
           <Field label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required={!isEditMode} icon={Mail} error={errors.email} disabled={isEditMode} />
            {/* Password: Only for New */}
            {!isEditMode && (
              <Field label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required icon={Lock} error={errors.password} />
            )}
            
            {/* Manageable Fields: Editable Always */}
            <Field label="Experience (Years)" name="experienceYears" type="number" value={formData.experienceYears || ''} onChange={handleChange} />
            <Field label="Commission (%)" name="commissionRate" type="number" value={formData.commissionRate || ''} onChange={handleChange} required />
          </div>
          
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Skills (comma separated)</Label>
            <Input name="skills" value={formData.skills || ''} onChange={handleChange} placeholder="Fades, Shaves, Beard Trim" className="bg-muted/30 border-border" />
          </div>
          
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Bio</Label>
            <Textarea name="bio" value={formData.bio} onChange={handleChange} className="bg-muted/30 border-border" />
          </div>

          {/* Work Images */}
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground">Work Images (Portfolio)</Label>
            <div className="flex gap-2 flex-wrap">
              {existingWorkImages.map((url, i) => (
                <div key={`ex-${i}`} className="relative w-20 h-20 rounded-md overflow-hidden border border-border group">
                  <img src={url} className="w-full h-full object-cover" alt="Work" />
                  <button type="button" onClick={() => removeExistingImage(i)} className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100"><X size={12} color="white" /></button>
                </div>
              ))}
              {workImageFiles.map((file, i) => (
                <div key={`new-${i}`} className="relative w-20 h-20 rounded-md overflow-hidden border border-border group">
                  <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="Work" />
                  <button type="button" onClick={() => removeNewImage(i)} className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100"><X size={12} color="white" /></button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => workImagesInputRef.current?.click()}
                className="w-20 h-20 rounded-md border border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-primary transition-colors"
              >
                <Upload size={16} /><span className="text-[10px] mt-1">Add</span>
              </button>
            </div>
            <input ref={workImagesInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleWorkImagesSelect} />
          </div>
        </div>
        
        <DialogFooter className="sticky bottom-0 bg-card z-10 p-4 border-t border-border flex justify-between items-center">
            {/* Status Toggle (Only in Edit Mode) */}
            {isEditMode && (
                <div className="flex items-center gap-2">
                <Power size={16} className={isActive ? "text-green-500" : "text-muted-foreground"} />
                <Label htmlFor="barber-status" className="text-sm font-medium">{isActive ? 'Active' : 'Inactive'}</Label>
                <Switch
                    id="barber-status"
                    checked={isActive}
                    onCheckedChange={handleStatusChange}
                />
                </div>
            )}
            
            <div className="flex gap-2">
                <Button variant="ghost" onClick={handleClose}>Cancel</Button>
                <Button variant="hero" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {isEditMode ? 'Update Profile' : 'Register Barber'}
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default AddBarberModal;