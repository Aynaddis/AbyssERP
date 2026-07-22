import { useQuery } from '@tanstack/react-query';
import { getRecentActivity } from '@/api/auditLogs';

const actionDotColor: Record<string, string> = {
  CREATE: 'bg-green-500',
  UPDATE: 'bg-blue-500',
  DELETE: 'bg-red-500',
  CANCEL: 'bg-red-500',
  RECEIVE: 'bg-green-500',
  DEACTIVATE: 'bg-orange-500',
  REACTIVATE: 'bg-green-500',
};

export function RecentActivityCard() {
  const { data, isLoading } = useQuery({
    queryKey: ['auditLogs', 'recent'],
    queryFn: () => getRecentActivity(10),
    refetchInterval: 30_000,
  });

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
      <h3 className="text-sm font-semibold mb-4">Recent Activity</h3>

      {isLoading && <p className="text-xs text-[var(--color-muted)] text-center py-8">Loading...</p>}

      {!isLoading && data?.length === 0 && (
        <p className="text-xs text-[var(--color-muted)] text-center py-8">No activity yet.</p>
      )}

      <div className="space-y-4">
        {data?.map((log) => (
          <div key={log.id} className="flex gap-3">
            <div className="flex flex-col items-center pt-1">
              <span className={`w-2 h-2 rounded-full shrink-0 ${actionDotColor[log.action] ?? 'bg-[var(--color-muted)]'}`} />
              <span className="w-px flex-1 bg-[var(--color-border)] mt-1" />
            </div>
            <div className="pb-1 min-w-0">
              <p className="text-xs text-[var(--color-muted)]">
                {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {' · '}
                {log.user?.name ?? 'System'}
              </p>
              <p className="text-sm">{log.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}