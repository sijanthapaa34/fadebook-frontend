import { seedBarbers } from '@/data/seed';
import { Button } from '@/components/ui/button';
import { Plus, User, Star, MoreVertical, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const BarberManagement = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-display font-bold">Barber Management</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your team</p>
      </div>
      <Button variant="hero"><Plus size={16} className="mr-2" /> Add Barber</Button>
    </div>

    <div className="grid grid-cols-2 gap-4">
      {seedBarbers.filter((b) => b.shopId === 1).map((barber) => (
        <div key={barber.id} className="glass-card p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <User size={20} />
            </div>
            <div>
              <p className="font-semibold">{barber.name}</p>
              <p className="text-xs text-muted-foreground">{barber.skills?.slice(0, 2).join(' · ')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1 text-sm text-primary">
               <Star size={14} fill="currentColor" /> {barber.rating}
             </div>
             <Badge variant={barber.active ? "default" : "destructive"} className="text-xs">
               {barber.active ? 'Active' : 'Inactive'}
             </Badge>
             <Button variant="ghost" size="icon"><Edit size={16}/></Button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default BarberManagement;