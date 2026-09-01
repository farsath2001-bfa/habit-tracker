import { useCallback, useEffect, useState } from 'react';

/**
 * Manages the light/dark theme class on <html>, persisted to localStorage.
 * index.html applies the initial class before paint to avoid a flash;
 * this hook keeps React state and the DOM class in sync afterward.
 */
export default function useTheme() {
  const [theme, setThemeState] = useState(() => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored === 'dark' || stored === 'light') return stored;
    } catch (e) {
      // ignore
    }
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      // ignore
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, setTheme: setThemeState, toggleTheme };
}
