import { prisma } from '../config/prisma';

interface LogAuditParams {
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
}

export async function logAudit(params: LogAuditParams) {
  try {
    await prisma.auditLog.create({ data: params });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}

export async function listAuditLogs(page: number, limit: number) {
  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      include: { user: { select: { name: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count(),
  ]);

  return {
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getRecentAuditLogs(limit: number) {
  return prisma.auditLog.findMany({
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}