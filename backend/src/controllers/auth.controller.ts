import { Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from '../utils/validation/auth.schema';
import { registerUser, loginUser, getUserById, updateProfile, changePassword } from '../services/auth.service';
import { AppError } from '../middleware/errorHandler';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 400);
    }

    const result = await registerUser(parsed.data);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 400);
    }

    const result = await loginUser(parsed.data);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }
    const user = await getUserById(req.user.userId);
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}

export async function putProfile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Authentication required', 401);
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);
    const user = await updateProfile(req.user.userId, parsed.data);
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}

export async function putPassword(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Authentication required', 401);
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);
    await changePassword(req.user.userId, parsed.data);
    res.status(200).json({ message: 'Password updated' });
  } catch (err) {
    next(err);
  }
}
