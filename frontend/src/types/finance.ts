export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
    id: string;
    type: TransactionType;
    amount: number;
    description: string;
    referenceType: string | null;
    referenceId: string | null;
    createdAt: string;
}