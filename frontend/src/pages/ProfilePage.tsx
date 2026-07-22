import { useState, useEffect, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile, changePassword } from '@/api/profile';
import { useAuthStore } from '@/store/authStore';
import { toast, toastErrorMessage } from '@/store/toastStore';
import { PasswordInput } from '@/components/PasswordInput';

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const updateAuthUser = useAuthStore((s) => s.updateUser);

  const { data: profile, isLoading } = useQuery({ queryKey: ['profile'], queryFn: getProfile });

  const [form, setForm] = useState({ name: '', email: '', avatarUrl: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (profile) {
      setForm({ name: profile.name, email: profile.email, avatarUrl: profile.avatarUrl ?? '' });
    }
  }, [profile]);

  const profileMutation = useMutation({
    mutationFn: () => updateProfile(form),
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
      toast.success('Password changed');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (err) => toast.error(toastErrorMessage(err, 'Failed to change password')),
  });

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

  if (isLoading || !profile) {
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
        <h1 className="text-xl font-bold">Profile</h1>
        <p className="text-sm text-[var(--color-muted)]">Manage your personal account information.</p>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6">
        <div className="flex items-center gap-4 mb-6">
          {form.avatarUrl ? (
            <img
              src={form.avatarUrl}
              alt=""
              className="w-16 h-16 rounded-full object-cover border border-[var(--color-border)]"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[var(--color-accent)] text-black flex items-center justify-center font-bold text-lg">
              {initials}
            </div>
          )}
          <div>
            <p className="font-semibold">{profile.name}</p>
            <p className="text-xs text-[var(--color-muted)]">
              {profile.role} · Member since {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Email</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">
              Avatar URL <span className="text-[var(--color-muted)]">(optional)</span>
            </label>
            <input
              value={form.avatarUrl}
              onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
              placeholder="https://example.com/photo.jpg"
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <button
            type="submit"
            disabled={profileMutation.isPending}
            className="rounded-lg bg-[var(--color-accent)] text-black text-sm font-semibold px-4 py-2.5 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {profileMutation.isPending ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>

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

          <div className="grid grid-cols-2 gap-3">
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
    </div>
  );
}
