import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import type { CreateSupplierInput, UpdateSupplierInput } from '../utils/validation/purchase.schema';

export async function listSuppliers() {
  return prisma.supplier.findMany({ orderBy: { name: 'asc' } });
}

export async function getSupplierById(id: string) {
  const supplier = await prisma.supplier.findUnique({ where: { id } });
  if (!supplier) {
    throw new AppError('Supplier not found', 404);
  }
  return supplier;
}

export async function createSupplier(input: CreateSupplierInput) {
  return prisma.supplier.create({ data: input });
}

export async function updateSupplier(id: string, input: UpdateSupplierInput) {
  await getSupplierById(id);
  return prisma.supplier.update({ where: { id }, data: input });
}

export async function deleteSupplier(id: string) {
  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: { _count: { select: { purchaseOrders: true } } },
  });

  if (!supplier) {
    throw new AppError('Supplier not found', 404);
  }

  if (supplier._count.purchaseOrders > 0) {
    throw new AppError(
      `Cannot delete supplier with ${supplier._count.purchaseOrders} purchase order(s) on record`,
      409,
    );
  }

  return prisma.supplier.delete({ where: { id } });
}
