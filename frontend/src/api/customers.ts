import { api } from './axios';
import type { Customer } from '@/types/sales';

export interface CustomerInput {
    name: string;
    email?: string;
    phone?: string;
}

export async function listCustomers(): Promise<Customer[]> {
    const { data } = await api.get<{ customers: Customer[] }>('/customers');
    return data.customers;
}

export async function createCustomer(input: CustomerInput): Promise<Customer> {
    const { data } = await api.post<{ customer: Customer }>('/customers', input);
    return data.customer;
}