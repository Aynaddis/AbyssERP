export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  createdAt: string;
  user: { name: string; role: string } | null;
}