import { prisma } from '../config/prisma';
import type { Prisma } from '@prisma/client';
import type { CreateTransactionInput, ListTransactionsQuery } from '../utils/validation/transaction.schema';

export async function listTransactions(query: ListTransactionsQuery) {
    const { type, page, limit } = query;

    const where = type ? { type } : {};

    const [items, total] = await Promise.all([
        prisma.transaction.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.transaction.count({ where }),
    ]);

    return {
        items,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
}

export async function createTransaction(input: CreateTransactionInput) {
    return prisma.transaction.create({ data: input });
}

export async function recordTransaction(
    tx: Prisma.TransactionClient,
    data: {
        type: 'INCOME' | 'EXPENSE';
        amount: number;
        description: string;
        referenceType: string;
        referenceId: string;
    },
) {
    return tx.transaction.create({ data });
}