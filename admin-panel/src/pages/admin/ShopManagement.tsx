import { seedShops } from '@/data/seed';
import { Button } from '@/components/ui/button';
import { Plus, MapPin, Star, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const ShopManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Shop Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage all registered barbershops</p>
        </div>
        <Button variant="hero"><Plus size={16} className="mr-2" /> Add Shop</Button>
      </div>

      <div className="grid gap-4">
        {seedShops.map((shop) => (
          <div key={shop.id} className="glass-card p-5 flex items-center justify-between hover:border-primary/20 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <MapPin size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">{shop.name}</h3>
                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/20">Active</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{shop.city}, {shop.state}</span>
                  <span className="flex items-center gap-1 text-primary font-medium">
                    <Star size={12} fill="currentColor" /> {shop.rating} ({shop.reviewCount} reviews)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">View Details</Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem><Edit size={14} className="mr-2" /> Edit Shop</DropdownMenuItem>
                  <DropdownMenuItem>View Barbers</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive focus:text-destructive">
                    <Trash2 size={14} className="mr-2" /> Suspend Shop
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopManagement;