import { useState } from 'react';
import { seedLeaveRequests, seedAppointments } from '@/data/seed';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Clock, Calendar, AlertTriangle, Users } from 'lucide-react';
import type { LeaveRequest, LeaveStatus } from '@/models/models';
import { useToast } from '@/hooks/use-toast';

const statusStyles: Record<LeaveStatus, { color: string; icon: React.ReactNode; label: string }> = {
  PENDING: { color: 'text-yellow-500 bg-yellow-500/10', icon: <Clock size={14} />, label: 'Pending' },
  APPROVED: { color: 'text-emerald-500 bg-emerald-500/10', icon: <CheckCircle size={14} />, label: 'Approved' },
  REJECTED: { color: 'text-destructive bg-destructive/10', icon: <XCircle size={14} />, label: 'Rejected' },
};

const LeaveApproval = () => {
  const { toast } = useToast();
  const [leaves, setLeaves] = useState<LeaveRequest[]>(seedLeaveRequests);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [filter, setFilter] = useState<'ALL' | LeaveStatus>('ALL');

  const selected = leaves.find(l => l.id === selectedId);
  const filtered = leaves.filter(l => filter === 'ALL' || l.status === filter);

  // Find conflicting appointments
  const getConflicts = (leave: LeaveRequest) => {
    return seedAppointments.filter(a =>
      a.barberId === leave.barberId &&
      a.scheduledTime >= leave.startDate &&
      a.scheduledTime <= leave.endDate &&
      a.status !== 'CANCELLED' &&
      a.status !== 'COMPLETED'
    );
  };

  const handleAction = (id: number, status: LeaveStatus) => {
    const leave = leaves.find(l => l.id === id);
    if (!leave) return;

    const today = new Date().toISOString().split('T')[0];
    const conflicts = getConflicts(leave);

    setLeaves(prev => prev.map(l =>
      l.id === id ? { ...l, status, reviewedAt: today, adminNotes: noteInput || l.adminNotes } : l
    ));

    if (status === 'APPROVED' && conflicts.length > 0) {
      toast({
        title: 'Leave Approved with Conflicts',
        description: `${conflicts.length} appointment(s) during leave period will need rescheduling. Customers will be notified.`,
        variant: 'destructive',
      });
    } else {
      toast({
        title: status === 'APPROVED' ? 'Leave Approved' : 'Leave Rejected',
        description: status === 'APPROVED'
          ? 'The barber has been granted leave. New bookings will be blocked.'
          : 'The leave request has been rejected.',
      });
    }
    setNoteInput('');
  };
return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Leave Requests</h1>
        <p className="text-sm text-muted-foreground">Manage barber leave applications</p>
      </div>

      <div className="flex gap-6 h-[calc(100vh-220px)]">
        {/* List */}
        <div className="flex-1 space-y-2 overflow-y-auto pr-2">
          {leaves.map(leave => {
             const sc = statusStyles[leave.status];
             return (
              <div key={leave.id} onClick={() => setSelectedId(leave.id)} 
                className={`glass-card p-4 cursor-pointer transition-colors ${selectedId === leave.id ? 'border-primary/40' : ''}`}>
                 <div className="flex justify-between items-center">
                   <div>
                     <p className="font-medium text-sm">{leave.barberName}</p>
                     <p className="text-xs text-muted-foreground">{leave.startDate} → {leave.endDate}</p>
                   </div>
                   <span className={`text-[10px] px-2 py-1 rounded-full ${sc.color}`}>{sc.label}</span>
                 </div>
              </div>
            )
          })}
        </div>

        {/* Detail */}
        {selected && (
          <div className="w-[400px] glass-card p-6 flex flex-col overflow-y-auto sticky top-0">
             <h3 className="font-semibold mb-2">{selected.barberName}</h3>
             <p className="text-xs text-muted-foreground mb-4">{selected.reason}</p>
             
             {selected.status === 'PENDING' && (
               <>
                 <Textarea value={noteInput} onChange={e => setNoteInput(e.target.value)} placeholder="Admin notes..." className="mb-4" />
                 <div className="flex gap-2">
                   <Button variant="hero" className="flex-1" onClick={() => handleAction(selected.id, 'APPROVED')}><CheckCircle size={14} className="mr-1"/> Approve</Button>
                   <Button variant="destructive" className="flex-1" onClick={() => handleAction(selected.id, 'REJECTED')}><XCircle size={14} className="mr-1"/> Reject</Button>
                 </div>
               </>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveApproval;