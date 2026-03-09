import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface AddShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddShopModal: React.FC<AddShopModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if(!name || !address || !city) {
      toast({ title: "Error", description: "Please fill required fields", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    // Simulate API call
    console.log("Creating shop:", { name, address, city, phone, description });
    
    // Replace with your API call: await createBarbershop({ ... })
    setTimeout(() => {
      setIsLoading(false);
      toast({ title: "Success", description: "Barbershop added successfully" });
      onSuccess();
      onClose();
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Barbershop</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right text-muted-foreground">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3 bg-muted/30 border-border" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right text-muted-foreground">Address</Label>
            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="col-span-3 bg-muted/30 border-border" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="city" className="text-right text-muted-foreground">City</Label>
            <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} className="col-span-3 bg-muted/30 border-border" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right text-muted-foreground">Phone</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="col-span-3 bg-muted/30 border-border" />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right text-muted-foreground pt-2">Bio</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3 bg-muted/30 border-border" rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="hero" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Add Shop'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddShopModal;