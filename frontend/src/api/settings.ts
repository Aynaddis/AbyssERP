import { api } from './axios';
import type { BusinessSettings } from '@/types/settings';

export interface UpdateSettingsInput {
  businessName?: string;
  businessLogoUrl?: string;
  currency?: string;
  taxRate?: number | null;
  notifyLowStock?: boolean;
  notifyNewSale?: boolean;
}

export async function getSettings(): Promise<BusinessSettings> {
  const { data } = await api.get<{ settings: BusinessSettings }>('/settings');
  return data.settings;
}

export async function uploadLogoImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  const { data } = await api.post<{ imageUrl: string }>('/uploads/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.imageUrl;
}

export async function updateSettings(input: UpdateSettingsInput): Promise<BusinessSettings> {
  const { data } = await api.put<{ settings: BusinessSettings }>('/settings', input);
  return data.settings;
}