import { prisma } from '../config/prisma';
import type { Prisma } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import type { CreatePurchaseOrderInput, ListPurchaseOrdersQuery } from '../utils/validation/purchase.schema';
import { recordTransaction } from './transaction.service';

export async function listPurchaseOrders(query: ListPurchaseOrdersQuery) {
  const { search, status, page, limit } = query;

  const where = {
    ...(status && { status }),
    ...(search && {
      supplier: { name: { contains: search, mode: 'insensitive' as const } },
    }),
  };

  const [items, total] = await Promise.all([
    prisma.purchaseOrder.findMany({
      where,
      include: {
        supplier: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.purchaseOrder.count({ where }),
  ]);

  return {
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getPurchaseOrderById(id: string) {
  const po = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      supplier: true,
      items: { include: { product: true } },
    },
  });

  if (!po) {
    throw new AppError('Purchase order not found', 404);
  }

  return po;
}

export async function createPurchaseOrder(input: CreatePurchaseOrderInput) {
  const supplier = await prisma.supplier.findUnique({ where: { id: input.supplierId } });
  if (!supplier) {
    throw new AppError('Supplier not found', 404);
  }

  const productIds = input.items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isDeleted: false },
  });
  if (products.length !== productIds.length) {
    throw new AppError('One or more products in this order do not exist', 400);
  }

  return prisma.purchaseOrder.create({
    data: {
      supplierId: input.supplierId,
      status: 'PENDING',
      items: {
        create: input.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost,
        })),
      },
    },
    include: {
      supplier: true,
      items: { include: { product: true } },
    },
  });
}

export async function receivePurchaseOrder(id: string) {
  const po = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!po) {
    throw new AppError('Purchase order not found', 404);
  }

  if (po.status !== 'PENDING') {
    throw new AppError(`Purchase order is already ${po.status.toLowerCase()}`, 409);
  }

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const totalCost = po.items.reduce(
      (sum: number, item: { quantity: number; unitCost: number }) => sum + item.quantity * item.unitCost,
      0,
    );

    await Promise.all(
      po.items.map((item: { productId: string; quantity: number; unitCost: number }) =>
        tx.product.update({
          where: { id: item.productId },
          data: {
            quantity: { increment: item.quantity },
            costPrice: item.unitCost,
          },
        }),
      ),
    );

    const updatedPo = await tx.purchaseOrder.update({
      where: { id },
      data: { status: 'RECEIVED', receivedDate: new Date() },
      include: {
        supplier: true,
        items: { include: { product: true } },
      },
    });

    await recordTransaction(tx, {
      type: 'EXPENSE',
      amount: totalCost,
      description: `Purchase order received from ${updatedPo.supplier.name}`,
      referenceType: 'PURCHASE_ORDER',
      referenceId: updatedPo.id,
    });

    return updatedPo;
  });
}

export async function cancelPurchaseOrder(id: string) {
  const po = await prisma.purchaseOrder.findUnique({ where: { id } });
  if (!po) {
    throw new AppError('Purchase order not found', 404);
  }

  if (po.status !== 'PENDING') {
    throw new AppError(`Cannot cancel a purchase order that is already ${po.status.toLowerCase()}`, 409);
  }

  return prisma.purchaseOrder.update({
    where: { id },
    data: { status: 'CANCELLED' },
  });
}