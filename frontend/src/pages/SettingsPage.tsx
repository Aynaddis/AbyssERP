import { useState, useEffect, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Info } from 'lucide-react';
import { getSettings, updateSettings } from '@/api/settings';
import { toast, toastErrorMessage } from '@/store/toastStore';
import { ThemeToggle } from '@/components/ThemeToggle';

const CURRENCIES = ['ETB', 'USD', 'EUR', 'GBP'];

export default function SettingsPage() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({ queryKey: ['settings'], queryFn: getSettings });

  const [form, setForm] = useState({
    businessName: '',
    businessLogoUrl: '',
    currency: 'ETB',
    taxRate: '',
    notifyLowStock: true,
    notifyNewSale: false,
  });

  useEffect(() => {
    if (settings) {
      setForm({
        businessName: settings.businessName,
        businessLogoUrl: settings.businessLogoUrl ?? '',
        currency: settings.currency,
        taxRate: settings.taxRate?.toString() ?? '',
        notifyLowStock: settings.notifyLowStock,
        notifyNewSale: settings.notifyNewSale,
      });
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: () =>
      updateSettings({
        businessName: form.businessName,
        businessLogoUrl: form.businessLogoUrl,
        currency: form.currency,
        taxRate: form.taxRate === '' ? null : Number(form.taxRate),
        notifyLowStock: form.notifyLowStock,
        notifyNewSale: form.notifyNewSale,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings saved');
    },
    onError: (err) => toast.error(toastErrorMessage(err, 'Failed to save settings')),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate();
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl h-96 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] animate-pulse" />
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold">Settings</h1>
        <p className="text-sm text-[var(--color-muted)]">Business-wide configuration for AbyssERP.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6 space-y-3">
          <h2 className="font-semibold text-sm mb-1">Business Info</h2>

          <div>
            <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">
              Business name
            </label>
            <input
              required
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">
              Business logo URL <span className="text-[var(--color-muted)]">(optional)</span>
            </label>
            <input
              value={form.businessLogoUrl}
              onChange={(e) => setForm({ ...form, businessLogoUrl: e.target.value })}
              placeholder="https://example.com/logo.png"
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
            />
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6 space-y-3">
          <h2 className="font-semibold text-sm mb-1">Finance</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Currency</label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">
                Tax rate (%) <span className="text-[var(--color-muted)]">(optional)</span>
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={form.taxRate}
                onChange={(e) => setForm({ ...form, taxRate: e.target.value })}
                placeholder="e.g. 15"
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
              />
            </div>
          </div>

          <div className="flex items-start gap-2 text-xs text-[var(--color-muted)] bg-[var(--color-panel-2)] rounded-lg px-3 py-2">
            <Info size={14} className="shrink-0 mt-0.5" />
            <p>
              Currency and tax rate are saved here but not yet applied to prices, invoices, or
              reports elsewhere in the app — that requires updating every price display, which is
              tracked as a follow-up.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6">
          <h2 className="font-semibold text-sm mb-1">Appearance</h2>
          <p className="text-xs text-[var(--color-muted)] mb-3">
            Theme is a per-device preference — it's saved in your browser, not tied to the business.
          </p>
          <ThemeToggle />
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6 space-y-3">
          <h2 className="font-semibold text-sm mb-1">Notification Preferences</h2>
          <p className="text-xs text-[var(--color-muted)] mb-2">
            These preferences are saved but not yet wired to actual email delivery — no email
            infrastructure is configured in this project yet.
          </p>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.notifyLowStock}
              onChange={(e) => setForm({ ...form, notifyLowStock: e.target.checked })}
              className="accent-[var(--color-accent)]"
            />
            Notify on low stock
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.notifyNewSale}
              onChange={(e) => setForm({ ...form, notifyNewSale: e.target.checked })}
              className="accent-[var(--color-accent)]"
            />
            Notify on new sale
          </label>
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-lg bg-[var(--color-accent)] text-black text-sm font-semibold px-5 py-2.5 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {mutation.isPending ? 'Saving...' : 'Save settings'}
        </button>
      </form>
    </div>
  );
}
