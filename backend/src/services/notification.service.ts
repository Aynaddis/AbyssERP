import { prisma } from '../config/prisma';

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

export async function notifyLowStockIfNeeded(productId: string, productName: string, quantity: number) {
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
