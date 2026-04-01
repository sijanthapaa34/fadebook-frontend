//src/pages/Settings.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import type { AdminUser } from '@/store/authStore'; // Import type for casting
import { updateAdminProfile, changeAdminPassword } from '@/services/adminService';
import { uploadProfilePicture } from '@/services/userService'; 
import { getDisplayableUrl } from '@/utils/imageUtils';
import { 
  Button 
} from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Loader2, Save, Plus, X, Edit3, User, Phone, Mail, Lock, ArrowLeft, LogOut 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // State
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordCard, setShowPasswordCard] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Loading States
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Ref for hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync local state with global store
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  // Handlers
  const handleImageClick = () => {
    if (user?.profilePicture) setIsModalOpen(true);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return; // Fix: Checks user existence

    setIsUploadingImage(true);
    try {
      // Fix: uploadProfilePicture now expects File
      const newImageUrl = await uploadProfilePicture(user.id, file);
      
      // Fix: Cast 'as AdminUser' to resolve type mismatch
      setUser({ ...user, profilePicture: newImageUrl } as AdminUser);
      
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      
      toast({ title: "Success", description: "Profile picture updated" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to upload image" });
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveChanges = async () => {
    if (!name.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Name cannot be empty" });
      return;
    }
    if (!user) return; // Fix: Checks user existence

    setIsUpdatingProfile(true);
    try {
      await updateAdminProfile(user.id, { name, phone });
      
      // Fix: Cast 'as AdminUser'
      setUser({ ...user, name, phone } as AdminUser);
      
      setIsEditing(false);
      toast({ title: "Success", description: "Profile updated successfully" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to update profile" });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ variant: "destructive", title: "Error", description: "Please fill in all fields" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ variant: "destructive", title: "Error", description: "Password must be at least 8 characters" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "Error", description: "New passwords do not match" });
      return;
    }
    if (!user) return; // Fix: Checks user existence

    setIsUpdatingPassword(true);
    try {
      await changeAdminPassword(user.id, { currentPassword, newPassword });
      toast({ title: "Success", description: "Password updated successfully" });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordCard(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to update password" });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (!user) return null;

  const displayProfilePicture = getDisplayableUrl(user.profilePicture);

  // ... (Return JSX remains exactly the same as your provided code)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-display font-bold">Settings</h1>
          <p className="text-muted-foreground text-sm">Manage your account details</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="glass-card p-6 space-y-6">
        
        {/* Avatar Section */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <div 
              className={`w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold overflow-hidden border-2 border-border ${displayProfilePicture ? 'cursor-pointer' : ''}`}
              onClick={handleImageClick}
            >
              {displayProfilePicture ? (
                <img src={displayProfilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{user.name?.charAt(0) || 'U'}</span>
              )}
              {isUploadingImage && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
            </div>
            
            {/* Plus Button */}
            <Button 
              size="icon" 
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full" 
              onClick={handleUploadClick}
              disabled={isUploadingImage}
            >
              <Plus size={16} />
            </Button>
            
            {/* Hidden File Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*" 
            />
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <Badge variant="outline" className="mt-2">{user.role.replace('_', ' ')}</Badge>
          </div>
        </div>

        <div className="border-t border-border" />

        {/* Details Section */}
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User size={18} className="text-primary" />
              <div className="flex-1 border-b border-border pb-2">
                <p className="text-xs text-muted-foreground uppercase">Full Name</p>
                <p className="font-medium">{user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-primary" />
              <div className="flex-1 border-b border-border pb-2">
                <p className="text-xs text-muted-foreground uppercase">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={18} className="text-primary" />
              <div className="flex-1 border-b border-border pb-2">
                <p className="text-xs text-muted-foreground uppercase">Phone</p>
                <p className="font-medium">{user.phone || 'Not set'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-4">
          {isEditing ? (
            <>
              <Button onClick={handleSaveChanges} disabled={isUpdatingProfile}>
                {isUpdatingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save size={16} className="mr-2" />}
                Save Changes
              </Button>
              <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit3 size={16} className="mr-2" /> Edit Profile
              </Button>
              <Button onClick={() => setShowPasswordCard(!showPasswordCard)}>
                <Lock size={16} className="mr-2" /> Change Password
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Password Card */}
      {showPasswordCard && (
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Lock size={20} className="text-primary" />
            <h3 className="text-lg font-semibold">Update Password</h3>
          </div>
          <div className="border-t border-border" />
          
          <div className="space-y-2">
            <Label>Current Password</Label>
            <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Confirm New Password</Label>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>

          <Button onClick={handlePasswordUpdate} disabled={isUpdatingPassword} className="w-full mt-2">
            {isUpdatingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Update Password
          </Button>
        </div>
      )}

      {/* Image Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl bg-black/90 border-transparent">
          <DialogHeader>
            <DialogTitle className="sr-only">Profile Image</DialogTitle>
          </DialogHeader>
          <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-white hover:text-gray-300">
            <X size={24} />
          </button>
          {displayProfilePicture && (
            <img src={displayProfilePicture} alt="Full screen profile" className="w-full h-auto max-h-[80vh] object-contain rounded-md" />
          )}
        </DialogContent>
      </Dialog>

      {/* Sign Out */}
      <div className="glass-card p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
          onClick={() => { logout(); navigate('/login'); }}
        >
          <LogOut size={16} />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Settings;