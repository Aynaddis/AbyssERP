import { Request, Response, NextFunction } from 'express';
import { createSaleSchema } from '../utils/validation/sale.schema';
import { listSales, getSaleById, createSale, cancelSale } from '../services/sale.service';
import { AppError } from '../middleware/errorHandler';

export async function getSales(_req: Request, res: Response, next: NextFunction) {
  try {
    const sales = await listSales();
    res.status(200).json({ sales });
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
    res.status(201).json({ sale });
  } catch (err) {
    next(err);
  }
}

export async function postCancelSale(req: Request, res: Response, next: NextFunction) {
  try {
    const sale = await cancelSale(String(req.params.id));
    res.status(200).json({ sale });
  } catch (err) {
    next(err);
  }
}
