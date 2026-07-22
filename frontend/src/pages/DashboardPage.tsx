import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  TrendingUp,
  Package,
  Users,
  Truck,
  ShoppingCart,
  Archive,
  AlertTriangle,
} from 'lucide-react';
import { getDashboardKpis, getDashboardCharts } from '@/api/dashboard';
import { useAuthStore } from '@/store/authStore';
import { KpiCard } from '@/components/KpiCard';
import { SalesTrendChart } from '@/components/charts/SalesTrendChart';
import { InventoryByCategoryChart } from '@/components/charts/InventoryByCategoryChart';
import { TopProductsCard } from '@/components/charts/TopProductsCard';
import { RecentTransactionsCard } from '@/components/charts/RecentTransactionsCard';
import { LowStockCard } from '@/components/charts/LowStockCard';
import { RecentActivityCard } from '@/components/charts/RecentActivityCard';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const hasRole = useAuthStore((s) => s.hasRole);
  const canSeeActivity = hasRole('ADMIN', 'MANAGER');

  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: getDashboardKpis,
    refetchInterval: 30_000,
  });

  const { data: charts, isLoading: chartsLoading } = useQuery({
    queryKey: ['dashboard', 'charts'],
    queryFn: getDashboardCharts,
    refetchInterval: 30_000,
  });

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Welcome back, {user?.name?.split(' ')[0]}</h1>
      <p className="text-sm text-[var(--color-muted)] mb-6">
        Here's what's happening across AbyssERP right now.
      </p>

      {kpisLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-[86px] rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] animate-pulse"
            />
          ))}
        </div>
      )}

      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <KpiCard label="Today's Sales" value={`$${kpis.todaySales.toFixed(2)}`} icon={DollarSign} />
          <KpiCard label="Monthly Revenue" value={`$${kpis.monthlyRevenue.toFixed(2)}`} icon={TrendingUp} />
          <KpiCard label="Total Products" value={String(kpis.totalProducts)} icon={Package} />
          <KpiCard label="Total Employees" value={String(kpis.totalEmployees)} icon={Users} />
          <KpiCard label="Total Suppliers" value={String(kpis.totalSuppliers)} icon={Truck} />
          <KpiCard
            label="Pending Purchase Orders"
            value={String(kpis.pendingPurchaseOrders)}
            icon={ShoppingCart}
          />
          <KpiCard label="Inventory Value" value={`$${kpis.inventoryValue.toFixed(2)}`} icon={Archive} />
          <KpiCard
            label="Low Stock Items"
            value={String(kpis.lowStockCount)}
            icon={AlertTriangle}
            accent="warning"
          />
        </div>
      )}

      {chartsLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2 h-[280px] rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] animate-pulse" />
          <div className="h-[280px] rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] animate-pulse" />
        </div>
      )}

      {charts && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div className="lg:col-span-2">
              <SalesTrendChart data={charts.salesTrend} />
            </div>
            <InventoryByCategoryChart data={charts.inventoryByCategory} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <TopProductsCard data={charts.topProducts} />
            <RecentTransactionsCard />
            <LowStockCard />
          </div>

          {canSeeActivity && (
            <div className="grid grid-cols-1 mt-4">
              <RecentActivityCard />
            </div>
          )}
        </>
      )}
    </div>
  );
}