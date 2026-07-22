import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { createSale } from '@/api/sales';
import { listProducts } from '@/api/products';
import { toast } from '@/store/toastStore';
import type { Customer } from '@/types/sales';

interface SaleFormModalProps {
    customers: Customer[];
    onClose: () => void;
}

interface LineItem {
    key: number;
    productId: string;
    quantity: number;
}

let keyCounter = 0;

export function SaleFormModal({ customers, onClose }: SaleFormModalProps) {
    const queryClient = useQueryClient();

    const [customerId, setCustomerId] = useState('');
    const [items, setItems] = useState<LineItem[]>([{ key: keyCounter++, productId: '', quantity: 1 }]);

    const { data: productsResult } = useQuery({
        queryKey: ['products', { forPicker: true }],
        queryFn: () => listProducts({ limit: 100 }),
    });
    const products = productsResult?.items ?? [];

    const mutation = useMutation({
        mutationFn: () =>
            createSale({
                customerId: customerId || undefined,
                items: items.map(({ productId, quantity }) => ({ productId, quantity })),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sales'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Sale completed');
            onClose();
        },
    });

    function addItem() {
        setItems([...items, { key: keyCounter++, productId: '', quantity: 1 }]);
    }

    function removeItem(key: number) {
        setItems(items.filter((item) => item.key !== key));
    }

    function updateItem(key: number, field: keyof Omit<LineItem, 'key'>, value: string | number) {
        setItems(items.map((item) => (item.key === key ? { ...item, [field]: value } : item)));
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        mutation.mutate();
    }

    const requestedByProduct = items.reduce<Record<string, number>>((acc, item) => {
        if (item.productId) acc[item.productId] = (acc[item.productId] ?? 0) + item.quantity;
        return acc;
    }, {});

    function stockErrorFor(productId: string): string | null {
        if (!productId) return null;
        const product = products.find((p) => p.id === productId);
        if (!product) return null;
        const requested = requestedByProduct[productId] ?? 0;
        if (requested > product.quantity) {
            return `Only ${product.quantity} in stock`;
        }
        return null;
    }

    const hasStockError = items.some((item) => stockErrorFor(item.productId));
    const total = items.reduce((sum, item) => {
        const product = products.find((p) => p.id === item.productId);
        return sum + (product ? product.price * item.quantity : 0);
    }, 0);

    const errorMessage = (mutation.error as any)?.response?.data?.error ?? mutation.error?.message;
    const canSubmit = items.every((i) => i.productId && i.quantity > 0) && !hasStockError;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-xl bg-[var(--color-panel)] border border-[var(--color-border)] max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
                    <h2 className="font-bold text-sm">New Sale</h2>
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
                        <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">
                            Customer <span className="text-[var(--color-muted)]">(optional)</span>
                        </label>
                        <select
                            value={customerId}
                            onChange={(e) => setCustomerId(e.target.value)}
                            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
                        >
                            <option value="">Walk-in customer</option>
                            {customers.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
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

                        <div className="flex gap-2 px-1 mb-1">
                            <span className="flex-1 min-w-0 text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-wide">
                                Product
                            </span>
                            <span className="w-16 text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-wide">
                                Qty
                            </span>
                            <span className="w-20 text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-wide text-right">
                                Subtotal
                            </span>
                            <span className="w-[26px]" />
                        </div>

                        <div className="space-y-2">
                            {items.map((item) => {
                                const product = products.find((p) => p.id === item.productId);
                                const error = stockErrorFor(item.productId);
                                return (
                                    <div key={item.key}>
                                        <div className="flex gap-2 items-start">
                                            <select
                                                required
                                                value={item.productId}
                                                onChange={(e) => updateItem(item.key, 'productId', e.target.value)}
                                                className={`flex-1 min-w-0 rounded-lg border bg-[var(--color-panel-2)] px-2 py-2 text-xs outline-none focus:border-[var(--color-accent)] ${error ? 'border-red-500' : 'border-[var(--color-border)]'
                                                    }`}
                                            >
                                                <option value="">Select product...</option>
                                                {products.map((p) => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.name} (${p.price.toFixed(2)}) — {p.quantity} in stock
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
                                                className={`w-16 rounded-lg border bg-[var(--color-panel-2)] px-2 py-2 text-xs outline-none focus:border-[var(--color-accent)] ${error ? 'border-red-500' : 'border-[var(--color-border)]'
                                                    }`}
                                            />
                                            <div className="w-20 flex items-center justify-end text-xs font-medium pt-2">
                                                {product ? `$${(product.price * item.quantity).toFixed(2)}` : '—'}
                                            </div>
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
                                        {error && (
                                            <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1 pl-1">
                                                <AlertTriangle size={11} />
                                                {error}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm font-semibold pt-2 border-t border-[var(--color-border)]">
                        <span className="text-[var(--color-muted)]">Total</span>
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
                            {mutation.isPending ? 'Processing...' : 'Complete sale'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}