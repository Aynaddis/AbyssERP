import { api } from './axios';
import type { PaginatedResult } from '@/types/inventory';
import type { PurchaseOrder, PurchaseOrderStatus } from '@/types/purchasing';

export interface PurchaseOrderItemInput {
    productId: string;
    quantity: number;
    unitCost: number;
}

export interface PurchaseOrderInput {
    supplierId: string;
    items: PurchaseOrderItemInput[];
}

export interface ListPurchaseOrdersParams {
    search?: string;
    status?: PurchaseOrderStatus;
    page?: number;
    limit?: number;
}

export async function listPurchaseOrders(
    params: ListPurchaseOrdersParams = {},
): Promise<PaginatedResult<PurchaseOrder>> {
    const { data } = await api.get<PaginatedResult<PurchaseOrder>>('/purchases', { params });
    return data;
}

export async function createPurchaseOrder(input: PurchaseOrderInput): Promise<PurchaseOrder> {
    const { data } = await api.post<{ order: PurchaseOrder }>('/purchases', input);
    return data.order;
}

export async function receivePurchaseOrder(id: string): Promise<PurchaseOrder> {
    const { data } = await api.post<{ order: PurchaseOrder }>(`/purchases/${id}/receive`);
    return data.order;
}

export async function cancelPurchaseOrder(id: string): Promise<PurchaseOrder> {
    const { data } = await api.post<{ order: PurchaseOrder }>(`/purchases/${id}/cancel`);
    return data.order;
}