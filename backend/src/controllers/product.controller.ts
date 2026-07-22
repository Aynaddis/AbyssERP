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
import { logAudit } from '../services/audit.service';
import { notifyLowStockIfNeeded } from '../services/notification.service';
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
    await logAudit({
      userId: req.user?.userId,
      action: 'CREATE',
      entityType: 'Product',
      entityId: product.id,
      description: `Created product "${product.name}" (SKU: ${product.sku})`,
    });
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
    const stockChanged = parsed.data.quantity !== undefined;
    await logAudit({
      userId: req.user?.userId,
      action: 'UPDATE',
      entityType: 'Product',
      entityId: product.id,
      description: stockChanged
        ? `Updated product "${product.name}" — stock set to ${product.quantity}`
        : `Updated product "${product.name}"`,
    });

    if (stockChanged && product.quantity <= product.lowStockThreshold) {
      await notifyLowStockIfNeeded(product.id, product.name, product.quantity);
    }

    res.status(200).json({ product });
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const id = String(req.params.id);
    const product = await getProductById(id);
    await softDeleteProduct(id);

    await logAudit({
      userId: req.user?.userId,
      action: 'DELETE',
      entityType: 'Product',
      entityId: id,
      description: `Deleted product "${product.name}"`,
    });

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
