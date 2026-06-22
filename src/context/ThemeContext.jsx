import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DEFAULT_ACCENT_ID, getAccentTheme } from './accentThemes';

const ThemeContext = createContext(null);

const STORAGE_KEY        = 'yokanri-theme';
const ACCENT_STORAGE_KEY = 'yokanri-accent';

function applyAccentVars(accentId, isDark) {
  const theme = getAccentTheme(accentId);
  const vars  = isDark ? theme.dark : theme.light;
  const root  = document.documentElement;
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || 'dark'; } catch { return 'dark'; }
  });

  const [accent, setAccentState] = useState(() => {
    try { return localStorage.getItem(ACCENT_STORAGE_KEY) || DEFAULT_ACCENT_ID; } catch { return DEFAULT_ACCENT_ID; }
  });

  // Aplica data-theme no <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }
  }, [theme]);

  // Aplica CSS variables do accent sempre que tema ou accent mudar
  useEffect(() => {
    applyAccentVars(accent, theme === 'dark');
  }, [accent, theme]);

  const setTheme = useCallback((newTheme) => {
    const value = newTheme === 'light' ? 'light' : 'dark';
    setThemeState(value);
    try { localStorage.setItem(STORAGE_KEY, value); } catch {}
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const setAccent = useCallback((accentId) => {
    setAccentState(accentId);
    try { localStorage.setItem(ACCENT_STORAGE_KEY, accentId); } catch {}
  }, []);

  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme, toggleTheme, accent, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
