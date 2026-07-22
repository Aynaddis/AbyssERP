import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { createSupplier, updateSupplier, type SupplierInput } from '@/api/suppliers';
import { toast } from '@/store/toastStore';
import type { Supplier } from '@/types/purchasing';

interface SupplierFormModalProps {
    supplier: Supplier | null;
    onClose: () => void;
}

export function SupplierFormModal({ supplier, onClose }: SupplierFormModalProps) {
    const queryClient = useQueryClient();
    const isEdit = Boolean(supplier);

    const [form, setForm] = useState<SupplierInput>({
        name: supplier?.name ?? '',
        email: supplier?.email ?? '',
        phone: supplier?.phone ?? '',
        address: supplier?.address ?? '',
    });

    const mutation = useMutation({
        mutationFn: () => (isEdit ? updateSupplier(supplier!.id, form) : createSupplier(form)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            toast.success(isEdit ? 'Supplier updated' : 'Supplier created');
            onClose();
        },
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        mutation.mutate();
    }

    const errorMessage = (mutation.error as any)?.response?.data?.error ?? mutation.error?.message;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-[var(--color-panel)] border border-[var(--color-border)]">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
                    <h2 className="font-bold text-sm">{isEdit ? 'Edit Supplier' : 'Add Supplier'}</h2>
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
                            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Email</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Phone</label>
                        <input
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Address</label>
                        <textarea
                            value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
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
                            {mutation.isPending ? 'Saving...' : isEdit ? 'Save changes' : 'Add supplier'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}