import { useEffect } from 'react';
import { contacts } from '../data';

/**
 * Иштеп чыгуучуларга жашыруун "белектер":
 *  1. DevTools консолун ачкандарга салам жазуусу
 *  2. Колдонуучу башка өтмөккө өткөндө браузер өтмөгүнүн аталышы өзгөрөт
 */
export function useDevExtras() {
  useEffect(() => {
    console.log(
      '%c АН. ',
      'font: 800 32px Unbounded, sans-serif; color: #fff; background: linear-gradient(90deg, #22d3ee, #8b5cf6); padding: 6px 14px; border-radius: 10px;',
    );
    console.log(
      `%cСалам, dev! 👋 Кодду карап жатасызбы?\nБирге иштешели: ${contacts.email}\n\nСайтта Ctrl + K басып, терминалды ачып көрүңүз 😉`,
      'font: 14px monospace; color: #22d3ee; line-height: 1.6;',
    );

    const originalTitle = document.title;
    const onVisibility = () => {
      document.title = document.hidden ? '👋 Кайра келиңиз!' : originalTitle;
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);
}
