import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, RefreshCw, Plus } from 'lucide-react';
import { createProduct, updateProduct, type ProductInput } from '@/api/products';
import { createCategory } from '@/api/categories';
import { toast } from '@/store/toastStore';
import type { Product, Category } from '@/types/inventory';

function generateSku(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';

  const initials =
    words.length >= 2
      ? words.slice(0, 3).map((w) => w[0]).join('').toUpperCase()
      : words[0].slice(0, 3).toUpperCase();

  const random = Math.floor(1000 + Math.random() * 9000);
  return `${initials}-${random}`;
}

interface ProductFormModalProps {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
}

export function ProductFormModal({ product, categories, onClose }: ProductFormModalProps) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(product);

  const [skuTouched, setSkuTouched] = useState(isEdit);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [form, setForm] = useState<ProductInput>({
    name: product?.name ?? '',
    sku: product?.sku ?? '',
    description: product?.description ?? '',
    price: product?.price ?? 0,
    costPrice: product?.costPrice ?? undefined,
    quantity: product?.quantity ?? 0,
    lowStockThreshold: product?.lowStockThreshold ?? 10,
    categoryId: product?.categoryId ?? undefined,
  });

  function handleNameBlur() {
    if (!isEdit && !skuTouched && form.name.trim()) {
      setForm((f) => ({ ...f, sku: generateSku(f.name) }));
    }
  }

  function handleRegenerateSku() {
    if (!form.name.trim()) return;
    setForm((f) => ({ ...f, sku: generateSku(f.name) }));
  }

  const mutation = useMutation({
    mutationFn: () =>
      isEdit ? updateProduct(product!.id, form) : createProduct(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(isEdit ? 'Product updated' : 'Product created');
      onClose();
    },
  });

  const categoryMutation = useMutation({
    mutationFn: () => createCategory(newCategoryName.trim()),
    onSuccess: (category) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setForm((f) => ({ ...f, categoryId: category.id }));
      setAddingCategory(false);
      setNewCategoryName('');
    },
  });

  function handleAddCategory() {
    if (newCategoryName.trim()) {
      categoryMutation.mutate();
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const suspiciouslyHigh: string[] = [];
    if (form.price > 1_000_000) suspiciouslyHigh.push(`price of $${form.price.toLocaleString()}`);
    if (form.costPrice && form.costPrice > 1_000_000)
      suspiciouslyHigh.push(`cost price of $${form.costPrice.toLocaleString()}`);
    if (form.quantity > 1_000_000)
      suspiciouslyHigh.push(`quantity of ${form.quantity.toLocaleString()} units`);

    if (suspiciouslyHigh.length > 0) {
      const confirmed = confirm(
        `You entered a ${suspiciouslyHigh.join(' and ')} — that's unusually high. Is this correct?`,
      );
      if (!confirmed) return;
    }

    mutation.mutate();
  }

  const errorMessage = (mutation.error as any)?.response?.data?.error ?? mutation.error?.message;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-[var(--color-panel)] border border-[var(--color-border)] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="font-bold text-sm">{isEdit ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} aria-label="Close">
            <X size={18} className="text-[var(--color-muted)] hover:text-[var(--color-text)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {errorMessage && (
            <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              onBlur={handleNameBlur}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">
              SKU {!isEdit && <span className="text-[var(--color-accent)]">(auto-generated)</span>}
            </label>
            <div className="flex gap-2">
              <input
                required
                value={form.sku}
                onChange={(e) => {
                  setSkuTouched(true);
                  setForm({ ...form, sku: e.target.value });
                }}
                className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
              />
              {!isEdit && (
                <button
                  type="button"
                  onClick={handleRegenerateSku}
                  disabled={!form.name.trim()}
                  aria-label="Regenerate SKU"
                  title="Regenerate SKU"
                  className="shrink-0 rounded-lg border border-[var(--color-border)] px-3 hover:bg-[var(--color-panel-2)] disabled:opacity-40 transition-colors"
                >
                  <RefreshCw size={14} />
                </button>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-[var(--color-muted)]">Category</label>
              {!addingCategory && (
                <button
                  type="button"
                  onClick={() => setAddingCategory(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-[var(--color-accent)] hover:opacity-80"
                >
                  <Plus size={12} />
                  New category
                </button>
              )}
            </div>

            {addingCategory ? (
              <div>
                <div className="flex gap-2">
                  <input
                    autoFocus
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Category name"
                    className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    disabled={categoryMutation.isPending || !newCategoryName.trim()}
                    className="rounded-lg bg-[var(--color-accent)] text-black text-xs font-semibold px-3 disabled:opacity-50"
                  >
                    {categoryMutation.isPending ? '...' : 'Add'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddingCategory(false);
                      setNewCategoryName('');
                    }}
                    className="rounded-lg border border-[var(--color-border)] text-xs font-semibold px-3 hover:bg-[var(--color-panel-2)]"
                  >
                    Cancel
                  </button>
                </div>
                {categoryMutation.isError && (
                  <p className="text-xs text-red-500 mt-1">
                    {(categoryMutation.error as any)?.response?.data?.error ?? 'Failed to add category'}
                  </p>
                )}
              </div>
            ) : (
              <select
                value={form.categoryId ?? ''}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value || undefined })}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Price</label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Cost price</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.costPrice ?? ''}
                onChange={(e) =>
                  setForm({ ...form, costPrice: e.target.value ? Number(e.target.value) : undefined })
                }
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Quantity</label>
              <input
                required
                type="number"
                min="0"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Low stock at</label>
              <input
                required
                type="number"
                min="0"
                value={form.lowStockThreshold}
                onChange={(e) => setForm({ ...form, lowStockThreshold: Number(e.target.value) })}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)] resize-none"
            />
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
              disabled={mutation.isPending}
              className="flex-1 rounded-lg bg-[var(--color-accent)] text-black text-sm font-semibold py-2.5 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {mutation.isPending ? 'Saving...' : isEdit ? 'Save changes' : 'Add product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}