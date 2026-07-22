import { api } from './axios';

export async function downloadInventoryReport(): Promise<Blob> {
  const { data } = await api.get('/reports/inventory', { responseType: 'blob' });
  return data;
}

export async function downloadSalesReport(): Promise<Blob> {
  const { data } = await api.get('/reports/sales', { responseType: 'blob' });
  return data;
}