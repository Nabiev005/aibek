import { useEffect, useState } from 'react';

/** CSS media query'ге жазылып, анын абалын кайтарат. */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [query]);

  return matches;
}

/** Колдонуучу системада анимацияларды азайтууну тандаганбы? */
export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');
