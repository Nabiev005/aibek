import { useEffect } from 'react';

/**
 * data-magnetic атрибуту бар элементтер чычканга "тартылат".
 * CSS'тин өзүнчө `translate` касиети колдонулат — ошондуктан hover'дагы
 * `transform` анимациялары менен кагылышпайт.
 */
export function useMagnetic(strength = 0.3) {
  useEffect(() => {
    const canUse = window.matchMedia(
      '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
    ).matches;
    if (!canUse) return;

    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-magnetic]'));

    const cleanups = elements.map((el) => {
      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        el.style.translate = `${x * strength}px ${y * strength * 1.3}px`;
      };
      const onLeave = () => {
        el.style.translate = '';
      };
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerleave', onLeave);
      return () => {
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerleave', onLeave);
      };
    });

    return () => cleanups.forEach((fn) => fn());
  }, [strength]);
}
