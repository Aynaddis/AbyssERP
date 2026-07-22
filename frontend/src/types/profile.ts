export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
  isActive: boolean;
  avatarUrl: string | null;
  createdAt: string;
}
