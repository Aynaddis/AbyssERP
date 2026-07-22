import { Request, Response, NextFunction } from 'express';
import { listAuditLogs, getRecentAuditLogs } from '../services/audit.service';

export async function getAuditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const result = await listAuditLogs(page, limit);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getRecentActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const logs = await getRecentAuditLogs(limit);
    res.status(200).json({ logs });
  } catch (err) {
    next(err);
  }
}