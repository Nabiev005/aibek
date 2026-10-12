import { useCallback, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

/** Караңгы/жарык режимди башкарат жана тандоону localStorage'го сактайт. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark',
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch {
      /* жеке режимде localStorage иштебеши мүмкүн */
    }
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);

  return { theme, toggle };
}
