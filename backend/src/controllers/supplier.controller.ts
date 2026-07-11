import { Request, Response, NextFunction } from 'express';
import { createSupplierSchema, updateSupplierSchema } from '../utils/validation/purchase.schema';
import {
  listSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '../services/supplier.service';
import { AppError } from '../middleware/errorHandler';

export async function getSuppliers(_req: Request, res: Response, next: NextFunction) {
  try {
    const suppliers = await listSuppliers();
    res.status(200).json({ suppliers });
  } catch (err) {
    next(err);
  }
}

export async function getSupplier(req: Request, res: Response, next: NextFunction) {
  try {
    const supplier = await getSupplierById(String(req.params.id));
    res.status(200).json({ supplier });
  } catch (err) {
    next(err);
  }
}

export async function postSupplier(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createSupplierSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 400);
    }

    const supplier = await createSupplier(parsed.data);
    res.status(201).json({ supplier });
  } catch (err) {
    next(err);
  }
}

export async function putSupplier(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = updateSupplierSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 400);
    }

    const supplier = await updateSupplier(String(req.params.id), parsed.data);
    res.status(200).json({ supplier });
  } catch (err) {
    next(err);
  }
}

export async function removeSupplier(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteSupplier(String(req.params.id));
    res.status(200).json({ message: 'Supplier deleted' });
  } catch (err) {
    next(err);
  }
}
