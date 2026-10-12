import { useEffect, useRef, useState } from 'react';

// "Шифрленген" учурда көрүнгөн символдор
const CHARS = 'абвгдежзиклмнөопрстүуфхчшыэюя0123456789<>/#$%*';
const DURATION = 900;

/**
 * "Хакер" эффекти: текст экранга киргенде туш келди символдордон
 * солдон оңго карай акырындап "чечмеленет". Бир гана жолу иштейт.
 */
export function ScrambleText({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [output, setOutput] = useState(text);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    const run = () => {
      const start = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - start) / DURATION);
        const revealed = Math.floor(p * text.length);
        let s = '';
        for (let i = 0; i < text.length; i++) {
          const ch = text[i];
          s += i < revealed || ch === ' ' ? ch : CHARS[Math.floor(Math.random() * CHARS.length)];
        }
        setOutput(s);
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          run();
          io.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [text]);

  // Экран окугучтар үчүн чыныгы текст ата-элементтин aria-label'инде
  return (
    <span ref={ref} aria-hidden="true">
      {output}
    </span>
  );
}
