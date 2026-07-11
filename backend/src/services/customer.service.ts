import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import type { CreateCustomerInput, UpdateCustomerInput } from '../utils/validation/sale.schema';

export async function listCustomers() {
  return prisma.customer.findMany({ orderBy: { name: 'asc' } });
}

export async function getCustomerById(id: string) {
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) {
    throw new AppError('Customer not found', 404);
  }
  return customer;
}

export async function createCustomer(input: CreateCustomerInput) {
  return prisma.customer.create({ data: input });
}

export async function updateCustomer(id: string, input: UpdateCustomerInput) {
  await getCustomerById(id);
  return prisma.customer.update({ where: { id }, data: input });
}
