import { api } from './axios';
import type { SalesOrder, SaleStatus } from '@/types/sales';
import type { PaginatedResult } from '@/types/inventory';

export type SaleDateRange = 'today' | 'week' | 'month';

export interface SaleItemInput {
  productId: string;
  quantity: number;
}

export interface SaleInput {
  customerId?: string;
  items: SaleItemInput[];
}

export interface ListSalesParams {
  search?: string;
  dateRange?: SaleDateRange;
  status?: SaleStatus;
  page: number;
  limit: number;
}

export interface SalesResult extends PaginatedResult<SalesOrder> {}

export async function listSales(params: ListSalesParams): Promise<SalesResult> {
  const { data } = await api.get<SalesResult>('/sales', { params });
  return data;
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