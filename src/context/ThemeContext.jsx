import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { ACCENT_THEMES, DEFAULT_ACCENT_ID, getAccentTheme } from './accentThemes';
import { deriveAllVars, gradientString } from '../components/ThemeEditor/colorUtils';

const ThemeContext = createContext(null);

const STORAGE_KEY        = 'yokanri-theme';
const ACCENT_STORAGE_KEY = 'yokanri-accent';
const CUSTOM_THEMES_KEY  = 'yokanri-custom-themes';
const HIDDEN_IDS_KEY     = 'te-hidden-themes';

function applyVarMap(vars) {
  const root = document.documentElement;
  Object.entries(vars).forEach(([key, value]) => root.style.setProperty(key, value));
}

function applyAccentVars(accentId, isDark, customThemes = []) {
  const custom = customThemes.find(t => t.id === accentId);
  if (custom) {
    if (custom.components) {
      applyVarMap(deriveAllVars(custom.components, isDark ? 'dark' : 'light'));
      return;
    }
    const vars = isDark ? custom.dark : custom.light;
    if (vars) { applyVarMap(vars); return; }
  }
  const theme = getAccentTheme(accentId);
  const vars  = isDark ? theme.dark : theme.light;
  applyVarMap(vars);
}

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || 'dark'; } catch { return 'dark'; }
  });
  const [accent, setAccentState] = useState(() => {
    try { return localStorage.getItem(ACCENT_STORAGE_KEY) || DEFAULT_ACCENT_ID; } catch { return DEFAULT_ACCENT_ID; }
  });
  const [customThemes, setCustomThemesState] = useState(() => load(CUSTOM_THEMES_KEY, []));
  const [hiddenIds,    setHiddenIdsState]     = useState(() => load(HIDDEN_IDS_KEY,    []));

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') root.setAttribute('data-theme', 'light');
    else root.removeAttribute('data-theme');
  }, [theme]);

  useEffect(() => {
    applyAccentVars(accent, theme === 'dark', customThemes);
  }, [accent, theme, customThemes]);

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

  const setCustomThemes = useCallback((themes) => {
    setCustomThemesState(themes);
    try { localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(themes)); } catch {}
  }, []);

  const setHiddenIds = useCallback((ids) => {
    setHiddenIdsState(ids);
    try { localStorage.setItem(HIDDEN_IDS_KEY, JSON.stringify(ids)); } catch {}
  }, []);

  // Lista unificada de temas visíveis para o picker de Configurações
  const visibleThemes = useMemo(() => {
    const builtIn = ACCENT_THEMES
      .filter(t => !hiddenIds.includes(t.id))
      .map(t => {
        const ov = customThemes.find(c => c.id === t.id);
        return {
          ...t,
          gradient: ov?.gradient || (ov?.components
            ? gradientString(ov.components.logoIcon?.colors || [ov.components.base?.colors?.[0] || '#888'], ov.components.logoIcon?.angle ?? 145)
            : t.gradient),
          label: ov?.name || t.id,
        };
      });

    const pureCustom = customThemes
      .filter(t => !ACCENT_THEMES.find(b => b.id === t.id))
      .map(t => ({ ...t, label: t.name || t.id }));

    return [...builtIn, ...pureCustom];
  }, [customThemes, hiddenIds]);

  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{
      theme, isDark, setTheme, toggleTheme,
      accent, setAccent,
      customThemes, setCustomThemes,
      hiddenIds, setHiddenIds,
      visibleThemes,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
