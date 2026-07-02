import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() =>
    typeof window === 'undefined' ? 'system' : (localStorage.getItem('theme') as Theme) || 'system'
  );

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') { root.removeAttribute('data-theme'); }
    else { root.setAttribute('data-theme', theme); }
    localStorage.setItem('theme', theme);
  }, [theme]);

  return { theme, setTheme };
}
