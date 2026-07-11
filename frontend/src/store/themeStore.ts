import { create } from 'zustand';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

function applyThemeClass(isDark: boolean) {
  document.documentElement.classList.toggle('dark', isDark);
}

// Read saved preference, fall back to system preference
const savedTheme = localStorage.getItem('abysserp-theme');
const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
const initialIsDark = savedTheme ? savedTheme === 'dark' : prefersDark;
applyThemeClass(initialIsDark);

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: initialIsDark,

  toggleTheme: () => {
    const next = !get().isDark;
    localStorage.setItem('abysserp-theme', next ? 'dark' : 'light');
    applyThemeClass(next);
    set({ isDark: next });
  },

  setTheme: (isDark) => {
    localStorage.setItem('abysserp-theme', isDark ? 'dark' : 'light');
    applyThemeClass(isDark);
    set({ isDark });
  },
}));
