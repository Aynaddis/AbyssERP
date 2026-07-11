import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import type { JwtPayload } from '../utils/jwt';

type Role = JwtPayload['role'];

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
}
