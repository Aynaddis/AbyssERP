import type { TopProduct } from '@/types/dashboard';

interface TopProductsCardProps {
    data: TopProduct[];
}

export function TopProductsCard({ data }: TopProductsCardProps) {
    const maxUnits = Math.max(...data.map((p) => p.unitsSold), 1);

    return (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
            <h3 className="text-sm font-semibold mb-4">Top Selling Products</h3>

            {data.length === 0 ? (
                <p className="text-xs text-[var(--color-muted)] text-center py-8">
                    No completed sales yet.
                </p>
            ) : (
                <div className="space-y-3">
                    {data.map((product, i) => (
                        <div key={product.productId}>
                            <div className="flex items-center justify-between text-xs mb-1">
                                <span className="font-medium truncate pr-2">
                                    <span className="text-[var(--color-muted)] mr-1.5">{i + 1}.</span>
                                    {product.name}
                                </span>
                                <span className="text-[var(--color-muted)] shrink-0">
                                    {product.unitsSold} sold · ${product.revenue.toFixed(2)}
                                </span>
                            </div>
                            <div className="h-1.5 rounded-full bg-[var(--color-panel-2)] overflow-hidden">
                                <div
                                    className="h-full bg-[var(--color-accent)] rounded-full"
                                    style={{ width: `${(product.unitsSold / maxUnits) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}