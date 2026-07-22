import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { listTransactions } from '@/api/transactions';

export function RecentTransactionsCard() {
    const { data, isLoading } = useQuery({
        queryKey: ['transactions', { forDashboard: true }],
        queryFn: () => listTransactions({ page: 1, limit: 5 }),
    });

    return (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
            <h3 className="text-sm font-semibold mb-4">Recent Transactions</h3>

            {isLoading && <p className="text-xs text-[var(--color-muted)] text-center py-8">Loading...</p>}

            {!isLoading && data?.items.length === 0 && (
                <p className="text-xs text-[var(--color-muted)] text-center py-8">No transactions yet.</p>
            )}

            <div className="space-y-3">
                {data?.items.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between text-xs">
                        <div className="min-w-0">
                            <p className="font-medium truncate">{tx.description}</p>
                            <p className="text-[var(--color-muted)]">
                                {new Date(tx.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div
                            className={`flex items-center gap-1 font-semibold shrink-0 ${tx.type === 'INCOME' ? 'text-green-500' : 'text-red-500'
                                }`}
                        >
                            {tx.type === 'INCOME' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            ${tx.amount.toFixed(2)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}