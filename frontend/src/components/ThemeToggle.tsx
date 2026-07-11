import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';

export function ThemeToggle() {
  const { isDark, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold
                 border-[var(--color-border)] text-[var(--color-muted)]
                 hover:border-[var(--color-accent)] hover:text-[var(--color-text)]
                 transition-colors"
      aria-label="Toggle dark mode"
    >
      {isDark ? <Sun size={14} /> : <Moon size={14} />}
      {isDark ? 'Light' : 'Dark'}
    </button>
  );
}
