import { api } from './axios';
import type { PurchaseOrder } from '@/types/purchasing';

export interface PurchaseOrderItemInput {
    productId: string;
    quantity: number;
    unitCost: number;
}

export interface PurchaseOrderInput {
    supplierId: string;
    items: PurchaseOrderItemInput[];
}

export async function listPurchaseOrders(): Promise<PurchaseOrder[]> {
    const { data } = await api.get<{ orders: PurchaseOrder[] }>('/purchases');
    return data.orders;
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