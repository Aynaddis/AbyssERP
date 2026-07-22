import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listAuditLogs } from '@/api/auditLogs';

const actionStyles: Record<string, string> = {
  CREATE: 'bg-green-500/10 text-green-500',
  UPDATE: 'bg-blue-500/10 text-blue-500',
  DELETE: 'bg-red-500/10 text-red-500',
  CANCEL: 'bg-red-500/10 text-red-500',
  RECEIVE: 'bg-green-500/10 text-green-500',
  DEACTIVATE: 'bg-orange-500/10 text-orange-500',
  REACTIVATE: 'bg-green-500/10 text-green-500',
};

export default function AuditLogPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['auditLogs', page],
    queryFn: () => listAuditLogs(page, 20),
  });

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-bold">Audit Log</h1>
        <p className="text-sm text-[var(--color-muted)]">
          {data?.pagination.total ?? 0} recorded actions
        </p>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-muted)]">
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-[var(--color-muted)]">
                    Loading...
                  </td>
                </tr>
              )}
              {!isLoading && data?.items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-[var(--color-muted)]">
                    No actions recorded yet.
                  </td>
                </tr>
              )}
              {data?.items.map((log) => (
                <tr key={log.id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        actionStyles[log.action] ?? 'bg-[var(--color-panel-2)] text-[var(--color-muted)]'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3">{log.description}</td>
                  <td className="px-4 py-3 text-[var(--color-muted)]">
                    {log.user ? `${log.user.name} (${log.user.role})` : 'Unknown'}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-muted)]">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-border)] text-xs text-[var(--color-muted)]">
            <span>
              Page {data.pagination.page} of {data.pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 disabled:opacity-40 hover:bg-[var(--color-panel-2)] transition-colors"
              >
                Previous
              </button>
              <button
                disabled={page >= data.pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 disabled:opacity-40 hover:bg-[var(--color-panel-2)] transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}