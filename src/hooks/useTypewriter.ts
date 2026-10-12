import { useEffect, useState } from 'react';

type Options = { enabled?: boolean; typeSpeed?: number; deleteSpeed?: number; pause?: number };

/** Сөздөрдү бирден жазып, өчүрүп, кайра жазган typewriter эффекти. */
export function useTypewriter(
  words: string[],
  { enabled = true, typeSpeed = 70, deleteSpeed = 35, pause = 1700 }: Options = {},
) {
  const [text, setText] = useState('');

  useEffect(() => {
    if (!enabled || words.length === 0) return;

    let wordIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timer: number;

    const tick = () => {
      const word = words[wordIndex];

      if (!deleting) {
        charIndex++;
        setText(word.slice(0, charIndex));
        if (charIndex === word.length) {
          deleting = true;
          timer = window.setTimeout(tick, pause); // сөз толук жазылгандан кийин тыныгуу
          return;
        }
        timer = window.setTimeout(tick, typeSpeed);
      } else {
        charIndex--;
        setText(word.slice(0, charIndex));
        if (charIndex === 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % words.length;
          timer = window.setTimeout(tick, 350);
          return;
        }
        timer = window.setTimeout(tick, deleteSpeed);
      }
    };

    timer = window.setTimeout(tick, 400);
    return () => window.clearTimeout(timer);
  }, [words, enabled, typeSpeed, deleteSpeed, pause]);

  return text;
}
