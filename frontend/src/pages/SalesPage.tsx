import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, XCircle, FileDown, Download } from 'lucide-react';
import { listSales, cancelSale, downloadInvoice } from '@/api/sales';
import { listCustomers } from '@/api/customers';
import { downloadSalesReport } from '@/api/reports';
import { downloadBlob } from '@/lib/download';
import { useAuthStore } from '@/store/authStore';
import { SaleFormModal } from '@/components/SaleFormModal';
import { toast, toastErrorMessage } from '@/store/toastStore';

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

  const { data: customers } = useQuery({ queryKey: ['customers'], queryFn: listCustomers });
  const { data: sales, isLoading } = useQuery({ queryKey: ['sales'], queryFn: listSales });

  const cancelMutation = useMutation({
    mutationFn: cancelSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Sale cancelled');
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
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">Sales</h1>
          <p className="text-sm text-[var(--color-muted)]">{sales?.length ?? 0} sales recorded</p>
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
              {!isLoading && sales?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[var(--color-muted)]">
                    No sales yet.
                  </td>
                </tr>
              )}
              {sales?.map((sale) => (
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
      </div>

      {showForm && <SaleFormModal customers={customers ?? []} onClose={() => setShowForm(false)} />}
    </div>
  );
}