import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Search, CheckCircle, XCircle, Clock, Scissors, Store, ShieldCheck, Loader2 } from 'lucide-react';
import type { ApplicationResponseDTO } from '@/models/models';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMainAdminApplications, approveApplication, rejectApplication } from '@/services/applicationService';
import { getDisplayableUrl } from '@/utils/imageUtils';
// IMPORT DIALOG
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const statusConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  PENDING: { icon: <Clock size={14} />, label: 'Pending', color: 'text-yellow-500 bg-yellow-500/10' },
  PENDING_MAIN_APPROVAL: { icon: <ShieldCheck size={14} />, label: 'Awaiting Admin', color: 'text-blue-400 bg-blue-400/10' },
  APPROVED: { icon: <CheckCircle size={14} />, label: 'Approved', color: 'text-emerald-500 bg-emerald-500/10' },
  REJECTED: { icon: <XCircle size={14} />, label: 'Rejected', color: 'text-destructive bg-destructive/10' },
};

const Applications = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [filter, setFilter] = useState<'ALL' | string>('ALL');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [noteInput, setNoteInput] = useState('');
  
  // STATE FOR REJECT MODAL
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  // Fetch Main Admin Applications
  const { data: pageData, isLoading } = useQuery({
    queryKey: ['mainAdminApplications'],
    queryFn: () => getMainAdminApplications(0, 50)
  });

    const approveMutation = useMutation({
    mutationFn: (id: number) => approveApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mainAdminApplications'] });
      toast({ title: 'Success', description: 'Application approved and account created.' });
      setSelectedId(null);
      setNoteInput('');
    },
    onError: (error: any) => {
      // FIX: Extract specific message from backend response
      const message = error?.response?.data?.message || 'Failed to approve application.';
      toast({ variant: 'destructive', title: 'Approval Failed', description: message });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => rejectApplication(id, noteInput),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mainAdminApplications'] });
      toast({ title: 'Success', description: 'Application rejected.' });
      setIsRejectModalOpen(false); 
      setSelectedId(null);
      setNoteInput('');
    },
    onError: (error: any) => {
      // FIX: Extract specific message from backend response
      const message = error?.response?.data?.message || 'Failed to reject application.';
      toast({ variant: 'destructive', title: 'Rejection Failed', description: message });
    }
  });

  const apps: ApplicationResponseDTO[] = pageData?.content || [];

  const filtered = apps
    .filter(a => filter === 'ALL' || a.status === filter)
    .filter(a => 
      a.name.toLowerCase().includes(search.toLowerCase()) || 
      a.email.toLowerCase().includes(search.toLowerCase())
    );

  const selected = apps.find(a => a.id === selectedId);

  const canActOn = (app: ApplicationResponseDTO) => {
    return app.status === 'PENDING' || app.status === 'PENDING_MAIN_APPROVAL';
  };

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
      { label: 'Applied On', value: new Date(app.createdAt).toLocaleDateString() },
    ];

    if (app.type === 'BARBER') {
      items.push(
        { label: 'Applied Shop', value: app.barbershopName || 'N/A' }, 
        { label: 'City', value: app.city },
        { label: 'Experience', value: `${app.experienceYears || 0} years` },
        { label: 'Skills', value: app.skills?.join(', ') },
        { label: 'Bio', value: app.bio }
      );
    } else {
      items.push(
        { label: 'Shop Name', value: app.shopName },
        { label: 'Owner', value: app.name },
        { label: 'Address', value: app.address },
        { label: 'Website', value: app.website },
        { label: 'Hours', value: app.operatingHours },
        { label: 'Description', value: app.description }
      );
    }
    
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
    if (app.documentUrl) personalDocs.push({ url: app.documentUrl, label: 'Document' });

    const shopGallery: string[] = app.shopImages || [];

    if (personalDocs.length === 0 && shopGallery.length === 0) {
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

        {shopGallery.length > 0 && (
          <div>
            <p className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wide">Shop Gallery ({shopGallery.length})</p>
            <div className="grid grid-cols-3 gap-2">
              {shopGallery.map((url, i) => {
                 const displayUrl = getDisplayableUrl(url);
                 if (!displayUrl) return null;
                 return (
                  <a key={i} href={displayUrl} target="_blank" rel="noreferrer" className="group relative block">
                    <div className="w-full aspect-square rounded-md overflow-hidden bg-muted border border-border flex items-center justify-center">
                      <img src={displayUrl} className="w-full h-full object-cover" alt={`Shop ${i+1}`} />
                    </div>
                    {/* FIXED: Added Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                      <span className="text-white text-[10px] font-medium">Photo {i+1}</span>
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
          <h1 className="text-2xl font-display font-bold">Main Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Final approval for shops & barbers</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-muted/50 border-border" />
          </div>
          <div className="flex gap-1 bg-muted/30 p-1 rounded-md">
            {['ALL', 'PENDING', 'PENDING_MAIN_APPROVAL', 'APPROVED', 'REJECTED'].map(s => (
              <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${filter === s ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-6 h-[calc(100vh-220px)]">
          {/* List Panel */}
          <div className="flex-1 space-y-2 overflow-y-auto pr-2">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="animate-spin text-muted-foreground" />
              </div>
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
                        <div className={`w-9 h-9 rounded-md flex items-center justify-center ${app.type === 'BARBER' ? 'bg-primary/10 text-primary' : 'bg-blue-500/10 text-blue-400'}`}>
                          {app.type === 'BARBER' ? <Scissors size={16} /> : <Store size={16} />}
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

          {/* Detail Panel */}
          {selected && (
            <div className="w-[400px] glass-card p-6 flex flex-col overflow-y-auto sticky top-0">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selected.type === 'BARBER' ? 'bg-primary/10 text-primary' : 'bg-blue-500/10 text-blue-400'}`}>
                  {selected.type === 'BARBER' ? <Scissors size={20} /> : <Store size={20} />}
                </div>
                <div>
                  <h3 className="font-semibold">{selected.name}</h3>
                  <p className="text-xs text-muted-foreground">{selected.type === 'BARBER' ? 'Barber Application' : 'Shop Application'}</p>
                </div>
              </div>

              <div className="space-y-1 text-sm mb-4 border-b border-border pb-4">
                {renderDetails(selected)}
              </div>

              {renderPhotos(selected)}

              {canActOn(selected) && (
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

export default Applications;