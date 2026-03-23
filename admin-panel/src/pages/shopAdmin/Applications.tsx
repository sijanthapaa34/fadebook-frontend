import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Search, CheckCircle, XCircle, Clock, Scissors, Loader2 } from 'lucide-react';
import type { ApplicationResponseDTO, PageResponse } from '@/models/models';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getShopAdminApplications, approveByShopAdmin, rejectApplication } from '@/services/applicationService';
import { getDisplayableUrl } from '@/utils/imageUtils';
import { useAuthStore } from '@/store/authStore';

import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';

const statusConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  PENDING: { icon: <Clock size={14} />, label: 'New Applicant', color: 'text-yellow-500 bg-yellow-500/10' },
  APPROVED: { icon: <CheckCircle size={14} />, label: 'Approved', color: 'text-emerald-500 bg-emerald-500/10' },
  REJECTED: { icon: <XCircle size={14} />, label: 'Rejected', color: 'text-destructive bg-destructive/10' },
};

const EMPTY_RESPONSE: PageResponse<ApplicationResponseDTO> = {
  content: [],
  page: 0,
  size: 0,
  totalElements: 0,
  totalPages: 0,
  last: true
};

const ShopApplications = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [noteInput, setNoteInput] = useState('');
  
  // STATE FOR REJECT MODAL
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const { data: pageData, isLoading } = useQuery({
    queryKey: ['shopAdminApplications', user?.shopId],
    queryFn: () => {
      if (user?.shopId) {
        return getShopAdminApplications(user.shopId, 0, 50);
      }
      return Promise.resolve(EMPTY_RESPONSE);
    },
    enabled: !!user?.shopId,
    initialData: EMPTY_RESPONSE
  });

    const approveMutation = useMutation({
    mutationFn: (id: number) => approveByShopAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopAdminApplications'] });
      toast({ title: 'Approved', description: 'Application sent to Main Admin for final review.' });
      setSelectedId(null);
      setNoteInput('');
    },
    onError: (error: any) => {
      // FIX: Extract specific message
      const message = error?.response?.data?.message || 'Failed to approve.';
      toast({ variant: 'destructive', title: 'Error', description: message });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => rejectApplication(id, noteInput),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopAdminApplications'] });
      toast({ title: 'Rejected', description: 'Application has been rejected.' });
      setIsRejectModalOpen(false);
      setSelectedId(null);
      setNoteInput('');
    },
    onError: (error: any) => {
      // FIX: Extract specific message
      const message = error?.response?.data?.message || 'Failed to reject.';
      toast({ variant: 'destructive', title: 'Error', description: message });
    }
  });

  const apps: ApplicationResponseDTO[] = pageData?.content || [];

  const filtered = apps.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  const selected = apps.find(a => a.id === selectedId);

  // --- HANDLERS ---

  const handleApprove = (id: number) => {
    approveMutation.mutate(id);
  };

  const openRejectModal = () => {
    setIsRejectModalOpen(true);
  };

  const confirmReject = () => {
    if (!noteInput.trim()) {
      toast({ variant: 'destructive', title: 'Reason Required', description: 'Please provide a reason.' });
      return;
    }
    if (selectedId) {
      rejectMutation.mutate(selectedId);
    }
  };

  const renderDetails = (app: ApplicationResponseDTO) => {
    const items: { label: string; value?: string | number | null }[] = [
      { label: 'Email', value: app.email },
      { label: 'Phone', value: app.phone },
      { label: 'City', value: app.city },
      { label: 'Experience', value: `${app.experienceYears || 0} years` },
      { label: 'Skills', value: app.skills?.join(', ') },
      { label: 'Bio', value: app.bio },
    ];
    
    return items.filter(item => item.value).map(item => (
      <div key={item.label} className="flex justify-between py-1">
        <span className="text-muted-foreground capitalize text-xs">{item.label}</span>
        <span className="font-medium text-right max-w-[200px] truncate text-xs" title={String(item.value)}>
          {String(item.value)}
        </span>
      </div>
    ));
  };

    const renderPhotos = (app: ApplicationResponseDTO) => {
    const personalDocs: { url: string; label: string }[] = [];
    if (app.profilePictureUrl) personalDocs.push({ url: app.profilePictureUrl, label: 'Profile' });
    if (app.licenseUrl) personalDocs.push({ url: app.licenseUrl, label: 'License' });

    if (personalDocs.length === 0) {
      return <div className="mb-6 text-xs text-center text-muted-foreground py-4 border border-dashed rounded">No attachments available</div>;
    }

    return (
      <div className="space-y-4 mb-6">
        {personalDocs.length > 0 && (
          <div>
            <p className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wide">Personal Documents</p>
            <div className="grid grid-cols-3 gap-2">
              {personalDocs.map((item, i) => {
                 const displayUrl = getDisplayableUrl(item.url);
                 if (!displayUrl) return null;
                 return (
                  <a key={i} href={displayUrl} target="_blank" rel="noreferrer" className="group relative block">
                    <div className="w-full aspect-square rounded-md overflow-hidden bg-muted border border-border flex items-center justify-center">
                      <img src={displayUrl} className="w-full h-full object-cover" alt={item.label} />
                    </div>
                    {/* FIXED: Added Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                      <span className="text-white text-[10px] font-medium">{item.label}</span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Barber Applications</h1>
          <p className="text-sm text-muted-foreground">Review barbers applying to your shop</p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search applicants..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-muted/50 border-border" />
          </div>
        </div>

        <div className="flex gap-6 h-[calc(100vh-220px)]">
          <div className="flex-1 space-y-2 overflow-y-auto pr-2">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-muted-foreground py-10">No pending applications</div>
            ) : (
              filtered.map(app => {
                const sc = statusConfig[app.status] || statusConfig.PENDING;
                return (
                  <div
                    key={app.id}
                    onClick={() => { setSelectedId(app.id); setNoteInput(''); }}
                    className={`glass-card p-4 cursor-pointer transition-colors hover:border-primary/30 ${selectedId === app.id ? 'border-primary ring-1 ring-primary/20' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-md flex items-center justify-center bg-primary/10 text-primary">
                          <Scissors size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{app.name}</p>
                          <p className="text-xs text-muted-foreground">{app.email}</p>
                        </div>
                      </div>
                      <span className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-medium ${sc.color}`}>
                        {sc.icon} {sc.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {selected && (
            <div className="w-[400px] glass-card p-6 flex flex-col overflow-y-auto sticky top-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
                  <Scissors size={20} />
                </div>
                <div>
                  <h3 className="font-semibold">{selected.name}</h3>
                  <p className="text-xs text-muted-foreground">Barber Applicant</p>
                </div>
              </div>

              <div className="space-y-1 text-sm mb-4 border-b border-border pb-4">
                {renderDetails(selected)}
              </div>

              {renderPhotos(selected)}

              {selected.status === 'PENDING' && (
                <div className="flex gap-2 mt-auto">
                  <Button 
                    variant="hero" 
                    className="flex-1" 
                    onClick={() => handleApprove(selected.id)}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                  >
                    {approveMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle size={14} className="mr-2"/>} 
                    Approve
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1" 
                    onClick={openRejectModal} // OPENS MODAL
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                  >
                    {rejectMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <XCircle size={14} className="mr-2"/>}
                    Reject
                  </Button>
                </div>
              )}
              
              {selected.status !== 'PENDING' && (
                <div className="mt-auto text-center text-xs text-muted-foreground border-t border-border pt-4">
                  This application is already processed.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* REJECT MODAL */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject <span className="font-bold text-foreground">{selected?.name}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label className="text-xs">Reason / Notes</Label>
            <Textarea 
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Enter reason for rejection..."
              className="mt-2"
              rows={4}
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmReject} disabled={rejectMutation.isPending}>
              {rejectMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShopApplications;