import { useEffect } from 'react';

/**
 * data-reveal атрибуту бар бардык элементтерди байкап,
 * экранга киргенде "is-visible" классын кошот (CSS fade + slide анимациясы).
 * Кечиктирүү: style={{ '--d': '120ms' }}
 */
export function useScrollReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('[data-reveal]');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target); // бир жолу гана анимацияланат
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}
