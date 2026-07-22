import { api } from './axios';
import type { Notification } from '@/types/notification';
import type { PaginatedResult } from '@/types/inventory';

export interface NotificationsResult extends PaginatedResult<Notification> {
  unreadCount: number;
}

export async function listNotifications(page: number, limit: number): Promise<NotificationsResult> {
  const { data } = await api.get<NotificationsResult>('/notifications', { params: { page, limit } });
  return data;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  await api.post(`/notifications/${id}/read`);
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await api.post('/notifications/read-all');
}
