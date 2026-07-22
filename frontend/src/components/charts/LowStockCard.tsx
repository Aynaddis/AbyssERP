import { useQuery } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { getLowStockProducts } from '@/api/products';

export function LowStockCard() {
    const { data, isLoading } = useQuery({
        queryKey: ['products', 'low-stock'],
        queryFn: getLowStockProducts,
    });

    return (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
            <h3 className="text-sm font-semibold mb-4">Low Stock Products</h3>

            {isLoading && <p className="text-xs text-[var(--color-muted)] text-center py-8">Loading...</p>}

            {!isLoading && data?.length === 0 && (
                <p className="text-xs text-[var(--color-muted)] text-center py-8">
                    Everything's well stocked. 🎉
                </p>
            )}

            <div className="space-y-3">
                {data?.map((product) => (
                    <div key={product.id} className="flex items-center justify-between text-xs">
                        <div className="min-w-0 flex items-center gap-2">
                            <AlertTriangle size={12} className="text-red-500 shrink-0" />
                            <span className="font-medium truncate">{product.name}</span>
                        </div>
                        <span className="text-red-500 font-semibold shrink-0">
                            {product.quantity} / {product.lowStockThreshold}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
