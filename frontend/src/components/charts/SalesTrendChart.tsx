import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { SalesTrendPoint } from '@/types/dashboard';

interface SalesTrendChartProps {
    data: SalesTrendPoint[];
}

export function SalesTrendChart({ data }: SalesTrendChartProps) {
    const chartData = data.map((d) => ({
        label: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        total: d.total,
    }));

    return (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
            <h3 className="text-sm font-semibold mb-4">Sales Trend (Last 14 Days)</h3>
            <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                        <linearGradient id="salesTrendFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: 'var(--color-muted)' }}
                        interval={Math.ceil(chartData.length / 7)}
                    />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted)' }} />
                    <Tooltip
                        contentStyle={{
                            background: 'var(--color-panel)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 8,
                            fontSize: 12,
                        }}
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Sales']}
                    />
                    <Area
                        type="monotone"
                        dataKey="total"
                        stroke="var(--color-accent)"
                        strokeWidth={2}
                        fill="url(#salesTrendFill)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}