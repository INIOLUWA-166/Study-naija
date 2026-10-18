import { User } from '../types';
import { authStorage } from '../services/api';

export type ThemeMode = 'cyber' | 'light';

const THEME_STORAGE_KEY = 'studynaija_theme_mode';

export const themeManager = {
  getThemeMode: (user?: User | null): ThemeMode => {
    if (user?.themeMode) {
      return user.themeMode;
    }
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
      if (stored === 'light' || stored === 'cyber') {
        return stored;
      }
    } catch {}
    return 'cyber';
  },

  setThemeMode: (
    mode: ThemeMode, 
    user?: User | null, 
    onUserUpdated?: (updated: User) => void
  ): ThemeMode => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {}

    themeManager.applyThemeToDom(mode);

    if (user) {
      const updatedUser: User = {
        ...user,
        themeMode: mode
      };
      authStorage.setUser(updatedUser);
      if (onUserUpdated) {
        onUserUpdated(updatedUser);
      }
    }

    // Broadcast change
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('studynaija_theme_changed', { detail: { themeMode: mode } })
      );
    }

    return mode;
  },

  applyThemeToDom: (mode: ThemeMode) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const body = document.body;

    if (mode === 'light') {
      root.classList.add('light-theme');
      body.classList.add('light-theme');
      root.classList.remove('cyber-theme');
      body.classList.remove('cyber-theme');
      root.setAttribute('data-theme', 'light');
    } else {
      root.classList.remove('light-theme');
      body.classList.remove('light-theme');
      root.classList.add('cyber-theme');
      body.classList.add('cyber-theme');
      root.setAttribute('data-theme', 'cyber');
    }
  }
};
