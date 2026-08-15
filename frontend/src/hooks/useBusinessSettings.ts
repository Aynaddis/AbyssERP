import { useQuery } from '@tanstack/react-query';
import { getSettings } from '@/api/settings';

/**
 * Shared read of business settings (currency, tax rate, business name/logo).
 * Shares the same react-query cache key as SettingsPage's own fetch, so this
 * doesn't cause an extra network request when both are mounted. Available
 * to every authenticated role — the backend only restricts the PUT.
 */
export function useBusinessSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
    staleTime: 5 * 60 * 1000,
  });
}