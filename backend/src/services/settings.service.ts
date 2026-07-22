import { prisma } from '../config/prisma';
import type { UpdateSettingsInput } from '../utils/validation/settings.schema';

const SINGLETON_ID = 'singleton';

export async function getSettings() {
  const existing = await prisma.businessSettings.findUnique({ where: { id: SINGLETON_ID } });
  if (existing) return existing;
  return prisma.businessSettings.create({ data: { id: SINGLETON_ID } });
}

export async function updateSettings(input: UpdateSettingsInput) {
  await getSettings();
  const data: Record<string, unknown> = { ...input };
  if (input.businessLogoUrl === '') data.businessLogoUrl = null;
  return prisma.businessSettings.update({ where: { id: SINGLETON_ID }, data });
}
