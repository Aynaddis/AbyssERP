import { Request, Response, NextFunction } from 'express';
import { generateInventoryCsv, generateSalesCsv } from '../services/report.service';

export async function getInventoryReport(_req: Request, res: Response, next: NextFunction) {
  try {
    const csv = await generateInventoryCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="inventory-report.csv"');
    res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
}

export async function getSalesReport(_req: Request, res: Response, next: NextFunction) {
  try {
    const csv = await generateSalesCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="sales-report.csv"');
    res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
}