import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search, AlertTriangle, FileDown } from 'lucide-react';
import { listProducts, deleteProduct } from '@/api/products';
import { listCategories } from '@/api/categories';
import { downloadInventoryReport } from '@/api/reports';
import { downloadBlob } from '@/lib/download';
import { useAuthStore } from '@/store/authStore';
import { ProductFormModal } from '@/components/ProductFormModal';
import { toast, toastErrorMessage } from '@/store/toastStore';
import type { Product } from '@/types/inventory';

export default function InventoryPage() {
    const queryClient = useQueryClient();
    const hasRole = useAuthStore((s) => s.hasRole);
    const canManage = hasRole('ADMIN', 'MANAGER');

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [lowStockOnly, setLowStockOnly] = useState(false);
    const [page, setPage] = useState(1);
    const [exportingCsv, setExportingCsv] = useState(false);

    const [editingProduct, setEditingProduct] = useState<Product | null | undefined>(undefined);

    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(timeout);
    }, [search]);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, categoryId, lowStockOnly]);

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: listCategories,
    });

    const { data, isLoading, isError } = useQuery({
        queryKey: ['products', { search: debouncedSearch, categoryId, lowStockOnly, page }],
        queryFn: () =>
            listProducts({
                search: debouncedSearch || undefined,
                categoryId: categoryId || undefined,
                lowStockOnly: lowStockOnly || undefined,
                page,
                limit: 10,
            }),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Product deleted');
        },
        onError: (err) => toast.error(toastErrorMessage(err, 'Failed to delete product')),
    });

    function handleDelete(product: Product) {
        if (confirm(`Delete "${product.name}"? This can't be undone from the UI.`)) {
            deleteMutation.mutate(product.id);
        }
    }

    async function handleExportCsv() {
        setExportingCsv(true);
        try {
            const blob = await downloadInventoryReport();
            downloadBlob(blob, 'inventory-report.csv');
        } catch (err) {
            toast.error(toastErrorMessage(err, 'Failed to export inventory report'));
        } finally {
            setExportingCsv(false);
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold">Inventory</h1>
                    <p className="text-sm text-[var(--color-muted)]">
                        {data?.pagination.total ?? 0} products
                    </p>
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
                    {canManage && (
                        <button
                            onClick={() => setEditingProduct(null)}
                            className="flex items-center gap-2 rounded-lg bg-[var(--color-accent)] text-black text-sm font-semibold px-4 py-2.5 hover:opacity-90 transition-opacity"
                        >
                            <Plus size={16} />
                            Add Product
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-4">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or SKU..."
                        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] pl-9 pr-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
                    />
                </div>

                <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
                >
                    <option value="">All categories</option>
                    {categories?.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>

                <label className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2 text-sm cursor-pointer">
                    <input
                        type="checkbox"
                        checked={lowStockOnly}
                        onChange={(e) => setLowStockOnly(e.target.checked)}
                        className="accent-[var(--color-accent)]"
                    />
                    Low stock only
                </label>
            </div>

            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-muted)]">
                                <th className="px-4 py-3 font-medium">Product</th>
                                <th className="px-4 py-3 font-medium">SKU</th>
                                <th className="px-4 py-3 font-medium">Category</th>
                                <th className="px-4 py-3 font-medium">Price</th>
                                <th className="px-4 py-3 font-medium">Stock</th>
                                {canManage && <th className="px-4 py-3 font-medium text-right">Actions</th>}
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

                            {isError && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-red-500">
                                        Failed to load products.
                                    </td>
                                </tr>
                            )}

                            {!isLoading && !isError && data?.items.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-[var(--color-muted)]">
                                        No products found.
                                    </td>
                                </tr>
                            )}

                            {data?.items.map((product) => {
                                const isLowStock = product.quantity <= product.lowStockThreshold;
                                return (
                                    <tr key={product.id} className="border-b border-[var(--color-border)] last:border-0">
                                        <td className="px-4 py-3 font-medium">{product.name}</td>
                                        <td className="px-4 py-3 text-[var(--color-muted)]">{product.sku}</td>
                                        <td className="px-4 py-3 text-[var(--color-muted)]">
                                            {product.category?.name ?? '—'}
                                        </td>
                                        <td className="px-4 py-3">${product.price.toFixed(2)}</td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${isLowStock
                                                        ? 'bg-red-500/10 text-red-500'
                                                        : 'bg-[var(--color-panel-2)] text-[var(--color-muted)]'
                                                    }`}
                                            >
                                                {isLowStock && <AlertTriangle size={11} />}
                                                {product.quantity}
                                            </span>
                                        </td>
                                        {canManage && (
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setEditingProduct(product)}
                                                        aria-label="Edit product"
                                                        className="text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors"
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product)}
                                                        aria-label="Delete product"
                                                        className="text-[var(--color-muted)] hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
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

            {editingProduct !== undefined && (
                <ProductFormModal
                    product={editingProduct}
                    categories={categories ?? []}
                    onClose={() => setEditingProduct(undefined)}
                />
            )}
        </div>
    );
}