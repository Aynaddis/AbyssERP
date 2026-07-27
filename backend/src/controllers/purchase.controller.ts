import { Request, Response, NextFunction } from 'express';
import { createPurchaseOrderSchema, listPurchaseOrdersQuerySchema } from '../utils/validation/purchase.schema';
import {
  listPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  receivePurchaseOrder,
  cancelPurchaseOrder,
} from '../services/purchase.service';
import { logAudit } from '../services/audit.service';
import { notify } from '../services/notification.service';
import { AppError } from '../middleware/errorHandler';

export async function getPurchaseOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = listPurchaseOrdersQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 400);
    }

    const result = await listPurchaseOrders(parsed.data);
    res.status(200).json(result);
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
    await logAudit({
      userId: req.user?.userId,
      action: 'CREATE',
      entityType: 'PurchaseOrder',
      entityId: order.id,
      description: `Created purchase order for "${order.supplier.name}" with ${order.items.length} item(s)`,
    });

    await notify({
      type: 'PO_CREATED',
      message: `New purchase order created for "${order.supplier.name}"`,
      visibleToRoles: ['ADMIN', 'MANAGER'],
      entityType: 'PurchaseOrder',
      entityId: order.id,
    });

    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
}

export async function postReceivePurchaseOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await receivePurchaseOrder(String(req.params.id));
    await logAudit({
      userId: req.user?.userId,
      action: 'RECEIVE',
      entityType: 'PurchaseOrder',
      entityId: order.id,
      description: `Received purchase order from "${order.supplier.name}" — stock incremented for ${order.items.length} item(s)`,
    });

    await notify({
      type: 'PO_RECEIVED',
      message: `Purchase order from "${order.supplier.name}" received`,
      visibleToRoles: ['ADMIN', 'MANAGER'],
      entityType: 'PurchaseOrder',
      entityId: order.id,
    });

    res.status(200).json({ order });
  } catch (err) {
    next(err);
  }
}

export async function postCancelPurchaseOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await cancelPurchaseOrder(String(req.params.id));
    await logAudit({
      userId: req.user?.userId,
      action: 'CANCEL',
      entityType: 'PurchaseOrder',
      entityId: order.id,
      description: `Cancelled purchase order #${order.id.slice(-8).toUpperCase()}`,
    });

    await notify({
      type: 'PO_CANCELLED',
      message: `Purchase order #${order.id.slice(-8).toUpperCase()} was cancelled`,
      visibleToRoles: ['ADMIN', 'MANAGER'],
      entityType: 'PurchaseOrder',
      entityId: order.id,
    });

    res.status(200).json({ order });
  } catch (err) {
    next(err);
  }
}