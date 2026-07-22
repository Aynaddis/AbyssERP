import { z } from 'zod';

export const createTransactionSchema = z.object({
    type: z.enum(['INCOME', 'EXPENSE']),
    amount: z.number().positive('Amount must be greater than 0'),
    description: z.string().min(1, 'Description is required'),
});

export const listTransactionsQuerySchema = z.object({
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>;