import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
    label: string;
    value: string;
    icon: LucideIcon;
    accent?: 'default' | 'warning';
}

export function KpiCard({ label, value, icon: Icon, accent = 'default' }: KpiCardProps) {
    return (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[var(--color-muted)]">{label}</span>
                <Icon
                    size={16}
                    className={accent === 'warning' ? 'text-red-500' : 'text-[var(--color-accent)]'}
                />
            </div>
            <p className={`text-xl font-bold ${accent === 'warning' && value !== '0' ? 'text-red-500' : ''}`}>
                {value}
            </p>
        </div>
    );
}