import { useEffect, useRef, useState } from 'react';

/* ------------------------------------------------------------------
 * Hero'догу монитор: код редакторунда сиздин маалыматыңыз
 * TypeScript коду катары тамгалап жазылат, бүткөндө кайра башталат.
 * Монитор чычканды ээрчип 3D бурулат (компьютерде гана).
 * ------------------------------------------------------------------ */

// Синтаксис түстөрү: kw — ачкыч сөз, str — сап, prop — касиет,
// fn — функция, tag — JSX тег, cm — комментарий, p — кадимки текст
type Token = [text: string, kind: 'kw' | 'str' | 'prop' | 'fn' | 'tag' | 'cm' | 'p'];

// Монитордо жазылуучу код — каалагандай өзгөртсөңүз болот
const CODE: Token[][] = [
  [['// Aibek.tsx — салам, дүйнө! 👋', 'cm']],
  [['const ', 'kw'], ['developer', 'fn'], [' = {', 'p']],
  [['  name', 'prop'], [': ', 'p'], ["'Набиев Айбек'", 'str'], [',', 'p']],
  [['  role', 'prop'], [': [', 'p'], ["'Fullstack'", 'str'], [', ', 'p'], ["'Frontend Backend'", 'str'], ['],', 'p']],
  [['  city', 'prop'], [': ', 'p'], ["'Бишкек'", 'str'], [',', 'p']],
  [['  stack', 'prop'], [': [', 'p'], ["'React'", 'str'], [', ', 'p'], ["'TypeScript'", 'str'], [',', 'p']],
  [['          ', 'p'], ["'Python'", 'str'], [', ', 'p'], ["'Figma'", 'str'], ['],', 'p']],
  [['  studio', 'prop'], [': ', 'p'], ["'ainabi.studio'", 'str'], [',', 'p']],
  [['};', 'p']],
  [['', 'p']],
  [['export default function ', 'kw'], ['Hire', 'fn'], ['() {', 'p']],
  [['  return ', 'kw'], ['<', 'p'], ['Project', 'tag'], [' with', 'prop'], ['={developer} />', 'p'], [';', 'p']],
  [['}', 'p']],
];

const CHAR_MS = 38; // бир тамганы жазуу ылдамдыгы
const PAUSE_MS = 3200; // код толук жазылгандан кийинки тыныгуу

// Ар бир саптын узундугу (+1 — сап которуу үчүн)
const LINE_LENGTHS = CODE.map((line) => line.reduce((n, [text]) => n + [...text].length, 0) + 1);
const TOTAL = LINE_LENGTHS.reduce((a, b) => a + b, 0);

type Props = { reduced: boolean; started: boolean };

export function HeroMonitor({ reduced, started }: Props) {
  const [count, setCount] = useState(reduced ? TOTAL : 0);
  const monitorRef = useRef<HTMLDivElement>(null);

  // Тамгалап жазуу цикли: жазат → тыныгуу → тазалап кайра баштайт
  useEffect(() => {
    if (reduced || !started) return;
    let timer = 0;
    let n = 0;
    const tick = () => {
      n++;
      setCount(n);
      if (n >= TOTAL) {
        timer = window.setTimeout(() => {
          n = 0;
          setCount(0);
          timer = window.setTimeout(tick, 500);
        }, PAUSE_MS);
        return;
      }
      // Боштуктарды тезирээк "жазабыз" — табигый көрүнөт
      timer = window.setTimeout(tick, CHAR_MS * (Math.random() * 0.8 + 0.6));
    };
    timer = window.setTimeout(tick, 600);
    return () => window.clearTimeout(timer);
  }, [reduced, started]);

  // Чычканга жараша 3D бурулуу (--mx, --my: -1..1)
  useEffect(() => {
    const el = monitorRef.current;
    if (!el || reduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const onMove = (e: PointerEvent) => {
      el.style.setProperty('--mx', ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3));
      el.style.setProperty('--my', ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3));
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduced]);

  // Кайсы саптар жана канча тамга көрүнөрүн эсептейбиз
  let budget = count;
  let caretLine = 0;
  const rendered = CODE.map((line, li) => {
    if (budget <= 0) return null;
    caretLine = li;
    const tokens = line.map(([text, kind], ti) => {
      const chars = [...text];
      const shown = chars.slice(0, Math.max(0, budget)).join('');
      budget -= chars.length;
      return shown ? (
        <span key={ti} className={`code--${kind}`}>
          {shown}
        </span>
      ) : null;
    });
    budget -= 1; // сап которуу
    return tokens;
  });

  const typing = count < TOTAL;

  return (
    <div className="hero-monitor" aria-hidden="true">
      <div className="hero-monitor__inner" ref={monitorRef}>
        <div className="monitor__screen hero-monitor__screen">
          {/* Редактордун башы: баскычтар + файлдын өтмөгү */}
          <div className="term__bar">
            <span className="term__dots">
              <i />
              <i />
              <i />
            </span>
            <span className="hero-monitor__tab">Aibek.tsx</span>
          </div>

          <div className="hero-monitor__code">
            {CODE.map((_, li) =>
              rendered[li] !== null ? (
                <div key={li} className="hero-monitor__line">
                  <span className="hero-monitor__num">{li + 1}</span>
                  <span>
                    {rendered[li]}
                    {li === caretLine && <span className={`term__caret ${typing ? 'is-typing' : ''}`} />}
                  </span>
                </div>
              ) : null,
            )}
          </div>

          {/* Төмөнкү статус тилкеси */}
          <div className="hero-monitor__status">
            <span>{typing ? '● жазылууда…' : '✓ компиляцияланды'}</span>
            <span>TypeScript React · UTF-8</span>
          </div>
        </div>
        <div className="monitor__neck" />
        <div className="monitor__base" />
      </div>
    </div>
  );
}
