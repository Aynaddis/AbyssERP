import type { Product } from './inventory';

export interface Customer {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
}

export type SaleStatus = 'COMPLETED' | 'CANCELLED';

export interface SalesOrderItem {
    id: string;
    productId: string;
    product: Product;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}

export interface SalesOrder {
    id: string;
    customerId: string | null;
    customer: Customer | null;
    status: SaleStatus;
    totalAmount: number;
    items: SalesOrderItem[];
    createdAt: string;
}