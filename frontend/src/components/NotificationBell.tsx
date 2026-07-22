import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  AlertTriangle,
  PackageCheck,
  DollarSign,
  UserPlus,
  CheckCheck,
} from 'lucide-react';
import {
  listNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/api/notifications';
import type { Notification } from '@/types/notification';

const typeIcons: Record<string, { icon: typeof Bell; className: string }> = {
  LOW_STOCK: { icon: AlertTriangle, className: 'text-red-500' },
  PO_RECEIVED: { icon: PackageCheck, className: 'text-green-500' },
  SALE_COMPLETED: { icon: DollarSign, className: 'text-[var(--color-accent)]' },
  EMPLOYEE_ADDED: { icon: UserPlus, className: 'text-blue-500' },
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => listNotifications(1, 10),
    refetchInterval: 30_000,
  });

  const readMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const readAllMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleNotificationClick(notification: Notification) {
    if (!notification.isRead) {
      readMutation.mutate(notification.id);
    }
  }

  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative shrink-0 text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
            <span className="text-sm font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={() => readAllMutation.mutate()}
                disabled={readAllMutation.isPending}
                className="flex items-center gap-1 text-xs font-semibold text-[var(--color-accent)] hover:opacity-80"
              >
                <CheckCheck size={13} />
                Mark all read
              </button>
            )}
          </div>

          {(!data || data.items.length === 0) && (
            <p className="px-4 py-8 text-center text-sm text-[var(--color-muted)]">
              No notifications yet.
            </p>
          )}

          <div className="divide-y divide-[var(--color-border)]">
            {data?.items.map((n) => {
              const config = typeIcons[n.type] ?? { icon: Bell, className: 'text-[var(--color-muted)]' };
              const Icon = config.icon;
              return (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-[var(--color-panel-2)] transition-colors ${
                    !n.isRead ? 'bg-[var(--color-panel-2)]/50' : ''
                  }`}
                >
                  <Icon size={16} className={`shrink-0 mt-0.5 ${config.className}`} />
                  <div className="min-w-0">
                    <p className={`text-xs ${!n.isRead ? 'font-semibold' : 'text-[var(--color-muted)]'}`}>
                      {n.message}
                    </p>
                    <p className="text-[10px] text-[var(--color-muted)] mt-0.5">
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>
                  {!n.isRead && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shrink-0 mt-1.5 ml-auto" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}