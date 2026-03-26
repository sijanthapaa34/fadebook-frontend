import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';
import type { BarberLeaveDTO, LeaveStatus } from '@/models/models';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getShopLeaves, approveLeave, rejectLeave } from '@/services/leaveService';
import { useAuthStore } from '@/store/authStore';

const statusStyles: Record<LeaveStatus, { color: string; icon: React.ReactNode; label: string }> = {
  PENDING: { color: 'text-yellow-500 bg-yellow-500/10', icon: <Clock size={14} />, label: 'Pending' },
  APPROVED: { color: 'text-emerald-500 bg-emerald-500/10', icon: <CheckCircle size={14} />, label: 'Approved' },
  REJECTED: { color: 'text-destructive bg-destructive/10', icon: <XCircle size={14} />, label: 'Rejected' },
};

const LeaveApproval = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const shopId = user?.shopId;

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [filter] = useState<'ALL' | LeaveStatus>('ALL');

  // Fetch Leaves
  const { data: pageData, isLoading } = useQuery({
    queryKey: ['shopLeaves', shopId],
    queryFn: () => getShopLeaves(shopId!),
    enabled: !!shopId,
  });

  const leaves: BarberLeaveDTO[] = pageData?.content || [];

  // Mutations
  const approveMutation = useMutation({
    mutationFn: (id: number) => approveLeave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopLeaves'] });
      toast({ title: 'Approved', description: 'Leave request approved.' });
      setSelectedId(null);
    },
    onError: () => toast({ variant: 'destructive', title: 'Error', description: 'Failed to approve.' })
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => rejectLeave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopLeaves'] });
      toast({ title: 'Rejected', description: 'Leave request rejected.' });
      setSelectedId(null);
    },
    onError: () => toast({ variant: 'destructive', title: 'Error', description: 'Failed to reject.' })
  });

  const filtered = leaves.filter(l => filter === 'ALL' || l.status === filter);
  const selected = leaves.find(l => l.id === selectedId);

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading requests...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Leave Requests</h1>
        <p className="text-sm text-muted-foreground">Manage barber leave applications</p>
      </div>

      <div className="flex gap-6 h-[calc(100vh-220px)]">
        {/* List */}
        <div className="flex-1 space-y-2 overflow-y-auto pr-2">
          {filtered.length === 0 && <div className="text-center text-muted-foreground py-10">No requests found.</div>}
          {filtered.map(leave => {
             const sc = statusStyles[leave.status];
             return (
              <div key={leave.id} onClick={() => setSelectedId(leave.id)} 
                className={`glass-card p-4 cursor-pointer transition-colors ${selectedId === leave.id ? 'border-primary/40' : ''}`}>
                 <div className="flex justify-between items-center">
                   <div>
                     <p className="font-medium text-sm">{leave.barberName}</p>
                     <p className="text-xs text-muted-foreground">{leave.startDate} → {leave.endDate}</p>
                   </div>
                   <span className={`text-[10px] px-2 py-1 rounded-full ${sc.color} flex items-center gap-1`}>
                     {sc.icon} {sc.label}
                   </span>
                 </div>
              </div>
            )
          })}
        </div>

        {/* Detail */}
        {selected && (
          <div className="w-[400px] glass-card p-6 flex flex-col overflow-y-auto sticky top-0">
             <h3 className="font-semibold mb-2">{selected.barberName}</h3>
             
             <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Calendar size={14} />
                <span>{selected.startDate === selected.endDate ? selected.startDate : `${selected.startDate} - ${selected.endDate}`}</span>
             </div>

             {/* FIX: Changed <Text> to <p> */}
             <div className="bg-muted/30 p-3 rounded-md mb-4">
                <p className="text-sm text-muted-foreground italic">"{selected.reason}"</p>
             </div>
             
             {selected.status === 'PENDING' && (
               <>
                 <Textarea value={noteInput} onChange={e => setNoteInput(e.target.value)} placeholder="Add optional admin notes (internal)..." className="mb-4" />
                 <div className="flex gap-2">
                   <Button 
                     variant="hero" 
                     className="flex-1" 
                     onClick={() => approveMutation.mutate(selected.id)}
                     disabled={approveMutation.isPending}
                   >
                     {approveMutation.isPending ? 'Approving...' : <><CheckCircle size={14} className="mr-1"/> Approve</>}
                   </Button>
                   <Button 
                     variant="destructive" 
                     className="flex-1" 
                     onClick={() => rejectMutation.mutate(selected.id)}
                     disabled={rejectMutation.isPending}
                   >
                      {rejectMutation.isPending ? 'Rejecting...' : <><XCircle size={14} className="mr-1"/> Reject</>}
                   </Button>
                 </div>
               </>
             )}

             {selected.status !== 'PENDING' && (
                <div className={`mt-4 p-3 rounded-md ${selected.status === 'APPROVED' ? 'bg-emerald-500/10' : 'bg-destructive/10'}`}>
                   {/* FIX: Changed <Text> to <p> */}
                   <p className={selected.status === 'APPROVED' ? 'text-emerald-600 text-sm' : 'text-destructive text-sm'}>
                     Request was {selected.status.toLowerCase()} on {selected.approvedAt || selected.rejectedAt}.
                   </p>
                </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveApproval;