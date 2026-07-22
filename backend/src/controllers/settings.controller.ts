import { Request, Response, NextFunction } from 'express';
import { updateSettingsSchema } from '../utils/validation/settings.schema';
import { getSettings, updateSettings } from '../services/settings.service';
import { AppError } from '../middleware/errorHandler';

export async function getBusinessSettings(_req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await getSettings();
    res.status(200).json({ settings });
  } catch (err) {
    next(err);
  }
}

export async function putBusinessSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = updateSettingsSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);
    const settings = await updateSettings(parsed.data);
    res.status(200).json({ settings });
  } catch (err) {
    next(err);
  }
}
