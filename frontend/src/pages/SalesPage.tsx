import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, XCircle, FileDown, Download, Search } from 'lucide-react';
import { listSales, cancelSale, downloadInvoice, type SaleDateRange } from '@/api/sales';
import { listCustomers } from '@/api/customers';
import { downloadSalesReport } from '@/api/reports';
import { downloadBlob } from '@/lib/download';
import { useAuthStore } from '@/store/authStore';
import { SaleFormModal } from '@/components/SaleFormModal';
import { toast, toastErrorMessage } from '@/store/toastStore';
import type { SaleStatus } from '@/types/sales';

const statusStyles: Record<string, string> = {
  COMPLETED: 'bg-green-500/10 text-green-500',
  CANCELLED: 'bg-red-500/10 text-red-500',
};

export default function SalesPage() {
  const queryClient = useQueryClient();
  const hasRole = useAuthStore((s) => s.hasRole);
  const canCancel = hasRole('ADMIN', 'MANAGER');

  const [showForm, setShowForm] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [exportingCsv, setExportingCsv] = useState(false);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [dateRange, setDateRange] = useState<SaleDateRange | ''>('');
  const [statusFilter, setStatusFilter] = useState<SaleStatus | ''>('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => setPage(1), [debouncedSearch, dateRange, statusFilter]);

  const { data: customers } = useQuery({ queryKey: ['customers'], queryFn: listCustomers });
  const { data, isLoading } = useQuery({
    queryKey: ['sales', { search: debouncedSearch, dateRange, statusFilter, page }],
    queryFn: () =>
      listSales({
        search: debouncedSearch || undefined,
        dateRange: dateRange || undefined,
        status: statusFilter || undefined,
        page,
        limit: 10,
      }),
  });

  const cancelMutation = useMutation({
    mutationFn: cancelSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Sale cancelled — stock restored');
    },
    onError: (err) => toast.error(toastErrorMessage(err, 'Failed to cancel sale')),
  });

  function handleCancel(id: string) {
    if (confirm('Cancel this sale? Stock will be restored.')) {
      cancelMutation.mutate(id);
    }
  }

  async function handleDownloadInvoice(id: string) {
    setDownloadingId(id);
    try {
      const blob = await downloadInvoice(id);
      downloadBlob(blob, `invoice-${id.slice(-8)}.pdf`);
    } catch (err) {
      toast.error(toastErrorMessage(err, 'Failed to download invoice'));
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleExportCsv() {
    setExportingCsv(true);
    try {
      const blob = await downloadSalesReport();
      downloadBlob(blob, 'sales-report.csv');
    } catch (err) {
      toast.error(toastErrorMessage(err, 'Failed to export sales report'));
    } finally {
      setExportingCsv(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-bold">Sales</h1>
          <p className="text-sm text-[var(--color-muted)]">{data?.pagination.total ?? 0} sales recorded</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            disabled={exportingCsv}
            className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] text-sm font-semibold px-4 py-2.5 hover:bg-[var(--color-panel-2)] transition-colors disabled:opacity-50"
          >
            <FileDown size={16} />
            {exportingCsv ? 'Exporting...' : 'Export CSV'}
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-lg bg-[var(--color-accent)] text-black text-sm font-semibold px-4 py-2.5 hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
            New Sale
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer or sale ID..."
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] pl-9 pr-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
          />
        </div>

        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as SaleDateRange | '')}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
        >
          <option value="">All time</option>
          <option value="today">Today</option>
          <option value="week">This week</option>
          <option value="month">This month</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as SaleStatus | '')}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
        >
          <option value="">All statuses</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-muted)]">
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[var(--color-muted)]">
                    Loading...
                  </td>
                </tr>
              )}
              {!isLoading && data?.items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[var(--color-muted)]">
                    No sales found.
                  </td>
                </tr>
              )}
              {data?.items.map((sale) => (
                <tr key={sale.id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="px-4 py-3 font-medium">{sale.customer?.name ?? 'Walk-in'}</td>
                  <td className="px-4 py-3 text-[var(--color-muted)]">{sale.items.length} item(s)</td>
                  <td className="px-4 py-3">${sale.totalAmount.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[sale.status]}`}>
                      {sale.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-muted)]">
                    {new Date(sale.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleDownloadInvoice(sale.id)}
                        disabled={downloadingId === sale.id}
                        aria-label="Download invoice"
                        title="Download invoice PDF"
                        className="text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors disabled:opacity-40"
                      >
                        <Download size={15} />
                      </button>
                      {canCancel && sale.status === 'COMPLETED' && (
                        <button
                          onClick={() => handleCancel(sale.id)}
                          disabled={cancelMutation.isPending}
                          className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:opacity-80 disabled:opacity-40"
                        >
                          <XCircle size={14} />
                          Cancel
                        </button>
                      )}
                    </div>
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

      {showForm && <SaleFormModal customers={customers ?? []} onClose={() => setShowForm(false)} />}
    </div>
  );
}