import { Request, Response, NextFunction } from 'express';
import { createTransactionSchema, listTransactionsQuerySchema } from '../utils/validation/transaction.schema';
import { listTransactions, createTransaction } from '../services/transaction.service';
import { AppError } from '../middleware/errorHandler';

export async function getTransactions(req: Request, res: Response, next: NextFunction) {
    try {
        const parsed = listTransactionsQuerySchema.safeParse(req.query);
        if (!parsed.success) {
            throw new AppError(parsed.error.issues[0].message, 400);
        }

        const result = await listTransactions(parsed.data);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}

export async function postTransaction(req: Request, res: Response, next: NextFunction) {
    try {
        const parsed = createTransactionSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new AppError(parsed.error.issues[0].message, 400);
        }

        const transaction = await createTransaction(parsed.data);
        res.status(201).json({ transaction });
    } catch (err) {
        next(err);
    }
}