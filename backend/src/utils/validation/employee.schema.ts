import { z } from 'zod';

export const createEmployeeSchema = z.object({
    name: z.string().min(2, 'Employee name must be at least 2 characters'),
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().optional(),
    department: z.string().min(1, 'Department is required'),
    position: z.string().optional(),
    salary: z.number().nonnegative('Salary cannot be negative'),
    hireDate: z.coerce.date().optional(),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;