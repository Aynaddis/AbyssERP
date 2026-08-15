import { prisma } from '../config/prisma';
import { getSettings } from './settings.service';
import { sendLowStockAlertEmail, sendNewSaleAlertEmail } from './email.service';

type Role = 'ADMIN' | 'MANAGER' | 'STAFF';

interface NotifyParams {
  type: string;
  message: string;
  visibleToRoles: Role[];
  entityType?: string;
  entityId?: string;
}

export async function notify(params: NotifyParams) {
  try {
    await prisma.notification.create({ data: params });
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
}

async function getAlertRecipientEmails(): Promise<string[]> {
  const users = await prisma.user.findMany({
    where: { role: { in: ['ADMIN', 'MANAGER'] }, isActive: true },
    select: { email: true },
  });
  return users.map((u: { email: string }) => u.email);
}

export async function notifyLowStockIfNeeded(
  productId: string,
  productName: string,
  quantity: number,
  threshold: number,
) {
  const existing = await prisma.notification.findFirst({
    where: { type: 'LOW_STOCK', entityType: 'Product', entityId: productId, isRead: false },
  });
  if (existing) return;

  await notify({
    type: 'LOW_STOCK',
    message: `Low stock: "${productName}" has only ${quantity} unit(s) left`,
    visibleToRoles: ['ADMIN', 'MANAGER'],
    entityType: 'Product',
    entityId: productId,
  });

  // Email delivery is gated by the "Notify on low stock" setting — the
  // in-app notification above always fires so the alert is never lost even
  // if email isn't configured or the toggle is off.
  try {
    const settings = await getSettings();
    if (settings.notifyLowStock) {
      const recipients = await getAlertRecipientEmails();
      await sendLowStockAlertEmail({ to: recipients, productName, quantity, threshold });
    }
  } catch (err) {
    console.error('Failed to send low-stock alert email:', err);
  }
}

export async function notifySaleCompleted(sale: { id: string; totalAmount: number }) {
  const settings = await getSettings();

  await notify({
    type: 'SALE_COMPLETED',
    message: `Sale #${sale.id.slice(-8).toUpperCase()} completed — ${settings.currency} ${sale.totalAmount.toFixed(2)}`,
    visibleToRoles: ['ADMIN', 'MANAGER'],
    entityType: 'Sale',
    entityId: sale.id,
  });

  // Email delivery is gated by the "Notify on new sale" setting.
  try {
    if (settings.notifyNewSale) {
      const recipients = await getAlertRecipientEmails();
      await sendNewSaleAlertEmail({
        to: recipients,
        saleId: sale.id,
        totalAmount: sale.totalAmount,
        currency: settings.currency,
      });
    }
  } catch (err) {
    console.error('Failed to send new-sale alert email:', err);
  }
}

export async function listNotifications(role: Role, page: number, limit: number) {
  const where = { visibleToRoles: { has: role } };

  const [items, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { ...where, isRead: false } }),
  ]);

  return {
    items,
    unreadCount,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function markAsRead(id: string) {
  return prisma.notification.update({ where: { id }, data: { isRead: true } });
}

export async function markAllAsRead(role: Role) {
  await prisma.notification.updateMany({
    where: { visibleToRoles: { has: role }, isRead: false },
    data: { isRead: true },
  });
}