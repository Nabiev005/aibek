import { useEffect, useRef } from 'react';

/**
 * Чычкан менен үстүнө келгенде элементти 3D бурат (tilt эффекти).
 * CSS өзгөрмөлөрүн коёт: --rx, --ry (бурулуш) жана --gx, --gy (жылтырак позициясы).
 * Сенсордук экрандарда жана reduced-motion режиминде өчүк.
 */
export function useTilt<T extends HTMLElement>(maxDeg = 10) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const canTilt = window.matchMedia(
      '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
    ).matches;
    if (!canTilt) return;

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width; // 0..1
      const y = (e.clientY - rect.top) / rect.height; // 0..1
      el.style.setProperty('--rx', `${(0.5 - y) * maxDeg * 2}deg`);
      el.style.setProperty('--ry', `${(x - 0.5) * maxDeg * 2}deg`);
      el.style.setProperty('--gx', `${x * 100}%`);
      el.style.setProperty('--gy', `${y * 100}%`);
      el.classList.add('is-tilting');
    };

    const onLeave = () => {
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
      el.classList.remove('is-tilting');
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [maxDeg]);

  return ref;
}
