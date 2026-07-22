import { prisma } from '../config/prisma';

function csvField(value: string | number): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(headers: string[], rows: (string | number)[][]): string {
  const lines = [headers.map(csvField).join(',')];
  for (const row of rows) {
    lines.push(row.map(csvField).join(','));
  }
  return lines.join('\n');
}

interface ProductForCsv {
  name: string;
  sku: string;
  category: { name: string } | null;
  price: number;
  costPrice: number | null;
  quantity: number;
  lowStockThreshold: number;
}

export async function generateInventoryCsv(): Promise<string> {
  const products: ProductForCsv[] = await prisma.product.findMany({
    where: { isDeleted: false },
    include: { category: true },
    orderBy: { name: 'asc' },
  });

  const headers = ['Name', 'SKU', 'Category', 'Price', 'Cost Price', 'Quantity', 'Low Stock Threshold', 'Status'];
  const rows = products.map((p: ProductForCsv) => [
    p.name,
    p.sku,
    p.category?.name ?? 'Uncategorized',
    p.price.toFixed(2),
    p.costPrice?.toFixed(2) ?? '',
    p.quantity,
    p.lowStockThreshold,
    p.quantity <= p.lowStockThreshold ? 'Low Stock' : 'OK',
  ]);

  return toCsv(headers, rows);
}

interface SaleForCsv {
  id: string;
  createdAt: Date;
  customer: { name: string } | null;
  status: string;
  items: { quantity: number; product: { name: string } }[];
  totalAmount: number;
}

export async function generateSalesCsv(): Promise<string> {
  const sales: SaleForCsv[] = await prisma.salesOrder.findMany({
    include: { customer: true, items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const headers = ['Sale ID', 'Date', 'Customer', 'Status', 'Items', 'Total'];
  const rows = sales.map((s: SaleForCsv) => [
    s.id.slice(-8).toUpperCase(),
    new Date(s.createdAt).toLocaleDateString(),
    s.customer?.name ?? 'Walk-in',
    s.status,
    s.items.map((i: { quantity: number; product: { name: string } }) => `${i.product.name} x${i.quantity}`).join('; '),
    s.totalAmount.toFixed(2),
  ]);

  return toCsv(headers, rows);
}