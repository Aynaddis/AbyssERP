import { useState } from 'react';
import { NavLink, Link, Outlet } from 'react-router-dom';
import { Menu, X, LogOut, User, Settings } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { navItems } from '@/lib/nav';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationBell } from '@/components/NotificationBell';

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isAdmin = user?.role === 'ADMIN';

  const visibleItems = navItems.filter(
    (item) => !item.allowedRoles || (user && item.allowedRoles.includes(user.role)),
  );

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex">
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 shrink-0 border-r border-[var(--color-border)]
                    bg-[var(--color-panel)] flex flex-col transition-transform duration-200
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <span className="font-bold text-lg">
            Abyss<span className="text-[var(--color-accent)]">ERP</span>
          </span>
          <button className="md:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                   ${
                     isActive
                       ? 'bg-[var(--color-accent)] text-black'
                       : 'text-[var(--color-muted)] hover:bg-[var(--color-panel-2)] hover:text-[var(--color-text)]'
                   }`
                }
              >
                <Icon size={16} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="px-3 py-3 border-t border-[var(--color-border)] space-y-1">
          <Link
            to="/profile"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                       text-[var(--color-muted)] hover:bg-[var(--color-panel-2)] hover:text-[var(--color-text)]
                       transition-colors"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-5 h-5 rounded-full object-cover" />
            ) : (
              <User size={16} />
            )}
            Profile
          </Link>
          {isAdmin && (
            <Link
              to="/settings"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                         text-[var(--color-muted)] hover:bg-[var(--color-panel-2)] hover:text-[var(--color-text)]
                         transition-colors"
            >
              <Settings size={16} />
              Settings
            </Link>
          )}
        </div>

        <div className="px-3 py-4 border-t border-[var(--color-border)] space-y-2">
          <div className="px-3 text-xs">
            <p className="font-medium truncate">{user?.name}</p>
            <p className="text-[var(--color-muted)]">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                       text-[var(--color-muted)] hover:bg-[var(--color-panel-2)] hover:text-[var(--color-text)]
                       transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-[var(--color-border)]">
          <button className="md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            <NotificationBell />
            <ThemeToggle />
            <Link to="/profile" aria-label="Profile" className="shrink-0">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover border border-[var(--color-border)]"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] text-black flex items-center justify-center text-xs font-bold">
                  {initials}
                </div>
              )}
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}