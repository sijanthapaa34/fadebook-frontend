import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query'; // 1. Import useQueryClient
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, MapPin, Star, MoreVertical, Edit, Trash2, Search, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import AddShopModal from '@/pages/admin/AddShopModal';
import { fetchAllBarbershop, fetchShopsBySearch } from '@/services/barbershopService';

const ShopManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // 2. Initialize the client
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Search State
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce Effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Query Logic
  const { 
    data: shopsData, 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: ['shops', debouncedSearch],
    queryFn: () => 
      debouncedSearch.length > 0 
        ? fetchShopsBySearch(debouncedSearch) 
        : fetchAllBarbershop(),
    select: (data) => data.content || [], 
  });

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Shop Management</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage all registered barbershops</p>
          </div>
          <Button variant="hero" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} className="mr-2" /> Add Shop
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-1/3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or city..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 bg-muted/30 border-border"
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="text-center py-20 text-destructive">
            Failed to load shops. Please try again.
          </div>
        )}

        {/* Empty State */}
        {!isLoading && shopsData?.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            No shops found {debouncedSearch && `for "${debouncedSearch}"`}.
          </div>
        )}

        {/* Shop List */}
        <div className="grid gap-4">
          {shopsData?.map((shop) => (
            <div 
              key={shop.id} 
              className="glass-card p-5 flex items-center justify-between hover:border-primary/20 transition-colors cursor-pointer"
              onClick={() => navigate(`/admin/shops/${shop.id}`)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <MapPin size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{shop.name}</h3>
                    <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/20">
                      {shop.active !== false ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{shop.city}, {shop.state}</span>
                    <span className="flex items-center gap-1 text-primary font-medium">
                      <Star size={12} fill="currentColor" /> {shop.rating?.toFixed(1)} ({shop.reviewCount} reviews)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><Edit size={14} className="mr-2" /> Edit Shop</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/admin/shops/${shop.id}`)}>
                      <MapPin size={14} className="mr-2" /> View Details
                    </DropdownMenuItem>
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

      <AddShopModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          // 3. Now this works correctly
          queryClient.invalidateQueries({ queryKey: ['shops'] });
        }} 
      />
    </>
  );
};

export default ShopManagement;