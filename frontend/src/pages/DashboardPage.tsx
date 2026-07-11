import { useAuthStore } from '@/store/authStore';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
        <h1 className="font-bold text-lg">
          Abyss<span className="text-[var(--color-accent)]">ERP</span>
        </h1>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <span className="text-xs text-[var(--color-muted)]">
            {user?.name} · <span className="text-[var(--color-accent)]">{user?.role}</span>
          </span>
          <button
            onClick={logout}
            className="text-xs font-semibold rounded-full border border-[var(--color-border)]
                       px-3 py-1.5 hover:border-[var(--color-accent)] transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="p-6">
        <p className="text-[var(--color-muted)] text-sm">
          Dashboard KPIs and charts land on Day 15–16. Auth + RBAC is working — you're
          logged in as <strong className="text-[var(--color-text)]">{user?.role}</strong>.
        </p>
      </main>
    </div>
  );
}
