import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import type { Prisma } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { SALT_ROUNDS } from './auth.service';
import { generateTempPassword } from '../utils/generatePassword';
import { sendCredentialsEmail } from './email.service';
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

/**
 * Creates an Employee HR record along with a linked login (User) account.
 * A temporary password is generated, hashed, and emailed to the employee;
 * they must change it on first login (mustChangePassword). If email
 * delivery fails, the account is still created — the admin is told so via
 * the `credentialsEmailSent` flag and can resend/relay credentials another way.
 */
export async function createEmployee(input: CreateEmployeeInput) {
    const existingEmployee = await prisma.employee.findUnique({ where: { email: input.email } });
    if (existingEmployee) {
        throw new AppError('An employee with this email already exists', 409);
    }

    const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
    if (existingUser) {
        throw new AppError('A login account with this email already exists', 409);
    }

    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, SALT_ROUNDS);

    const { role, ...employeeData } = input;

    const employee = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const user = await tx.user.create({
            data: {
                name: input.name,
                email: input.email,
                password: hashedPassword,
                role,
                mustChangePassword: true,
            },
        });

        return tx.employee.create({
            data: { ...employeeData, role, userId: user.id },
        });
    });

    let credentialsEmailSent = true;
    try {
        await sendCredentialsEmail({
            to: input.email,
            name: input.name,
            email: input.email,
            tempPassword,
            role,
        });
    } catch (err) {
        console.error(`Failed to send credentials email to ${input.email}:`, err);
        credentialsEmailSent = false;
    }

    return { employee, credentialsEmailSent };
}

export async function updateEmployee(id: string, input: UpdateEmployeeInput) {
    const existing = await getEmployeeById(id);

    if (input.email) {
        const existingEmployee = await prisma.employee.findFirst({
            where: { email: input.email, NOT: { id } },
        });
        if (existingEmployee) {
            throw new AppError('An employee with this email already exists', 409);
        }

        if (!existing.userId) {
            const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
            if (existingUser) {
                throw new AppError('A login account with this email already exists', 409);
            }
        }
    }

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Keep the linked login account's email/role in sync with the HR record.
        if (existing.userId && (input.email || input.role)) {
            await tx.user.update({
                where: { id: existing.userId },
                data: {
                    ...(input.email && { email: input.email }),
                    ...(input.role && { role: input.role }),
                },
            });
        }

        return tx.employee.update({ where: { id }, data: input });
    });
}

export async function deactivateEmployee(id: string) {
    const employee = await getEmployeeById(id);

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        if (employee.userId) {
            await tx.user.update({ where: { id: employee.userId }, data: { isActive: false } });
        }
        return tx.employee.update({ where: { id }, data: { isActive: false } });
    });
}

export async function reactivateEmployee(id: string) {
    const employee = await getEmployeeById(id, true); // must look up including inactive ones

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        if (employee.userId) {
            await tx.user.update({ where: { id: employee.userId }, data: { isActive: true } });
        }
        return tx.employee.update({ where: { id }, data: { isActive: true } });
    });
}