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

export const listEmployeesQuerySchema = z.object({
  search: z.string().optional(),
  includeInactive: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type ListEmployeesQuery = z.infer<typeof listEmployeesQuerySchema>;