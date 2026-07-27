import { Request, Response, NextFunction } from 'express';
import { createSupplierSchema, updateSupplierSchema, listSuppliersQuerySchema } from '../utils/validation/purchase.schema';
import {
  listSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '../services/supplier.service';
import { logAudit } from '../services/audit.service';
import { AppError } from '../middleware/errorHandler';

export async function getSuppliers(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = listSuppliersQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 400);
    }

    const result = await listSuppliers(parsed.data);
    res.status(200).json(result);
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
    await logAudit({
      userId: req.user?.userId,
      action: 'CREATE',
      entityType: 'Supplier',
      entityId: supplier.id,
      description: `Added supplier "${supplier.name}"`,
    });
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
    await logAudit({
      userId: req.user?.userId,
      action: 'UPDATE',
      entityType: 'Supplier',
      entityId: supplier.id,
      description: `Updated supplier "${supplier.name}"`,
    });
    res.status(200).json({ supplier });
  } catch (err) {
    next(err);
  }
}

export async function removeSupplier(req: Request, res: Response, next: NextFunction) {
  try {
    const id = String(req.params.id);
    const supplier = await getSupplierById(id);
    await deleteSupplier(id);
    await logAudit({
      userId: req.user?.userId,
      action: 'DELETE',
      entityType: 'Supplier',
      entityId: id,
      description: `Deleted supplier "${supplier.name}"`,
    });
    res.status(200).json({ message: 'Supplier deleted' });
  } catch (err) {
    next(err);
  }
}