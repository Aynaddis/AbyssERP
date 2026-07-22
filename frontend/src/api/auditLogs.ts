import { api } from './axios';
import type { AuditLog } from '@/types/audit';
import type { PaginatedResult } from '@/types/inventory';

export async function listAuditLogs(page: number, limit: number): Promise<PaginatedResult<AuditLog>> {
  const { data } = await api.get<PaginatedResult<AuditLog>>('/audit-logs', {
    params: { page, limit },
  });
  return data;
}

export async function getRecentActivity(limit: number): Promise<AuditLog[]> {
  const { data } = await api.get<{ logs: AuditLog[] }>('/audit-logs/recent', { params: { limit } });
  return data.logs;
}