export interface BusinessSettings {
  id: string;
  businessName: string;
  businessLogoUrl: string | null;
  currency: string;
  taxRate: number | null;
  notifyLowStock: boolean;
  notifyNewSale: boolean;
  updatedAt: string;
}
