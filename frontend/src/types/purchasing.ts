import type { Product } from './inventory';

export interface Supplier {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
}

export type PurchaseOrderStatus = 'PENDING' | 'RECEIVED' | 'CANCELLED';

export interface PurchaseOrderItem {
    id: string;
    productId: string;
    product: Product;
    quantity: number;
    unitCost: number;
}

export interface PurchaseOrder {
    id: string;
    supplierId: string;
    supplier: Supplier;
    status: PurchaseOrderStatus;
    orderDate: string;
    receivedDate: string | null;
    items: PurchaseOrderItem[];
}