import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type ThemeChoice = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: ThemeChoice;
  resolved: 'light' | 'dark';
  setTheme: (t: ThemeChoice) => void;
  toggle: () => void;
}

const STORAGE_KEY = 'sickagent-theme';

function getSystemPreference(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolve(choice: ThemeChoice): 'light' | 'dark' {
  return choice === 'system' ? getSystemPreference() : choice;
}

function applyTheme(resolved: 'light' | 'dark') {
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', resolved === 'dark' ? '#09090b' : '#ffffff');
  }
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: 'system',
  resolved: 'dark',
  setTheme: () => {},
  toggle: () => {},
});

export function useThemeProvider() {
  const [theme, setThemeState] = useState<ThemeChoice>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeChoice | null;
    return stored && ['light', 'dark', 'system'].includes(stored) ? stored : 'system';
  });

  const [resolved, setResolved] = useState<'light' | 'dark'>(() => resolve(theme));

  const setTheme = useCallback((t: ThemeChoice) => {
    localStorage.setItem(STORAGE_KEY, t);
    setThemeState(t);
    const r = resolve(t);
    setResolved(r);
    applyTheme(r);
  }, []);

  const toggle = useCallback(() => {
    const next = resolved === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }, [resolved, setTheme]);

  // Listen for system preference changes
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const r = getSystemPreference();
      setResolved(r);
      applyTheme(r);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  // Apply on mount
  useEffect(() => {
    applyTheme(resolved);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { theme, resolved, setTheme, toggle } satisfies ThemeContextValue;
}

export function useTheme() {
  return useContext(ThemeContext);
}
