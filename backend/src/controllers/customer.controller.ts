import { Request, Response, NextFunction } from 'express';
import { createCustomerSchema, updateCustomerSchema } from '../utils/validation/sale.schema';
import {
  listCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
} from '../services/customer.service';
import { AppError } from '../middleware/errorHandler';

export async function getCustomers(_req: Request, res: Response, next: NextFunction) {
  try {
    const customers = await listCustomers();
    res.status(200).json({ customers });
  } catch (err) {
    next(err);
  }
}

export async function getCustomer(req: Request, res: Response, next: NextFunction) {
  try {
    const customer = await getCustomerById(String(req.params.id));
    res.status(200).json({ customer });
  } catch (err) {
    next(err);
  }
}

export async function postCustomer(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createCustomerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 400);
    }

    const customer = await createCustomer(parsed.data);
    res.status(201).json({ customer });
  } catch (err) {
    next(err);
  }
}

export async function putCustomer(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = updateCustomerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 400);
    }

    const customer = await updateCustomer(String(req.params.id), parsed.data);
    res.status(200).json({ customer });
  } catch (err) {
    next(err);
  }
}
