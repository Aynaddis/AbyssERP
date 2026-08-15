import { prisma } from '../config/prisma';
import type { Prisma } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import type { CreateSaleInput, ListSalesQuery } from '../utils/validation/sale.schema';
import { recordTransaction } from './transaction.service';
import { getSettings } from './settings.service';

function startOfRange(range: 'today' | 'week' | 'month'): Date {
  const now = new Date();
  if (range === 'today') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  if (range === 'week') {
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    return start;
  }
  const start = new Date(now);
  start.setMonth(now.getMonth() - 1);
  return start;
}

export async function listSales(query: ListSalesQuery) {
  const { search, dateRange, status, page, limit } = query;

  const where = {
    ...(status && { status }),
    ...(dateRange && { createdAt: { gte: startOfRange(dateRange) } }),
    ...(search && {
      OR: [
        { id: { contains: search, mode: 'insensitive' as const } },
        { customer: { name: { contains: search, mode: 'insensitive' as const } } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.salesOrder.findMany({
      where,
      include: {
        customer: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.salesOrder.count({ where }),
  ]);

  return {
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getSaleById(id: string) {
  const sale = await prisma.salesOrder.findUnique({
    where: { id },
    include: {
      customer: true,
      items: { include: { product: true } },
    },
  });

  if (!sale) {
    throw new AppError('Sale not found', 404);
  }

  return sale;
}

interface ProductForSale {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export async function createSale(input: CreateSaleInput) {
  const productIds = input.items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isDeleted: false },
  });

  if (products.length !== productIds.length) {
    throw new AppError('One or more products in this sale do not exist', 400);
  }

  const productMap = new Map<string, ProductForSale>(products.map((p: ProductForSale) => [p.id, p]));

  const insufficient: string[] = [];
  for (const item of input.items) {
    const product = productMap.get(item.productId)!;
    if (product.quantity < item.quantity) {
      insufficient.push(`${product.name} (requested ${item.quantity}, only ${product.quantity} in stock)`);
    }
  }

  if (insufficient.length > 0) {
    throw new AppError(`Insufficient stock: ${insufficient.join('; ')}`, 409);
  }

  if (input.customerId) {
    const customer = await prisma.customer.findUnique({ where: { id: input.customerId } });
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }
  }

  const { taxRate } = await getSettings();

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    let subtotal = 0;
    const itemsData = input.items.map((item) => {
      const product = productMap.get(item.productId)!;
      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal: itemSubtotal,
      };
    });

    // Tax is computed from the business's configured rate at the moment of
    // sale and snapshotted onto the order — later changes to the rate in
    // Settings must never retroactively alter historical invoices/reports.
    const taxAmount = taxRate ? subtotal * (taxRate / 100) : 0;
    const totalAmount = subtotal + taxAmount;

    await Promise.all(
      input.items.map((item) =>
        tx.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } },
        }),
      ),
    );

    const sale = await tx.salesOrder.create({
      data: {
        customerId: input.customerId,
        status: 'COMPLETED',
        subtotal,
        taxAmount,
        totalAmount,
        items: { create: itemsData },
      },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    });

    await recordTransaction(tx, {
      type: 'INCOME',
      amount: totalAmount,
      description: `Sale #${sale.id.slice(-8)}${sale.customer ? ` to ${sale.customer.name}` : ''}`,
      referenceType: 'SALE',
      referenceId: sale.id,
    });

    return sale;
  });
}

export async function cancelSale(id: string) {
  const sale = await prisma.salesOrder.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!sale) {
    throw new AppError('Sale not found', 404);
  }

  if (sale.status !== 'COMPLETED') {
    throw new AppError(`Sale is already ${sale.status.toLowerCase()}`, 409);
  }

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    for (const item of sale.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { quantity: { increment: item.quantity } },
      });
    }

    return tx.salesOrder.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    });
  });
}