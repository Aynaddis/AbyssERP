import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Info, ImagePlus, Loader2 } from 'lucide-react';
import { getProfile, updateProfile, changePassword, uploadAvatarImage } from '@/api/profile';
import { getSettings, updateSettings, uploadLogoImage } from '@/api/settings';
import { useAuthStore } from '@/store/authStore';
import { toast, toastErrorMessage } from '@/store/toastStore';
import { PasswordInput } from '@/components/PasswordInput';
import { ThemeToggle } from '@/components/ThemeToggle';

const CURRENCIES = ['ETB', 'USD', 'EUR', 'GBP'];
const MAX_IMAGE_SIZE_MB = 2;

function validateImageFile(file: File): string | null {
  if (!file.type.startsWith('image/')) return 'Please select an image file';
  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) return `Image must be ${MAX_IMAGE_SIZE_MB}MB or smaller`;
  return null;
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const updateAuthUser = useAuthStore((s) => s.updateUser);
  const isAdmin = useAuthStore((s) => s.user?.role === 'ADMIN');

  // ── Profile (all users) ──────────────────────────────────────────────
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  const [profileForm, setProfileForm] = useState({ name: '', email: '', avatarUrl: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setProfileForm({ name: profile.name, email: profile.email, avatarUrl: profile.avatarUrl ?? '' });
    }
  }, [profile]);

  const profileMutation = useMutation({
    mutationFn: () => updateProfile(profileForm),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      updateAuthUser({ name: user.name, email: user.email, avatarUrl: user.avatarUrl });
      toast.success('Profile updated');
    },
    onError: (err) => toast.error(toastErrorMessage(err, 'Failed to update profile')),
  });

  const passwordMutation = useMutation({
    mutationFn: () =>
      changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      updateAuthUser({ mustChangePassword: false });
      toast.success('Password changed');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (err) => toast.error(toastErrorMessage(err, 'Failed to change password')),
  });

  async function handleAvatarSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const error = validateImageFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    setUploadingAvatar(true);
    try {
      const avatarUrl = await uploadAvatarImage(file);
      setProfileForm((f) => ({ ...f, avatarUrl }));
    } catch (err) {
      toast.error(toastErrorMessage(err, 'Failed to upload photo'));
    } finally {
      setUploadingAvatar(false);
    }
  }

  function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    profileMutation.mutate();
  }

  function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    passwordMutation.mutate();
  }

  // ── Business settings (admin only) ───────────────────────────────────
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
    enabled: isAdmin,
  });

  const [settingsForm, setSettingsForm] = useState({
    businessName: '',
    businessLogoUrl: '',
    currency: 'ETB',
    taxRate: '',
    notifyLowStock: true,
    notifyNewSale: false,
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (settings) {
      setSettingsForm({
        businessName: settings.businessName,
        businessLogoUrl: settings.businessLogoUrl ?? '',
        currency: settings.currency,
        taxRate: settings.taxRate?.toString() ?? '',
        notifyLowStock: settings.notifyLowStock,
        notifyNewSale: settings.notifyNewSale,
      });
    }
  }, [settings]);

  const settingsMutation = useMutation({
    mutationFn: () =>
      updateSettings({
        businessName: settingsForm.businessName,
        businessLogoUrl: settingsForm.businessLogoUrl,
        currency: settingsForm.currency,
        taxRate: settingsForm.taxRate === '' ? null : Number(settingsForm.taxRate),
        notifyLowStock: settingsForm.notifyLowStock,
        notifyNewSale: settingsForm.notifyNewSale,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings saved');
    },
    onError: (err) => toast.error(toastErrorMessage(err, 'Failed to save settings')),
  });

  async function handleLogoSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const error = validateImageFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    setUploadingLogo(true);
    try {
      const businessLogoUrl = await uploadLogoImage(file);
      setSettingsForm((f) => ({ ...f, businessLogoUrl }));
    } catch (err) {
      toast.error(toastErrorMessage(err, 'Failed to upload logo'));
    } finally {
      setUploadingLogo(false);
    }
  }

  function handleSettingsSubmit(e: FormEvent) {
    e.preventDefault();
    settingsMutation.mutate();
  }

  if (profileLoading || !profile) {
    return (
      <div className="max-w-2xl">
        <div className="h-40 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] animate-pulse mb-4" />
        <div className="h-64 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] animate-pulse" />
      </div>
    );
  }

  const initials = profile.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold">Settings</h1>
        <p className="text-sm text-[var(--color-muted)]">
          {isAdmin ? 'Manage your account and business-wide configuration.' : 'Manage your personal account information.'}
        </p>
      </div>

      {profile.mustChangePassword && (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-600">
          Your account was created with a temporary password. Please set a new password below before
          continuing.
        </div>
      )}

      {/* ── Profile ─────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6">
        <h2 className="font-semibold text-sm mb-4">Profile</h2>

        <div className="flex items-center gap-4 mb-6">
          <div className="relative shrink-0">
            {uploadingAvatar ? (
              <div className="w-16 h-16 rounded-full bg-[var(--color-panel-2)] flex items-center justify-center">
                <Loader2 size={20} className="animate-spin text-[var(--color-muted)]" />
              </div>
            ) : profileForm.avatarUrl ? (
              <img
                src={profileForm.avatarUrl}
                alt=""
                className="w-16 h-16 rounded-full object-cover border border-[var(--color-border)]"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[var(--color-accent)] text-black flex items-center justify-center font-bold text-lg">
                {initials}
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold">{profile.name}</p>
            <p className="text-xs text-[var(--color-muted)] mb-2">
              {profile.role} · Member since {new Date(profile.createdAt).toLocaleDateString()}
            </p>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleAvatarSelect}
              className="hidden"
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] text-xs font-semibold px-3 py-1.5 hover:bg-[var(--color-panel-2)] disabled:opacity-50 transition-colors"
              >
                <ImagePlus size={14} />
                {uploadingAvatar ? 'Uploading...' : profileForm.avatarUrl ? 'Replace photo' : 'Upload photo'}
              </button>
              {profileForm.avatarUrl && (
                <button
                  type="button"
                  onClick={() => setProfileForm((f) => ({ ...f, avatarUrl: '' }))}
                  className="text-xs text-[var(--color-muted)] hover:text-red-500 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Name</label>
            <input
              required
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Email</label>
            <input
              required
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <button
            type="submit"
            disabled={profileMutation.isPending || uploadingAvatar}
            className="rounded-lg bg-[var(--color-accent)] text-black text-sm font-semibold px-4 py-2.5 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {profileMutation.isPending ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>

      {/* ── Password ────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6">
        <h2 className="font-semibold text-sm mb-4">Change Password</h2>

        <form onSubmit={handlePasswordSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">
              Current password
            </label>
            <PasswordInput
              required
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">
                New password
              </label>
              <PasswordInput
                required
                minLength={6}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">
                Confirm new password
              </label>
              <PasswordInput
                required
                minLength={6}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={passwordMutation.isPending}
            className="rounded-lg border border-[var(--color-border)] text-sm font-semibold px-4 py-2.5 hover:bg-[var(--color-panel-2)] transition-colors disabled:opacity-50"
          >
            {passwordMutation.isPending ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </div>

      {/* ── Appearance ──────────────────────────────────────────────── */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6">
        <h2 className="font-semibold text-sm mb-1">Appearance</h2>
        <p className="text-xs text-[var(--color-muted)] mb-3">
          Theme is a per-device preference — it's saved in your browser, not tied to the business.
        </p>
        <ThemeToggle />
      </div>

      {/* ── Business settings (admin only) ─────────────────────────── */}
      {isAdmin && (
        <>
          <div className="pt-2">
            <h2 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wide">
              Business Settings
            </h2>
          </div>

          {settingsLoading || !settings ? (
            <div className="h-96 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] animate-pulse" />
          ) : (
            <form onSubmit={handleSettingsSubmit} className="space-y-6">
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6 space-y-3">
                <h3 className="font-semibold text-sm mb-1">Business Info</h3>

                <div className="flex items-center gap-4 mb-2">
                  <div className="h-14 w-14 shrink-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] overflow-hidden flex items-center justify-center">
                    {uploadingLogo ? (
                      <Loader2 size={16} className="animate-spin text-[var(--color-muted)]" />
                    ) : settingsForm.businessLogoUrl ? (
                      <img
                        src={settingsForm.businessLogoUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImagePlus size={16} className="text-[var(--color-muted)]" />
                    )}
                  </div>
                  <div>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={handleLogoSelect}
                      className="hidden"
                    />
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        disabled={uploadingLogo}
                        className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] text-xs font-semibold px-3 py-1.5 hover:bg-[var(--color-panel-2)] disabled:opacity-50 transition-colors"
                      >
                        <ImagePlus size={14} />
                        {uploadingLogo ? 'Uploading...' : settingsForm.businessLogoUrl ? 'Replace logo' : 'Upload logo'}
                      </button>
                      {settingsForm.businessLogoUrl && (
                        <button
                          type="button"
                          onClick={() => setSettingsForm((f) => ({ ...f, businessLogoUrl: '' }))}
                          className="text-xs text-[var(--color-muted)] hover:text-red-500 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">
                    Business name
                  </label>
                  <input
                    required
                    value={settingsForm.businessName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, businessName: e.target.value })}
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6 space-y-3">
                <h3 className="font-semibold text-sm mb-1">Finance</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Currency</label>
                    <select
                      value={settingsForm.currency}
                      onChange={(e) => setSettingsForm({ ...settingsForm, currency: e.target.value })}
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
                      value={settingsForm.taxRate}
                      onChange={(e) => setSettingsForm({ ...settingsForm, taxRate: e.target.value })}
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

              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6 space-y-3">
                <h3 className="font-semibold text-sm mb-1">Notification Preferences</h3>
                <p className="text-xs text-[var(--color-muted)] mb-2">
                  These preferences are saved but not yet wired to actual email delivery for these
                  specific events.
                </p>

                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsForm.notifyLowStock}
                    onChange={(e) => setSettingsForm({ ...settingsForm, notifyLowStock: e.target.checked })}
                    className="accent-[var(--color-accent)]"
                  />
                  Notify on low stock
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsForm.notifyNewSale}
                    onChange={(e) => setSettingsForm({ ...settingsForm, notifyNewSale: e.target.checked })}
                    className="accent-[var(--color-accent)]"
                  />
                  Notify on new sale
                </label>
              </div>

              <button
                type="submit"
                disabled={settingsMutation.isPending || uploadingLogo}
                className="rounded-lg bg-[var(--color-accent)] text-black text-sm font-semibold px-5 py-2.5 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {settingsMutation.isPending ? 'Saving...' : 'Save settings'}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}