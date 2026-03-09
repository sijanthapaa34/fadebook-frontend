import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Search, CheckCircle, XCircle, Clock, Scissors, Store, ArrowRight, ShieldCheck } from 'lucide-react';
import type { ApplicationRecord, BarberApprovalStatus } from '@/models/models';
import { seedApplications } from '@/data/seed';
import { useToast } from '@/hooks/use-toast';

// ... (statusConfig and helper functions remain the same) ...
const statusConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  PENDING: { icon: <Clock size={14} />, label: 'Pending', color: 'text-yellow-500 bg-yellow-500/10' },
  PENDING_SHOP_APPROVAL: { icon: <Clock size={14} />, label: 'Awaiting Shop', color: 'text-yellow-500 bg-yellow-500/10' },
  PENDING_MAIN_APPROVAL: { icon: <ShieldCheck size={14} />, label: 'Awaiting Admin', color: 'text-blue-400 bg-blue-400/10' },
  APPROVED: { icon: <CheckCircle size={14} />, label: 'Approved', color: 'text-emerald-500 bg-emerald-500/10' },
  REJECTED: { icon: <XCircle size={14} />, label: 'Rejected', color: 'text-destructive bg-destructive/10' },
};

const Applications = () => {
  const { toast } = useToast();
  const [apps, setApps] = useState<ApplicationRecord[]>(seedApplications);
  const [filter, setFilter] = useState<'ALL' | string>('ALL');
  const [typeFilter] = useState<'ALL' | 'BARBER' | 'SHOP'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');

  const filtered = apps
    .filter(a => filter === 'ALL' || a.status === filter)
    .filter(a => typeFilter === 'ALL' || a.type === typeFilter)
    .filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase()));

  const selected = apps.find(a => a.id === selectedId);

  const updateApp = (id: string, updates: Partial<ApplicationRecord>) => {
    setApps(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const handleShopAction = (id: string, action: 'APPROVED' | 'REJECTED') => {
    updateApp(id, { status: action, mainAdminNotes: noteInput });
    toast({ title: `Shop ${action}`, description: 'Action completed successfully.' });
    setNoteInput('');
  };

  const handleBarberAction = (id: string, action: 'approve' | 'reject') => {
    const app = apps.find(a => a.id === id);
    if (!app) return;

    if (app.status === 'PENDING_SHOP_APPROVAL') {
      const newStatus = action === 'approve' ? 'PENDING_MAIN_APPROVAL' : 'REJECTED';
      updateApp(id, { status: newStatus as BarberApprovalStatus, shopAdminNotes: noteInput });
      toast({ title: action === 'approve' ? 'Shop Approved' : 'Rejected', description: 'Moved to next stage.' });
    } else if (app.status === 'PENDING_MAIN_APPROVAL') {
      const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
      updateApp(id, { status: newStatus, mainAdminNotes: noteInput });
      toast({ title: action === 'approve' ? 'Final Approval' : 'Rejected', description: 'Process complete.' });
    }
    setNoteInput('');
  };
  
  // ... (getApprovalFlow and canActOn remain the same) ...
  const getApprovalFlow = (app: ApplicationRecord) => {
    if (app.type === 'SHOP') return <span className="text-xs">① Main Admin Review</span>;
    return (
      <div className="flex items-center gap-1.5 text-xs">
        <span>① Shop Admin</span>
        <ArrowRight size={10} />
        <span>② Main Admin</span>
      </div>
    );
  };

  const canActOn = (app: ApplicationRecord) => {
    if (app.type === 'SHOP') return app.status === 'PENDING';
    return app.status === 'PENDING_SHOP_APPROVAL' || app.status === 'PENDING_MAIN_APPROVAL';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Applications</h1>
        <p className="text-sm text-muted-foreground">Multi-level approval for barbers & shops</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-muted/50 border-border" />
        </div>
        <div className="flex gap-1 bg-muted/30 p-1 rounded-md">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${filter === s ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-6 h-[calc(100vh-220px)]">
        {/* List Panel */}
        <div className="flex-1 space-y-2 overflow-y-auto pr-2">
          {filtered.map(app => {
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
          })}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="w-[400px] glass-card p-6 flex flex-col overflow-y-auto sticky top-0">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selected.type === 'BARBER' ? 'bg-primary/10 text-primary' : 'bg-blue-500/10 text-blue-400'}`}>
                {selected.type === 'BARBER' ? <Scissors size={20} /> : <Store size={20} />}
              </div>
              <div>
                <h3 className="font-semibold">{selected.name}</h3>
                <p className="text-xs text-muted-foreground">{selected.type}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm mb-6">
              {Object.entries(selected.details).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-muted-foreground capitalize">{k}</span>
                  <span className="font-medium text-right">{v}</span>
                </div>
              ))}
            </div>

            {selected.photos.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-medium mb-2">Attachments</p>
                <div className="grid grid-cols-3 gap-2">
                  {selected.photos.map((img, i) => (
                    <img key={i} src={img} className="w-full aspect-square object-cover rounded-md" />
                  ))}
                </div>
              </div>
            )}

            {canActOn(selected) && (
              <>
                <Textarea
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                  placeholder="Add notes..."
                  className="bg-muted/30 border-border mb-4"
                />
                <div className="flex gap-2 mt-auto">
                  <Button variant="hero" className="flex-1" onClick={() => selected.type === 'SHOP' ? handleShopAction(selected.id, 'APPROVED') : handleBarberAction(selected.id, 'approve')}>
                    <CheckCircle size={14} className="mr-2"/> Approve
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={() => selected.type === 'SHOP' ? handleShopAction(selected.id, 'REJECTED') : handleBarberAction(selected.id, 'reject')}>
                    <XCircle size={14} className="mr-2"/> Reject
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;