import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { InventoryByCategory } from '@/types/dashboard';

interface InventoryByCategoryChartProps {
    data: InventoryByCategory[];
}

const COLORS = ['#f0a500', '#4a90e2', '#2ecc71', '#e17055', '#9b59b6', '#1abc9c'];

export function InventoryByCategoryChart({ data }: InventoryByCategoryChartProps) {
    const chartData = data.map((d) => ({ name: d.category, value: d.totalValue }));

    if (chartData.length === 0) {
        return (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
                <h3 className="text-sm font-semibold mb-4">Inventory by Category</h3>
                <p className="text-xs text-[var(--color-muted)] text-center py-12">No inventory data yet.</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
            <h3 className="text-sm font-semibold mb-4">Inventory by Category</h3>
            <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                    <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={2}
                    >
                        {chartData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            background: 'var(--color-panel)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 8,
                            fontSize: 12,
                        }}
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Value']}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, color: 'var(--color-muted)' }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}