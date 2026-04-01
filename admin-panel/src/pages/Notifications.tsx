import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getNotifications, markAsRead, markAllAsRead, type AppNotification } from '@/services/notificationService';
import { cn } from '@/lib/utils';

const timeAgo = (timestamp: string): string => {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const Notifications = () => {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  });

  const readMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
  });

  const readAllMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
  });

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {unread > 0 ? `${unread} unread` : 'All caught up'}
          </p>
        </div>
        {unread > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => readAllMutation.mutate()}
            disabled={readAllMutation.isPending}
          >
            {readAllMutation.isPending
              ? <Loader2 size={14} className="animate-spin" />
              : <CheckCheck size={14} />}
            Mark all read
          </Button>
        )}
      </div>

      <div className="glass-card divide-y divide-border">
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Bell size={40} className="text-muted-foreground/40" strokeWidth={1} />
            <p className="text-sm text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          notifications.map((n: AppNotification) => (
            <div
              key={n.id}
              className={cn(
                'flex items-start gap-4 p-4 cursor-pointer hover:bg-muted/30 transition-colors',
                !n.read && 'bg-primary/5'
              )}
              onClick={() => { if (!n.read) readMutation.mutate(n.id); }}
            >
              <div className={cn(
                'w-2 h-2 rounded-full mt-2 shrink-0',
                n.read ? 'bg-transparent' : 'bg-primary'
              )} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{n.title || 'Notification'}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{timeAgo(n.timestamp)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
