import { api } from './axios';
import type { PaginatedResult } from '@/types/inventory';
import type { Supplier } from '@/types/purchasing';

export interface SupplierInput {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
}

export interface ListSuppliersParams {
    search?: string;
    page?: number;
    limit?: number;
}

export async function listSuppliers(params: ListSuppliersParams = {}): Promise<PaginatedResult<Supplier>> {
    const { data } = await api.get<PaginatedResult<Supplier>>('/suppliers', { params });
    return data;
}

export async function createSupplier(input: SupplierInput): Promise<Supplier> {
    const { data } = await api.post<{ supplier: Supplier }>('/suppliers', input);
    return data.supplier;
}

export async function updateSupplier(id: string, input: Partial<SupplierInput>): Promise<Supplier> {
    const { data } = await api.put<{ supplier: Supplier }>(`/suppliers/${id}`, input);
    return data.supplier;
}

export async function deleteSupplier(id: string): Promise<void> {
    await api.delete(`/suppliers/${id}`);
}