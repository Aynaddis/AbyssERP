import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { createTransaction, type TransactionInput } from '@/api/transactions';
import { toast } from '@/store/toastStore';

interface TransactionFormModalProps {
    onClose: () => void;
}

export function TransactionFormModal({ onClose }: TransactionFormModalProps) {
    const queryClient = useQueryClient();

    const [form, setForm] = useState<TransactionInput>({
        type: 'EXPENSE',
        amount: 0,
        description: '',
    });

    const mutation = useMutation({
        mutationFn: () => createTransaction(form),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            toast.success('Transaction added');
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
                    <h2 className="font-bold text-sm">Add Transaction</h2>
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
                        <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Type</label>
                        <div className="flex gap-2">
                            {(['INCOME', 'EXPENSE'] as const).map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setForm({ ...form, type: t })}
                                    className={`flex-1 rounded-lg border py-2 text-sm font-semibold transition-colors ${form.type === t
                                            ? t === 'INCOME'
                                                ? 'border-green-500 bg-green-500/10 text-green-500'
                                                : 'border-red-500 bg-red-500/10 text-red-500'
                                            : 'border-[var(--color-border)] text-[var(--color-muted)] hover:bg-[var(--color-panel-2)]'
                                        }`}
                                >
                                    {t === 'INCOME' ? 'Income' : 'Expense'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Amount</label>
                        <input
                            required
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={form.amount}
                            onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Description</label>
                        <input
                            required
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="e.g. Monthly rent, Utilities, Office supplies"
                            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
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
                            {mutation.isPending ? 'Saving...' : 'Add transaction'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}