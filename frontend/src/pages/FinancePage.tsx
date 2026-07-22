import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { listTransactions } from '@/api/transactions';
import { TransactionFormModal } from '@/components/TransactionFormModal';
import type { TransactionType } from '@/types/finance';

export default function FinancePage() {
    const [typeFilter, setTypeFilter] = useState<TransactionType | ''>('');
    const [page, setPage] = useState(1);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        setPage(1);
    }, [typeFilter]);

    const { data, isLoading } = useQuery({
        queryKey: ['transactions', { type: typeFilter, page }],
        queryFn: () => listTransactions({ type: typeFilter || undefined, page, limit: 15 }),
    });

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-xl font-bold">Finance</h1>
                    <p className="text-sm text-[var(--color-muted)]">{data?.pagination.total ?? 0} transactions</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 rounded-lg bg-[var(--color-accent)] text-black text-sm font-semibold px-4 py-2.5 hover:opacity-90 transition-opacity"
                >
                    <Plus size={16} />
                    Add Transaction
                </button>
            </div>

            <div className="flex gap-1 mb-4 border-b border-[var(--color-border)]">
                {([
                    { label: 'All', value: '' },
                    { label: 'Income', value: 'INCOME' },
                    { label: 'Expense', value: 'EXPENSE' },
                ] as const).map((opt) => (
                    <button
                        key={opt.label}
                        onClick={() => setTypeFilter(opt.value)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${typeFilter === opt.value
                                ? 'border-[var(--color-accent)] text-[var(--color-text)]'
                                : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-text)]'
                            }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-muted)]">
                                <th className="px-4 py-3 font-medium">Description</th>
                                <th className="px-4 py-3 font-medium">Source</th>
                                <th className="px-4 py-3 font-medium">Date</th>
                                <th className="px-4 py-3 font-medium text-right">Amount</th>
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
                                        No transactions found.
                                    </td>
                                </tr>
                            )}
                            {data?.items.map((tx) => (
                                <tr key={tx.id} className="border-b border-[var(--color-border)] last:border-0">
                                    <td className="px-4 py-3 font-medium">{tx.description}</td>
                                    <td className="px-4 py-3 text-[var(--color-muted)]">
                                        {tx.referenceType ? tx.referenceType.replace('_', ' ') : 'Manual entry'}
                                    </td>
                                    <td className="px-4 py-3 text-[var(--color-muted)]">
                                        {new Date(tx.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div
                                            className={`flex items-center justify-end gap-1 font-semibold ${tx.type === 'INCOME' ? 'text-green-500' : 'text-red-500'
                                                }`}
                                        >
                                            {tx.type === 'INCOME' ? (
                                                <ArrowUpRight size={14} />
                                            ) : (
                                                <ArrowDownRight size={14} />
                                            )}
                                            ${tx.amount.toFixed(2)}
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

            {showForm && <TransactionFormModal onClose={() => setShowForm(false)} />}
        </div>
    );
}