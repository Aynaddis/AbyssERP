import { Request, Response, NextFunction } from 'express';
import {
  createProductSchema,
  updateProductSchema,
  listProductsQuerySchema,
} from '../utils/validation/product.schema';
import {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  softDeleteProduct,
  getLowStockProducts,
} from '../services/product.service';
import { AppError } from '../middleware/errorHandler';

export async function getProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = listProductsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 400);
    }

    const result = await listProducts(parsed.data);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await getProductById(String(req.params.id));
    res.status(200).json({ product });
  } catch (err) {
    next(err);
  }
}

export async function postProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createProductSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 400);
    }

    const product = await createProduct(parsed.data);
    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
}

export async function putProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = updateProductSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 400);
    }

    const product = await updateProduct(String(req.params.id), parsed.data);
    res.status(200).json({ product });
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    await softDeleteProduct(String(req.params.id));
    res.status(200).json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
}

export async function getLowStock(_req: Request, res: Response, next: NextFunction) {
  try {
    const products = await getLowStockProducts();
    res.status(200).json({ products });
  } catch (err) {
    next(err);
  }
}
