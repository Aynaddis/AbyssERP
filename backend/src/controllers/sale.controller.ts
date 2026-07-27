import { Request, Response, NextFunction } from 'express';
import { createSaleSchema, listSalesQuerySchema } from '../utils/validation/sale.schema';
import { listSales, getSaleById, createSale, cancelSale } from '../services/sale.service';
import { generateInvoicePdf } from '../services/pdf.service';
import { logAudit } from '../services/audit.service';
import { notify, notifyLowStockIfNeeded } from '../services/notification.service';
import { AppError } from '../middleware/errorHandler';

export async function getSales(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = listSalesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 400);
    }

    const result = await listSales(parsed.data);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getSale(req: Request, res: Response, next: NextFunction) {
  try {
    const sale = await getSaleById(String(req.params.id));
    res.status(200).json({ sale });
  } catch (err) {
    next(err);
  }
}

export async function postSale(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createSaleSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 400);
    }

    const sale = await createSale(parsed.data);
    await logAudit({
      userId: req.user?.userId,
      action: 'CREATE',
      entityType: 'Sale',
      entityId: sale.id,
      description: `Completed sale #${sale.id.slice(-8).toUpperCase()} totaling $${sale.totalAmount.toFixed(2)} — stock decremented`,
    });

    await notify({
      type: 'SALE_COMPLETED',
      message: `Sale #${sale.id.slice(-8).toUpperCase()} completed — $${sale.totalAmount.toFixed(2)}`,
      visibleToRoles: ['ADMIN', 'MANAGER'],
      entityType: 'Sale',
      entityId: sale.id,
    });

    for (const item of sale.items) {
      if (item.product.quantity <= item.product.lowStockThreshold) {
        await notifyLowStockIfNeeded(item.product.id, item.product.name, item.product.quantity);
      }
    }

    res.status(201).json({ sale });
  } catch (err) {
    next(err);
  }
}

export async function postCancelSale(req: Request, res: Response, next: NextFunction) {
  try {
    const sale = await cancelSale(String(req.params.id));
    await logAudit({
      userId: req.user?.userId,
      action: 'CANCEL',
      entityType: 'Sale',
      entityId: sale.id,
      description: `Cancelled sale #${sale.id.slice(-8).toUpperCase()} — stock restored`,
    });

    await notify({
      type: 'SALE_CANCELLED',
      message: `Sale #${sale.id.slice(-8).toUpperCase()} was cancelled — stock restored`,
      visibleToRoles: ['ADMIN', 'MANAGER'],
      entityType: 'Sale',
      entityId: sale.id,
    });

    res.status(200).json({ sale });
  } catch (err) {
    next(err);
  }
}

export async function getSaleInvoice(req: Request, res: Response, next: NextFunction) {
  try {
    const pdfBytes = await generateInvoicePdf(String(req.params.id));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${req.params.id.slice(-8)}.pdf"`);
    res.status(200).send(Buffer.from(pdfBytes));
  } catch (err) {
    next(err);
  }
}