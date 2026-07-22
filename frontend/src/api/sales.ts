import { api } from './axios';
import type { SalesOrder } from '@/types/sales';

export interface SaleItemInput {
    productId: string;
    quantity: number;
}

export interface SaleInput {
    customerId?: string;
    items: SaleItemInput[];
}

export async function listSales(): Promise<SalesOrder[]> {
    const { data } = await api.get<{ sales: SalesOrder[] }>('/sales');
    return data.sales;
}

export async function createSale(input: SaleInput): Promise<SalesOrder> {
    const { data } = await api.post<{ sale: SalesOrder }>('/sales', input);
    return data.sale;
}

export async function cancelSale(id: string): Promise<SalesOrder> {
    const { data } = await api.post<{ sale: SalesOrder }>(`/sales/${id}/cancel`);
    return data.sale;
}

export async function downloadInvoice(id: string): Promise<Blob> {
  const { data } = await api.get(`/sales/${id}/invoice`, { responseType: 'blob' });
  return data;
}