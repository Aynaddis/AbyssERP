import { prisma } from '../config/prisma';

export async function getDashboardKpis() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    todaySalesAgg,
    monthlyRevenueAgg,
    totalProducts,
    totalEmployees,
    totalSuppliers,
    pendingPurchaseOrders,
    productsForValuation,
  ] = await Promise.all([
    prisma.salesOrder.aggregate({
      where: { status: 'COMPLETED', createdAt: { gte: startOfToday } },
      _sum: { totalAmount: true },
    }),
    prisma.salesOrder.aggregate({
      where: { status: 'COMPLETED', createdAt: { gte: startOfMonth } },
      _sum: { totalAmount: true },
    }),
    prisma.product.count({ where: { isDeleted: false } }),
    prisma.employee.count({ where: { isActive: true } }),
    prisma.supplier.count(),
    prisma.purchaseOrder.count({ where: { status: 'PENDING' } }),
    // Prisma can't multiply two columns in an aggregate, so fetch the minimal
    // fields needed and compute inventory value + low-stock count in application code.
    prisma.product.findMany({
      where: { isDeleted: false },
      select: { price: true, costPrice: true, quantity: true, lowStockThreshold: true },
    }),
  ]);

  let inventoryValue = 0;
  let lowStockCount = 0;

  for (const p of productsForValuation) {
    // Value inventory at cost basis (what was paid), falling back to sale price
    // if a product has never had a purchase order recorded against it yet.
    const unitValue = p.costPrice ?? p.price;
    inventoryValue += unitValue * p.quantity;
    if (p.quantity <= p.lowStockThreshold) lowStockCount++;
  }

  return {
    todaySales: todaySalesAgg._sum.totalAmount ?? 0,
    monthlyRevenue: monthlyRevenueAgg._sum.totalAmount ?? 0,
    totalProducts,
    totalEmployees,
    totalSuppliers,
    pendingPurchaseOrders,
    inventoryValue,
    lowStockCount,
  };
}

export async function getDashboardCharts() {
  const [salesTrend, inventoryByCategory, topProducts] = await Promise.all([
    getSalesTrend(),
    getInventoryByCategory(),
    getTopProducts(),
  ]);

  return { salesTrend, inventoryByCategory, topProducts };
}

// Daily sales totals for the last 14 days, including zero-value days —
// Prisma can't truncate dates in a groupBy, so we fetch raw rows and bucket them ourselves.
async function getSalesTrend() {
  const DAYS = 14;
  const start = new Date();
  start.setDate(start.getDate() - (DAYS - 1));
  start.setHours(0, 0, 0, 0);

  const sales = await prisma.salesOrder.findMany({
    where: { status: 'COMPLETED', createdAt: { gte: start } },
    select: { createdAt: true, totalAmount: true },
  });

  const totalsByDate = new Map<string, number>();
  for (const sale of sales) {
    const key = sale.createdAt.toISOString().slice(0, 10); // YYYY-MM-DD
    totalsByDate.set(key, (totalsByDate.get(key) ?? 0) + sale.totalAmount);
  }

  const trend: { date: string; total: number }[] = [];
  for (let i = 0; i < DAYS; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    trend.push({ date: key, total: totalsByDate.get(key) ?? 0 });
  }

  return trend;
}

async function getInventoryByCategory() {
  const products = await prisma.product.findMany({
    where: { isDeleted: false },
    select: {
      quantity: true,
      price: true,
      costPrice: true,
      category: { select: { name: true } },
    },
  });

  const buckets = new Map<string, { productCount: number; totalValue: number }>();
  for (const p of products) {
    const name = p.category?.name ?? 'Uncategorized';
    const existing = buckets.get(name) ?? { productCount: 0, totalValue: 0 };
    existing.productCount += 1;
    existing.totalValue += (p.costPrice ?? p.price) * p.quantity;
    buckets.set(name, existing);
  }

  return Array.from(buckets.entries()).map(([category, data]) => ({ category, ...data }));
}

// Top 5 products by units sold, across all completed sales
interface GroupedSalesItem {
  productId: string;
  _sum: { quantity: number | null; subtotal: number | null };
}

interface ProductLookup {
  id: string;
  name: string;
  sku: string;
}

async function getTopProducts() {
  const grouped = (await prisma.salesOrderItem.groupBy({
    by: ['productId'],
    where: { salesOrder: { status: 'COMPLETED' } },
    _sum: { quantity: true, subtotal: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 5,
  })) as unknown as GroupedSalesItem[];

  if (grouped.length === 0) return [];

  const products = (await prisma.product.findMany({
    where: { id: { in: grouped.map((g) => g.productId) } },
    select: { id: true, name: true, sku: true },
  })) as unknown as ProductLookup[];
  const productMap = new Map<string, ProductLookup>(products.map((p) => [p.id, p]));

  return grouped.map((g) => ({
    productId: g.productId,
    name: productMap.get(g.productId)?.name ?? 'Unknown product',
    sku: productMap.get(g.productId)?.sku ?? '',
    unitsSold: g._sum.quantity ?? 0,
    revenue: g._sum.subtotal ?? 0,
  }));
}