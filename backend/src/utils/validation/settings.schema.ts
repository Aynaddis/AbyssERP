import { z } from 'zod';

export const updateSettingsSchema = z.object({
  businessName: z.string().min(1, 'Business name is required').optional(),
  businessLogoUrl: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  currency: z.string().min(1).optional(),
  taxRate: z.number().min(0).max(100).nullable().optional(),
  notifyLowStock: z.boolean().optional(),
  notifyNewSale: z.boolean().optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
