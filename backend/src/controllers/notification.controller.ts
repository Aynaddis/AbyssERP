import { Request, Response, NextFunction } from 'express';
import { listNotifications, markAsRead, markAllAsRead } from '../services/notification.service';
import { AppError } from '../middleware/errorHandler';

export async function getNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Authentication required', 401);
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const result = await listNotifications(req.user.role, page, limit);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function postMarkAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    const notification = await markAsRead(String(req.params.id));
    res.status(200).json({ notification });
  } catch (err) {
    next(err);
  }
}

export async function postMarkAllAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Authentication required', 401);
    await markAllAsRead(req.user.role);
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
}
