import { Request, Response, NextFunction } from 'express';
import { createPurchaseOrderSchema } from '../utils/validation/purchase.schema';
import {
  listPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  receivePurchaseOrder,
  cancelPurchaseOrder,
} from '../services/purchase.service';
import { AppError } from '../middleware/errorHandler';

export async function getPurchaseOrders(_req: Request, res: Response, next: NextFunction) {
  try {
    const orders = await listPurchaseOrders();
    res.status(200).json({ orders });
  } catch (err) {
    next(err);
  }
}

export async function getPurchaseOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await getPurchaseOrderById(String(req.params.id));
    res.status(200).json({ order });
  } catch (err) {
    next(err);
  }
}

export async function postPurchaseOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createPurchaseOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 400);
    }

    const order = await createPurchaseOrder(parsed.data);
    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
}

export async function postReceivePurchaseOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await receivePurchaseOrder(String(req.params.id));
    res.status(200).json({ order });
  } catch (err) {
    next(err);
  }
}

export async function postCancelPurchaseOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await cancelPurchaseOrder(String(req.params.id));
    res.status(200).json({ order });
  } catch (err) {
    next(err);
  }
}
