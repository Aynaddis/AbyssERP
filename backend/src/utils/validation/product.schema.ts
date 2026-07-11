import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  sku: z.string().min(1, 'SKU is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be greater than 0'),
  costPrice: z.number().nonnegative('Cost price cannot be negative').optional(),
  quantity: z.number().int().nonnegative('Quantity cannot be negative').default(0),
  lowStockThreshold: z.number().int().nonnegative().default(10),
  categoryId: z.string().optional(),
  imageUrl: z.string().url('Must be a valid URL').optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const listProductsQuerySchema = z.object({
  categoryId: z.string().optional(),
  lowStockOnly: z.coerce.boolean().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
