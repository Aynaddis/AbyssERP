import { Request, Response, NextFunction } from 'express';
import { createCategorySchema, updateCategorySchema } from '../utils/validation/category.schema';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/category.service';
import { AppError } from '../middleware/errorHandler';

export async function getCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await listCategories();
    res.status(200).json({ categories });
  } catch (err) {
    next(err);
  }
}

export async function postCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 400);
    }

    const category = await createCategory(parsed.data);
    res.status(201).json({ category });
  } catch (err) {
    next(err);
  }
}

export async function putCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = updateCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 400);
    }

    const category = await updateCategory(String(req.params.id), parsed.data);
    res.status(200).json({ category });
  } catch (err) {
    next(err);
  }
}

export async function removeCategory(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteCategory(String(req.params.id));
    res.status(200).json({ message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
}
