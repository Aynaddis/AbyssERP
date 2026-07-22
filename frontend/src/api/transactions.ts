import { api } from './axios';
import type { Transaction, TransactionType } from '@/types/finance';
import type { PaginatedResult } from '@/types/inventory';

export interface ListTransactionsParams {
    type?: TransactionType;
    page?: number;
    limit?: number;
}

export interface TransactionInput {
    type: TransactionType;
    amount: number;
    description: string;
}

export async function listTransactions(
    params: ListTransactionsParams,
): Promise<PaginatedResult<Transaction>> {
    const { data } = await api.get<PaginatedResult<Transaction>>('/transactions', { params });
    return data;
}

export async function createTransaction(input: TransactionInput): Promise<Transaction> {
    const { data } = await api.post<{ transaction: Transaction }>('/transactions', input);
    return data.transaction;
}