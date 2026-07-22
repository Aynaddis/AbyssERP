export interface DashboardKpis {
    todaySales: number;
    monthlyRevenue: number;
    totalProducts: number;
    totalEmployees: number;
    totalSuppliers: number;
    pendingPurchaseOrders: number;
    inventoryValue: number;
    lowStockCount: number;
}
export interface SalesTrendPoint {
    date: string;
    total: number;
}

export interface InventoryByCategory {
    category: string;
    productCount: number;
    totalValue: number;
}

export interface TopProduct {
    productId: string;
    name: string;
    sku: string;
    unitsSold: number;
    revenue: number;
}

export interface DashboardCharts {
    salesTrend: SalesTrendPoint[];
    inventoryByCategory: InventoryByCategory[];
    topProducts: TopProduct[];
}