import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import type { CreateCategoryInput, UpdateCategoryInput } from '../utils/validation/category.schema';

export async function listCategories() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  });
}

export async function createCategory(input: CreateCategoryInput) {
  const existing = await prisma.category.findUnique({ where: { name: input.name } });
  if (existing) {
    throw new AppError('A category with this name already exists', 409);
  }

  return prisma.category.create({ data: input });
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    throw new AppError('Category not found', 404);
  }

  return prisma.category.update({ where: { id }, data: input });
}

export async function deleteCategory(id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  if (category._count.products > 0) {
    throw new AppError(
      `Cannot delete category with ${category._count.products} product(s) still assigned to it`,
      409,
    );
  }

  return prisma.category.delete({ where: { id } });
}
