'use client';
import { useState, useEffect, useCallback } from 'react';

export type ThemeChoice = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'acme:theme';

function applyTheme(choice: ThemeChoice) {
  const root = document.documentElement;
  if (choice === 'system') { root.removeAttribute('data-theme'); }
  else { root.setAttribute('data-theme', choice); }
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeChoice>('system');

  // Hydrate from localStorage once mounted (SSR guard)
  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as ThemeChoice) ?? 'system';
    setThemeState(stored);
    applyTheme(stored);
  }, []);

  const setTheme = useCallback((next: ThemeChoice) => {
    setThemeState(next);
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }, []);

  return { theme, setTheme };
}