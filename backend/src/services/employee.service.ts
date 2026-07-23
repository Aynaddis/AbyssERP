import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import type { CreateEmployeeInput, UpdateEmployeeInput, ListEmployeesQuery } from '../utils/validation/employee.schema';

export async function listEmployees(query: ListEmployeesQuery) {
  const { search, includeInactive, page, limit } = query;
  const where = {
    ...(includeInactive ? {} : { isActive: true }),
    ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.employee.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.employee.count({ where }),
  ]);

  return {
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getEmployeeById(id: string, includeInactive = false) {
    const employee = await prisma.employee.findFirst({
        where: includeInactive ? { id } : { id, isActive: true },
    });
    if (!employee) {
        throw new AppError('Employee not found', 404);
    }
    return employee;
}

export async function createEmployee(input: CreateEmployeeInput) {
    if (input.email) {
        const existing = await prisma.employee.findUnique({ where: { email: input.email } });
        if (existing) {
            throw new AppError('An employee with this email already exists', 409);
        }
    }

    return prisma.employee.create({ data: input });
}

export async function updateEmployee(id: string, input: UpdateEmployeeInput) {
    await getEmployeeById(id);

    if (input.email) {
        const existing = await prisma.employee.findFirst({
            where: { email: input.email, NOT: { id } },
        });
        if (existing) {
            throw new AppError('An employee with this email already exists', 409);
        }
    }

    return prisma.employee.update({ where: { id }, data: input });
}

export async function deactivateEmployee(id: string) {
    await getEmployeeById(id);
    return prisma.employee.update({ where: { id }, data: { isActive: false } });
}

export async function reactivateEmployee(id: string) {
    await getEmployeeById(id, true); // must look up including inactive ones
    return prisma.employee.update({ where: { id }, data: { isActive: true } });
}