import { useState, useEffect } from 'react';

export const useTheme = () => {
  // Siempre iniciar con 'light' para que el servidor y el cliente
  // rendericen el mismo HTML inicial (evita hydration mismatch).
  const [theme, setTheme] = useState<string>('light');
  const [mounted, setMounted] = useState(false);

  // Leer la preferencia guardada solo después de montar en el cliente.
  useEffect(() => {
    const stored = localStorage.getItem('buco-theme') || 'dark';
    setTheme(stored);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    }
    localStorage.setItem('buco-theme', theme);
  }, [theme, mounted]);

  return { theme, setTheme };
};
