import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const DARK_KEY = 'wl_dark_mode';

// All dark-mode CSS custom property overrides
const DARK_VARS: Record<string, string> = {
  '--color-bg': '#1c1c1c',
  '--color-surface': '#262626',
  '--color-border': 'rgba(255, 255, 255, 0.12)',
  '--color-border-strong': 'rgba(255, 255, 255, 0.3)',
  '--color-text': '#f0f0f0',
  '--color-text-muted': '#999999',
};

// Inline styles on :root override ANY stylesheet rule — guaranteed to work
function applyTheme(dark: boolean) {
  const el = document.documentElement;
  if (dark) {
    Object.entries(DARK_VARS).forEach(([k, v]) => el.style.setProperty(k, v));
  } else {
    Object.keys(DARK_VARS).forEach((k) => el.style.removeProperty(k));
  }
}

interface DarkModeContextValue {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const DarkModeContext = createContext<DarkModeContextValue>({
  darkMode: false,
  toggleDarkMode: () => {},
});

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(DARK_KEY);
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    applyTheme(darkMode);
    localStorage.setItem(DARK_KEY, String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((d) => !d);

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export const useDarkMode = () => useContext(DarkModeContext);
