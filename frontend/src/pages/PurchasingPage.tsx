import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, PackageCheck, XCircle } from 'lucide-react';
import { listPurchaseOrders, receivePurchaseOrder, cancelPurchaseOrder } from '@/api/purchases';
import { listSuppliers, deleteSupplier } from '@/api/suppliers';
import { useAuthStore } from '@/store/authStore';
import { SupplierFormModal } from '@/components/SupplierFormModal';
import { PurchaseOrderFormModal } from '@/components/PurchaseOrderFormModal';
import { toast, toastErrorMessage } from '@/store/toastStore';
import type { Supplier } from '@/types/purchasing';

const statusStyles: Record<string, string> = {
    PENDING: 'bg-yellow-500/10 text-yellow-500',
    RECEIVED: 'bg-green-500/10 text-green-500',
    CANCELLED: 'bg-red-500/10 text-red-500',
};

export default function PurchasingPage() {
    const queryClient = useQueryClient();
    const hasRole = useAuthStore((s) => s.hasRole);
    const canManage = hasRole('ADMIN', 'MANAGER');
    const canDeleteSupplier = hasRole('ADMIN'); // backend restricts supplier deletion to ADMIN only

    const [tab, setTab] = useState<'orders' | 'suppliers'>('orders');
    const [showPoForm, setShowPoForm] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null | undefined>(undefined);

    const { data: suppliers } = useQuery({ queryKey: ['suppliers'], queryFn: listSuppliers });
    const { data: orders, isLoading: ordersLoading } = useQuery({
        queryKey: ['purchaseOrders'],
        queryFn: listPurchaseOrders,
    });

    const receiveMutation = useMutation({
        mutationFn: receivePurchaseOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Purchase order received');
        },
        onError: (err) => toast.error(toastErrorMessage(err, 'Failed to receive purchase order')),
    });

    const cancelMutation = useMutation({
        mutationFn: cancelPurchaseOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
            toast.success('Purchase order cancelled');
        },
        onError: (err) => toast.error(toastErrorMessage(err, 'Failed to cancel purchase order')),
    });

    const deleteSupplierMutation = useMutation({
        mutationFn: deleteSupplier,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            toast.success('Supplier deleted');
        },
        onError: (err) => toast.error(toastErrorMessage(err, 'Failed to delete supplier')),
    });

    function handleDeleteSupplier(supplier: Supplier) {
        if (confirm(`Delete supplier "${supplier.name}"?`)) {
            deleteSupplierMutation.mutate(supplier.id);
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold">Purchasing</h1>
                {canManage && tab === 'orders' && (
                    <button
                        onClick={() => setShowPoForm(true)}
                        className="flex items-center gap-2 rounded-lg bg-[var(--color-accent)] text-black text-sm font-semibold px-4 py-2.5 hover:opacity-90 transition-opacity"
                    >
                        <Plus size={16} />
                        New Purchase Order
                    </button>
                )}
                {canManage && tab === 'suppliers' && (
                    <button
                        onClick={() => setEditingSupplier(null)}
                        className="flex items-center gap-2 rounded-lg bg-[var(--color-accent)] text-black text-sm font-semibold px-4 py-2.5 hover:opacity-90 transition-opacity"
                    >
                        <Plus size={16} />
                        Add Supplier
                    </button>
                )}
            </div>

            <div className="flex gap-1 mb-4 border-b border-[var(--color-border)]">
                {(['orders', 'suppliers'] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t
                            ? 'border-[var(--color-accent)] text-[var(--color-text)]'
                            : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-text)]'
                            }`}
                    >
                        {t === 'orders' ? 'Purchase Orders' : 'Suppliers'}
                    </button>
                ))}
            </div>

            {tab === 'orders' && (
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-muted)]">
                                    <th className="px-4 py-3 font-medium">Supplier</th>
                                    <th className="px-4 py-3 font-medium">Items</th>
                                    <th className="px-4 py-3 font-medium">Total Cost</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 font-medium">Order Date</th>
                                    {canManage && <th className="px-4 py-3 font-medium text-right">Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {ordersLoading && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-[var(--color-muted)]">
                                            Loading...
                                        </td>
                                    </tr>
                                )}
                                {!ordersLoading && orders?.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-[var(--color-muted)]">
                                            No purchase orders yet.
                                        </td>
                                    </tr>
                                )}
                                {orders?.map((order) => {
                                    const total = order.items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0);
                                    return (
                                        <tr key={order.id} className="border-b border-[var(--color-border)] last:border-0">
                                            <td className="px-4 py-3 font-medium">{order.supplier.name}</td>
                                            <td className="px-4 py-3 text-[var(--color-muted)]">{order.items.length} item(s)</td>
                                            <td className="px-4 py-3">${total.toFixed(2)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[order.status]}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-[var(--color-muted)]">
                                                {new Date(order.orderDate).toLocaleDateString()}
                                            </td>
                                            {canManage && (
                                                <td className="px-4 py-3">
                                                    {order.status === 'PENDING' && (
                                                        <div className="flex items-center justify-end gap-3">
                                                            <button
                                                                onClick={() => receiveMutation.mutate(order.id)}
                                                                disabled={receiveMutation.isPending}
                                                                className="flex items-center gap-1 text-xs font-semibold text-green-500 hover:opacity-80 disabled:opacity-40"
                                                            >
                                                                <PackageCheck size={14} />
                                                                Receive
                                                            </button>
                                                            <button
                                                                onClick={() => cancelMutation.mutate(order.id)}
                                                                disabled={cancelMutation.isPending}
                                                                className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:opacity-80 disabled:opacity-40"
                                                            >
                                                                <XCircle size={14} />
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === 'suppliers' && (
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-muted)]">
                                    <th className="px-4 py-3 font-medium">Name</th>
                                    <th className="px-4 py-3 font-medium">Email</th>
                                    <th className="px-4 py-3 font-medium">Phone</th>
                                    {canManage && <th className="px-4 py-3 font-medium text-right">Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {suppliers?.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-[var(--color-muted)]">
                                            No suppliers yet.
                                        </td>
                                    </tr>
                                )}
                                {suppliers?.map((s) => (
                                    <tr key={s.id} className="border-b border-[var(--color-border)] last:border-0">
                                        <td className="px-4 py-3 font-medium">{s.name}</td>
                                        <td className="px-4 py-3 text-[var(--color-muted)]">{s.email ?? '—'}</td>
                                        <td className="px-4 py-3 text-[var(--color-muted)]">{s.phone ?? '—'}</td>
                                        {canManage && (
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setEditingSupplier(s)}
                                                        aria-label="Edit supplier"
                                                        className="text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors"
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                    {canDeleteSupplier && (
                                                        <button
                                                            onClick={() => handleDeleteSupplier(s)}
                                                            aria-label="Delete supplier"
                                                            className="text-[var(--color-muted)] hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showPoForm && (
                <PurchaseOrderFormModal suppliers={suppliers ?? []} onClose={() => setShowPoForm(false)} />
            )}

            {editingSupplier !== undefined && (
                <SupplierFormModal supplier={editingSupplier} onClose={() => setEditingSupplier(undefined)} />
            )}
        </div>
    );
}