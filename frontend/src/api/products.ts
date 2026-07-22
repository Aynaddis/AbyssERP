import { api } from './axios';
import type { Product, PaginatedResult } from '@/types/inventory';

export interface ListProductsParams {
  search?: string;
  categoryId?: string;
  lowStockOnly?: boolean;
  page?: number;
  limit?: number;
}

export interface ProductInput {
  name: string;
  sku: string;
  description?: string;
  price: number;
  costPrice?: number;
  quantity: number;
  lowStockThreshold: number;
  categoryId?: string;
}

export async function listProducts(params: ListProductsParams): Promise<PaginatedResult<Product>> {
  const { data } = await api.get<PaginatedResult<Product>>('/products', { params });
  return data;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const { data } = await api.post<{ product: Product }>('/products', input);
  return data.product;
}

export async function updateProduct(id: string, input: Partial<ProductInput>): Promise<Product> {
  const { data } = await api.put<{ product: Product }>(`/products/${id}`, input);
  return data.product;
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}
export async function getLowStockProducts(): Promise<Product[]> {
  const { data } = await api.get<{ products: Product[] }>('/products/low-stock');
  return data.products;
}