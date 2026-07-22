import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Plus, Trash2 } from 'lucide-react';
import { createPurchaseOrder, type PurchaseOrderItemInput } from '@/api/purchases';
import { listProducts } from '@/api/products';
import { toast } from '@/store/toastStore';
import type { Supplier } from '@/types/purchasing';

interface PurchaseOrderFormModalProps {
    suppliers: Supplier[];
    onClose: () => void;
}

interface LineItem extends PurchaseOrderItemInput {
    key: number; // stable key for React list rendering, independent of productId
}

let keyCounter = 0;

export function PurchaseOrderFormModal({ suppliers, onClose }: PurchaseOrderFormModalProps) {
    const queryClient = useQueryClient();

    const [supplierId, setSupplierId] = useState('');
    const [items, setItems] = useState<LineItem[]>([
        { key: keyCounter++, productId: '', quantity: 1, unitCost: 0 },
    ]);

    const { data: productsResult } = useQuery({
        queryKey: ['products', { forPicker: true }],
        queryFn: () => listProducts({ limit: 100 }),
    });
    const products = productsResult?.items ?? [];

    const mutation = useMutation({
        mutationFn: () =>
            createPurchaseOrder({
                supplierId,
                items: items.map(({ productId, quantity, unitCost }) => ({ productId, quantity, unitCost })),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
            toast.success('Purchase order created');
            onClose();
        },
    });

    function addItem() {
        setItems([...items, { key: keyCounter++, productId: '', quantity: 1, unitCost: 0 }]);
    }

    function removeItem(key: number) {
        setItems(items.filter((item) => item.key !== key));
    }

    function updateItem(key: number, field: keyof PurchaseOrderItemInput, value: string | number) {
        setItems(items.map((item) => (item.key === key ? { ...item, [field]: value } : item)));
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        mutation.mutate();
    }

    const total = items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
    const errorMessage = (mutation.error as any)?.response?.data?.error ?? mutation.error?.message;
    const canSubmit = supplierId && items.every((i) => i.productId && i.quantity > 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-xl bg-[var(--color-panel)] border border-[var(--color-border)] max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
                    <h2 className="font-bold text-sm">New Purchase Order</h2>
                    <button onClick={onClose} aria-label="Close">
                        <X size={18} className="text-[var(--color-muted)] hover:text-[var(--color-text)]" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {errorMessage && (
                        <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                            {errorMessage}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Supplier</label>
                        <select
                            required
                            value={supplierId}
                            onChange={(e) => setSupplierId(e.target.value)}
                            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
                        >
                            <option value="">Select a supplier</option>
                            {suppliers.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-medium text-[var(--color-muted)]">Items</label>
                            <button
                                type="button"
                                onClick={addItem}
                                className="flex items-center gap-1 text-xs font-semibold text-[var(--color-accent)] hover:opacity-80"
                            >
                                <Plus size={14} />
                                Add item
                            </button>
                        </div>

                        <div className="space-y-2">
                            {/* Column labels — stay visible since placeholder text disappears once typed */}
                            <div className="flex gap-2 px-1">
                                <span className="flex-1 min-w-0 text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-wide">
                                    Product
                                </span>
                                <span className="w-16 text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-wide">
                                    Qty
                                </span>
                                <span className="w-20 text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-wide">
                                    Unit Cost
                                </span>
                                <span className="w-[26px]" /> {/* spacer matching the remove button width */}
                            </div>

                            {items.map((item) => (
                                <div key={item.key} className="flex gap-2 items-start">
                                    <select
                                        required
                                        value={item.productId}
                                        onChange={(e) => updateItem(item.key, 'productId', e.target.value)}
                                        className="flex-1 min-w-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-2 py-2 text-xs outline-none focus:border-[var(--color-accent)]"
                                    >
                                        <option value="">Select product...</option>
                                        {products.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} ({p.sku})
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(item.key, 'quantity', Number(e.target.value))}
                                        aria-label="Quantity"
                                        className="w-16 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-2 py-2 text-xs outline-none focus:border-[var(--color-accent)]"
                                    />
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={item.unitCost}
                                        onChange={(e) => updateItem(item.key, 'unitCost', Number(e.target.value))}
                                        aria-label="Unit cost"
                                        className="w-20 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-2 py-2 text-xs outline-none focus:border-[var(--color-accent)]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeItem(item.key)}
                                        disabled={items.length === 1}
                                        aria-label="Remove item"
                                        className="shrink-0 p-2 text-[var(--color-muted)] hover:text-red-500 disabled:opacity-30 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm font-semibold pt-2 border-t border-[var(--color-border)]">
                        <span className="text-[var(--color-muted)]">Total cost</span>
                        <span>${total.toFixed(2)}</span>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-lg border border-[var(--color-border)] text-sm font-semibold py-2.5 hover:bg-[var(--color-panel-2)] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={mutation.isPending || !canSubmit}
                            className="flex-1 rounded-lg bg-[var(--color-accent)] text-black text-sm font-semibold py-2.5 hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {mutation.isPending ? 'Creating...' : 'Create purchase order'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}