import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import type {
  CreateProductInput,
  UpdateProductInput,
  ListProductsQuery,
} from '../utils/validation/product.schema';

export async function listProducts(query: ListProductsQuery) {
  const { categoryId, lowStockOnly, search, page, limit } = query;

  const where: any = {
    isDeleted: false,
    ...(categoryId && { categoryId }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  const filtered = lowStockOnly
    ? items.filter((p: { quantity: number; lowStockThreshold: number }) => p.quantity <= p.lowStockThreshold)
    : items;

  return {
    items: filtered,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getProductById(id: string) {
  const product = await prisma.product.findFirst({
    where: { id, isDeleted: false },
    include: { category: true },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  return product;
}

export async function createProduct(input: CreateProductInput) {
  const existingSku = await prisma.product.findUnique({ where: { sku: input.sku } });
  if (existingSku) {
    throw new AppError('A product with this SKU already exists', 409);
  }

  return prisma.product.create({
    data: input,
    include: { category: true },
  });
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  await getProductById(id);

  if (input.sku) {
    const existingSku = await prisma.product.findFirst({
      where: { sku: input.sku, NOT: { id } },
    });
    if (existingSku) {
      throw new AppError('A product with this SKU already exists', 409);
    }
  }

  return prisma.product.update({
    where: { id },
    data: input,
    include: { category: true },
  });
}

export async function softDeleteProduct(id: string) {
  await getProductById(id);

  return prisma.product.update({
    where: { id },
    data: { isDeleted: true },
  });
}

export async function getLowStockProducts() {
  const products = await prisma.product.findMany({
    where: { isDeleted: false },
    include: { category: true },
  });

  return products.filter((p: { quantity: number; lowStockThreshold: number }) => p.quantity <= p.lowStockThreshold);
}
