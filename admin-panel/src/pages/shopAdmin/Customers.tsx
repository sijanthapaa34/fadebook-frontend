import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Award, TrendingUp, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import api from '@/api/api';
import type { CustomerDTO, PageResponse } from '@/models/models';

const ShopCustomers = () => {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<'all' | 'regular'>('all');
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['shopCustomers', user?.shopId, activeTab, page],
    queryFn: async () => {
      if (!user?.shopId) throw new Error('No shop ID');
      const endpoint = activeTab === 'regular' 
        ? `/customers/shop/${user.shopId}/regular` 
        : `/customers/shop/${user.shopId}`;
      const response = await api.get<PageResponse<CustomerDTO>>(endpoint, {
        params: { page, size: pageSize }
      });
      return response.data;
    },
    enabled: !!user?.shopId,
  });

  const customers = data?.content || [];
  const totalPages = data?.totalPages || 0;

  if (!user?.shopId) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">No shop associated with your account</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Customers</h1>
          <p className="text-muted-foreground text-sm">View your shop's customer base</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">{data?.totalElements || 0}</p>
              </div>
              <Users className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Regular Customers</p>
                <p className="text-2xl font-bold">
                  {activeTab === 'regular' ? data?.totalElements || 0 : '-'}
                </p>
              </div>
              <Award className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Bookings</p>
                <p className="text-2xl font-bold">
                  {customers.length > 0
                    ? (customers.reduce((sum, c) => sum + (c.totalBookings || 0), 0) / customers.length).toFixed(1)
                    : '0'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'all' ? 'default' : 'outline'}
          onClick={() => { setActiveTab('all'); setPage(0); }}
        >
          <Users size={16} className="mr-2" />
          All Customers
        </Button>
        <Button
          variant={activeTab === 'regular' ? 'default' : 'outline'}
          onClick={() => { setActiveTab('regular'); setPage(0); }}
        >
          <Award size={16} className="mr-2" />
          Regular Customers (3+ Bookings)
        </Button>
      </div>

      {/* Customer List */}
      {isLoading ? (
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : customers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users size={48} className="text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">
              {activeTab === 'regular' 
                ? 'No regular customers yet. Keep providing great service!' 
                : 'No customers have booked at your shop yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.map((customer) => (
              <Card key={customer.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{customer.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">{customer.email}</p>
                    </div>
                    {customer.totalBookings >= 10 && (
                      <Badge variant="default" className="ml-2">
                        <Award size={12} className="mr-1" />
                        VIP
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Bookings</span>
                    <span className="font-semibold">{customer.totalBookings || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Loyalty Points</span>
                    <span className="font-semibold text-primary flex items-center gap-1">
                      <TrendingUp size={14} />
                      {customer.points || 0}
                    </span>
                  </div>
                  {customer.phone && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Phone</span>
                      <span className="text-xs">{customer.phone}</span>
                    </div>
                  )}
                  {customer.status && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant={customer.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {customer.status}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ShopCustomers;
