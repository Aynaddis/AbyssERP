import { api } from './axios';
import type { Category } from '@/types/inventory';

export async function listCategories(): Promise<Category[]> {
    const { data } = await api.get<{ categories: Category[] }>('/categories');
    return data.categories;
}

export async function createCategory(name: string): Promise<Category> {
  const { data } = await api.post<{ category: Category }>('/categories', { name });
  return data.category;
}