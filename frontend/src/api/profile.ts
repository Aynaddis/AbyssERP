import { api } from './axios';
import type { UserProfile } from '@/types/profile';

export interface UpdateProfileInput {
  name?: string;
  email?: string;
  avatarUrl?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export async function getProfile(): Promise<UserProfile> {
  const { data } = await api.get<{ user: UserProfile }>('/auth/me');
  return data.user;
}

export async function updateProfile(input: UpdateProfileInput): Promise<UserProfile> {
  const { data } = await api.put<{ user: UserProfile }>('/auth/me', input);
  return data.user;
}

export async function changePassword(input: ChangePasswordInput): Promise<void> {
  await api.put('/auth/me/password', input);
}
