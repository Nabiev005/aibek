import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

/* ------------------------------------------------------------------
 * Жүктөө экраны: монитор чыгат → терминалда буйруктар жазылат →
 * монитор чоңоюп (zoom) портфолиого "кирет".
 *
 * 😈 ПРАНК (биринчи кирүүдө):
 *   1. Монитордо "хакердик чабуул" + конокко өзүнүн түзмөк маалыматы
 *   2. Бүт экранды "басып алуу": баш сөөк, артка санак, "өчүрүлгөн" файлдар
 *   3. Windows'тун "көк экраны" (BSOD)
 *   4. Караңгылык → терминалда тамгалап: "aibek — хакер эмес, жөн гана тамашакөй программист 😄"
 * Баары зыянсыз: эч нерсе өчүрүлбөйт, эч бир маалымат эч жакка жөнөтүлбөйт.
 *  - Ар бир кирүүдө, бардык коноктор үчүн көрсөтүлөт.
 *  - prefers-reduced-motion күйүк болсо — пранк жок (жылтылдоо зыян болушу мүмкүн).
 *  - Жашыруун "авариялык чыгуу": Esc баскычы.
 * ------------------------------------------------------------------ */

type Props = { reduced: boolean; onDone: () => void };

type Tone = 'ok' | 'info' | 'muted' | 'danger' | 'warn';
type Step = (
  | { kind: 'cmd'; text: string; hacker?: boolean } // буйрук (тамгалап жазылат)
  | { kind: 'out'; text: string; tone: Tone; typed?: boolean } // терминалдын жообу (typed — тамгалап жазылат)
  | { kind: 'progress'; label: string; tone?: Tone } // прогресс тилкеси
  | { kind: 'pause'; ms: number } // драмалык тыныгуу
  | { kind: 'takeover'; ms: number } // бүт экранды "басып алуу"
  | { kind: 'bsod'; ms: number } // көк экран
  | { kind: 'blackout'; ms: number } // караңгылык
  | { kind: 'clear' } // экранды тазалоо (пранк бүттү — монитор кадимки абалга кайтат)
) & { hack?: boolean }; // hack: true — монитор "чабуул" абалында

/* ---------- Конок жөнүндө маалымат (браузер берген, эч жакка жөнөтүлбөйт) ---------- */

// Пранкта көрсөтүлүүчү жайгашкан жер жана тил
const PRANK_LOCATION = 'Кыргызстан';
const PRANK_LANGUAGE = 'Кыргызча';

type DeviceInfo = { os: string; browser: string; screen: string; cores: string };

function getDeviceInfo(): DeviceInfo {
  const ua = navigator.userAgent;
  const os = /Windows/.test(ua)
    ? 'Windows'
    : /Android/.test(ua)
      ? 'Android'
      : /iPhone|iPad/.test(ua)
        ? 'iOS'
        : /Mac/.test(ua)
          ? 'macOS'
          : /Linux/.test(ua)
            ? 'Linux'
            : 'Белгисиз';
  const browser = /Edg\//.test(ua)
    ? 'Edge'
    : /OPR\//.test(ua)
      ? 'Opera'
      : /Chrome\//.test(ua)
        ? 'Chrome'
        : /Firefox\//.test(ua)
          ? 'Firefox'
          : /Safari\//.test(ua)
            ? 'Safari'
            : 'Браузер';
  return {
    os,
    browser,
    screen: `${window.screen.width}×${window.screen.height}`,
    cores: String(navigator.hardwareConcurrency || '?'),
  };
}

/** "Өчүрүлүп жаткан" күлкүлүү файлдар (системага жараша жол). */
function fakeFiles(os: string) {
  const root = os === 'Windows' ? 'C:/Users/Сиз/' : os === 'Android' ? '/sdcard/' : '/Users/siz/';
  return [
    'Documents/диплом_АКЫРКЫ_v7_чыныгы.docx',
    'Pictures/2016_уялчаак_сүрөттөр/',
    'Desktop/Жаңы папка (14)/',
    'Documents/сырсөздөр.txt',
    'Games/Dota2/',
    'Downloads/курстук_иш_көчүрмө.pdf',
    'Music/Ностальгия_2010.mp3',
    'Desktop/резюме_FINAL_final2.pdf',
    'Pictures/селфи/',
    'Documents/кыялдарым.txt',
    'Videos/той_2019.mp4',
    'Documents/бюджет_2025.xlsx',
  ].map((f) => root + f);
}

/* ---------- Сценарийлер — тексттерди ушул жерден өзгөртсөңүз болот ---------- */

const INTRO: Step[] = [
  { kind: 'out', text: '# Набиев Айбек · Fullstack / UI/UX дизайнер', tone: 'muted' },
  { kind: 'cmd', text: 'cd ~/aibek-portfolio' },
  { kind: 'cmd', text: 'npm install' },
  { kind: 'out', text: '✓ 128 пакет орнотулду', tone: 'ok' },
  { kind: 'cmd', text: 'npm run build' },
  { kind: 'progress', label: 'Компиляция' },
];

const OUTRO: Step[] = [
  { kind: 'cmd', text: 'npm run dev' },
  { kind: 'out', text: '➜ Портфолио ачылууда…', tone: 'info' },
];

// Кадимки сценарий (кайра келгендерге)
const NORMAL_SCRIPT: Step[] = [...INTRO, { kind: 'out', text: '✓ Ийгиликтүү даярдалды', tone: 'ok' }, ...OUTRO];

const TAKEOVER_MS = 6000;
const COUNTDOWN_FROM = 5;

// Пранк сценарийи (биринчи кирүүдө)
function makePrankScript(d: DeviceInfo): Step[] {
  return [
    ...INTRO,
    { kind: 'out', text: '⚠ ЭСКЕРТҮҮ: белгисиз туташуу аныкталды!', tone: 'danger', hack: true },
    { kind: 'pause', ms: 450, hack: true },
    { kind: 'out', text: '💀 СИСТЕМАГА ХАКЕРДИК ЧАБУУЛ!', tone: 'danger', hack: true },
    { kind: 'cmd', text: 'sudo hack --target=visitor --mode=evil', hacker: true, hack: true },
    { kind: 'progress', label: 'Түзмөккө кирүү', tone: 'danger', hack: true },
    { kind: 'out', text: `🖥  Түзмөк табылды: ${d.os} · ${d.browser} · ${d.cores} ядро`, tone: 'warn', hack: true },
    { kind: 'out', text: `📐 Экран: ${d.screen}`, tone: 'warn', hack: true },
    { kind: 'out', text: `📍 Жайгашкан жер: ${PRANK_LOCATION}`, tone: 'warn', hack: true },
    { kind: 'out', text: '🔓 Сырсөз табылды: qwerty123', tone: 'warn', hack: true },
    { kind: 'cmd', text: 'rm -rf --no-preserve-root /visitor/*', hacker: true, hack: true },
    { kind: 'pause', ms: 500, hack: true },
    { kind: 'takeover', ms: TAKEOVER_MS, hack: true },
    { kind: 'bsod', ms: 2900, hack: true },
    { kind: 'blackout', ms: 900, hack: true },
    // Пранк бүттү: экран тазаланып, Айбек терминалда өзү "түшүндүрөт"
    { kind: 'clear' },
    { kind: 'pause', ms: 400 },
    { kind: 'cmd', text: 'whoami' },
    { kind: 'out', text: 'aibek — хакер эмес, жөн гана тамашакөй программист 😄', tone: 'info', typed: true },
    { kind: 'cmd', text: 'hack --undo --all' },
    { kind: 'progress', label: 'Калыбына келтирүү', tone: 'ok' },
    { kind: 'out', text: '✓ Бардык файлдар ордунда — бир дагы файл өчүрүлгөн жок', tone: 'ok', typed: true },
    { kind: 'out', text: '✓ Маалыматтар эч жакка жөнөтүлгөн жок, баары браузериңизде калды', tone: 'ok', typed: true },
    { kind: 'out', text: '🎉 Пранк ийгиликтүү аяктады. Эми чыныгы портфолиону көрөлү!', tone: 'warn', typed: true },
    { kind: 'pause', ms: 900 },
    ...OUTRO,
  ];
}

/* ---------- Убакыттар (миллисекунд) ---------- */
const BOOT_MS = 750; // монитордун чыгышы
const CHAR_MS = 32; // бир тамганы жазуу
const CMD_PAUSE = 200; // буйруктан кийинки тыныгуу
const OUT_MS = 280; // жооп сабы
const PROGRESS_MS = 950; // прогресс тилкеси
const TYPE_MS = 24; // жооп сабын тамгалап жазуу (typed: true)
const TYPED_PAUSE = 300; // тамгалап жазылган саптан кийинки тыныгуу
const END_PAUSE = 500; // аягындагы тыныгуу
const ZOOM_MS = 900; // монитордун чоңоюп кетиши


type Timed = Step & { start: number; end: number };

/** Сценарийдин ар бир кадамына башталуу/бүтүү убактысын эсептейт. */
function buildTimeline(script: Step[]) {
  let t = BOOT_MS;
  const steps = script.map((step) => {
    const duration =
      step.kind === 'cmd'
        ? step.text.length * CHAR_MS + CMD_PAUSE
        : step.kind === 'out'
          ? step.typed
            ? [...step.text].length * TYPE_MS + TYPED_PAUSE
            : OUT_MS
          : step.kind === 'progress'
            ? PROGRESS_MS
            : step.kind === 'clear'
              ? 0
              : step.ms;
    const timed = { ...step, start: t, end: t + duration } as Timed;
    t += duration;
    return timed;
  });
  return { steps, total: t + END_PAUSE };
}

/** Пранк ар дайым көрсөтүлөт — анимацияны азайтуу режиминен башка учурда. */
const shouldPrank = (reduced: boolean) => !reduced;

// Баш сөөк (ASCII)
const SKULL = [
  '      ______',
  '   .-"      "-.',
  '  /            \\',
  ' |              |',
  ' |,  .-.  .-.  ,|',
  ' | )(__/  \\__)( |',
  ' |/     /\\     \\|',
  ' (_     ^^     _)',
  '  \\__|IIIIII|__/',
  '   | \\IIIIII/ |',
  '   \\          /',
  "    `--------'",
].join('\n');

const BAR_CELLS = 22;

export function Loader({ reduced, onDone }: Props) {
  const [prank] = useState(() => shouldPrank(reduced));
  const [device] = useState(getDeviceInfo);
  const timeline = useMemo(
    () => buildTimeline(prank ? makePrankScript(device) : NORMAL_SCRIPT),
    [prank, device],
  );

  const [elapsed, setElapsed] = useState(reduced ? timeline.total : 0);
  const [leaving, setLeaving] = useState(false);
  const [removed, setRemoved] = useState(false);
  const onDoneRef = useRef(onDone);
  const skipRef = useRef(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const { steps, total } = timeline;

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    let timer = 0;
    let finished = false;

    // Анимация бүттү: zoom башталат, сайт ачылат
    const finish = () => {
      if (finished) return;
      finished = true;
      setElapsed(total);
      setLeaving(true);
      onDoneRef.current();
      timer = window.setTimeout(() => setRemoved(true), reduced ? 50 : ZOOM_MS);
    };

    // Анимацияны азайтуу режими — терминал дароо толук көрүнөт
    if (reduced) {
      timer = window.setTimeout(finish, 600);
      return () => window.clearTimeout(timer);
    }

    const tick = (now: number) => {
      const t = now - start;
      if (skipRef.current || t >= total) {
        finish();
        return;
      }
      setElapsed(t);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') skipRef.current = true; // жашыруун авариялык чыгуу
    };
    window.addEventListener('keydown', onKey);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      window.removeEventListener('keydown', onKey);
    };
  }, [reduced, prank, total]);

  // Учурдагы толук экрандуу фаза (takeover / bsod / blackout) же жок
  const current = steps.find((s) => elapsed >= s.start && elapsed < s.end);
  const overlay =
    current && (current.kind === 'takeover' || current.kind === 'bsod' || current.kind === 'blackout')
      ? current
      : null;

  // Өтмөктүн аталышы да "коркутат" 😈 — аягында кайра калыбына келет
  const takeoverActive = overlay?.kind === 'takeover';
  useEffect(() => {
    if (!takeoverActive) return;
    const original = document.title;
    let on = false;
    const id = window.setInterval(() => {
      on = !on;
      document.title = on ? '⚠ VIRUS DETECTED!' : '💀 YOU HAVE BEEN HACKED';
    }, 500);
    return () => {
      window.clearInterval(id);
      document.title = original;
    };
  }, [takeoverActive]);

  // Саптар экранга батпай калса — терминал өзү төмөн жылат
  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  });

  if (removed) return null;

  const percent = Math.min(100, Math.round((elapsed / total) * 100));

  // Монитордун абалы: чабуул жүрүп жатабы же экран тазаландыбы
  const hackStart = steps.find((s) => s.hack)?.start ?? Infinity;
  const clearIndex = steps.findIndex((s) => s.kind === 'clear');
  const clearStart = clearIndex >= 0 ? steps[clearIndex].start : Infinity;
  const hacked = elapsed >= hackStart && elapsed < clearStart;
  const cleared = elapsed >= clearStart;

  // Экран тазалангандан кийин — андан кийинки саптар гана көрүнөт
  const visible = steps
    .map((s, i) => ({ s, i }))
    .filter(({ s, i }) => elapsed >= s.start && (!cleared || i > clearIndex));
  const allDone = elapsed >= steps[steps.length - 1].end;

  const title = hacked ? 'root@h4ck3r — ⚠ СИСТЕМА БУЗУЛДУ' : `aibek@ainabi — zsh — ${percent}%`;

  return (
    <div
      className={`loader ${leaving ? 'loader--leaving' : ''} ${hacked ? 'loader--hacked' : ''} ${overlay ? 'loader--overlay' : ''}`}
      role="status"
      aria-label={`Жүктөлүүдө ${percent}%`}
    >
      <div className="loader__glow" aria-hidden="true" />
      {hacked && !overlay && <div className="loader__flash" aria-hidden="true" />}

      <div className="monitor" aria-hidden="true">
        <div className="monitor__screen">
          {/* Терминал терезесинин башы */}
          <div className="term__bar">
            <span className="term__dots">
              <i />
              <i />
              <i />
            </span>
            <span className="term__title">{title}</span>
          </div>

          <div className={`term__body ${cleared ? 'term__body--finale' : ''}`} ref={bodyRef}>
            {visible.map(({ s: step, i }) => {
              const active = elapsed < step.end;

              if (step.kind === 'cmd') {
                const chars = Math.min(step.text.length, Math.floor((elapsed - step.start) / CHAR_MS));
                return (
                  <div key={i} className="term__line">
                    {step.hacker ? (
                      <>
                        <span className="term__user term__user--hacker">root@h4ck3r</span>
                        <span className="term__path">:~#</span>{' '}
                      </>
                    ) : (
                      <>
                        <span className="term__user">aibek@ainabi</span>
                        <span className="term__path">:~$</span>{' '}
                      </>
                    )}
                    <span>{step.text.slice(0, chars)}</span>
                    {active && <span className="term__caret" />}
                  </div>
                );
              }

              if (step.kind === 'progress') {
                const p = Math.min(1, (elapsed - step.start) / PROGRESS_MS);
                const filled = Math.round(p * BAR_CELLS);
                return (
                  <div key={i} className={`term__line term__out term__out--${step.tone ?? 'info'}`}>
                    {step.label} [{'█'.repeat(filled)}
                    <span className="term__bar-empty">{'░'.repeat(BAR_CELLS - filled)}</span>] {Math.round(p * 100)}%
                  </div>
                );
              }

              if (step.kind !== 'out') return null;

              // Тамгалап жазылуучу жооп (эмодзилер бузулбашы үчүн [...text])
              if (step.typed) {
                const chars = [...step.text];
                const shown = Math.min(chars.length, Math.floor((elapsed - step.start) / TYPE_MS));
                return (
                  <div key={i} className={`term__line term__out term__out--${step.tone}`}>
                    {chars.slice(0, shown).join('')}
                    {active && <span className="term__caret" />}
                  </div>
                );
              }

              return (
                <div key={i} className={`term__line term__out term__out--${step.tone}`}>
                  {step.text}
                </div>
              );
            })}

            {/* Бардык буйруктар бүткөндө — жаңы бош сап */}
            {allDone && (
              <div className="term__line">
                <span className="term__user">aibek@ainabi</span>
                <span className="term__path">:~$</span> <span className="term__caret" />
              </div>
            )}
          </div>
        </div>
        <div className="monitor__neck" />
        <div className="monitor__base" />
      </div>

      {/* ---------- 💀 Бүт экранды "басып алуу" ---------- */}
      {overlay?.kind === 'takeover' && (
        <Takeover elapsed={elapsed - overlay.start} device={device} />
      )}

      {/* ---------- 🟦 Көк экран ---------- */}
      {overlay?.kind === 'bsod' && <Bsod progress={(elapsed - overlay.start) / overlay.ms} />}

      {/* ---------- ⬛ Караңгылык ---------- */}
      {overlay?.kind === 'blackout' && <div className="prank-blackout" aria-hidden="true" />}

      <div className="loader__footer">
        <div className="loader__bar">
          <span style={{ transform: `scaleX(${percent / 100})` }} />
        </div>
      </div>
    </div>
  );
}

/** Толук экрандуу "чабуул": баш сөөк, артка санак, түзмөк маалыматы, өчүрүлгөн файлдар. */
function Takeover({ elapsed, device }: { elapsed: number; device: DeviceInfo }) {
  const files = useMemo(() => fakeFiles(device.os), [device.os]);
  const count = Math.max(0, COUNTDOWN_FROM - Math.floor(elapsed / ((TAKEOVER_MS - 800) / COUNTDOWN_FROM)));

  return (
    <div className="prank-takeover" aria-hidden="true">
      {/* Фондо агып жаткан "өчүрүлгөн" файлдар */}
      <div className="prank-files">
        {[...files, ...files, ...files, ...files].map((f, i) => (
          <div key={i}>
            <span className="prank-files__x">✖ ӨЧҮРҮЛДҮ</span> {f}
          </div>
        ))}
      </div>

      <div className="prank-center">
        <pre className="prank-skull">{SKULL}</pre>
        <h2 className="prank-title" data-text="YOU HAVE BEEN HACKED">
          YOU HAVE BEEN HACKED
        </h2>

        <div className="prank-info">
          <span>Система</span>
          <b>
            {device.os} · {device.browser}
          </b>
          <span>Экран</span>
          <b>{device.screen}</b>
          <span>Жайгашкан жер</span>
          <b>{PRANK_LOCATION}</b>
          <span>Тил</span>
          <b>{PRANK_LANGUAGE}</b>
        </div>

        <p className="prank-count-label">{count > 0 ? 'Бардык файлдар өчүрүлөт:' : 'ӨЧҮРҮЛҮҮДӨ…'}</p>
        <div className="prank-count" key={count}>
          {count}
        </div>
      </div>
    </div>
  );
}

/** Windows'тун атактуу "көк экраны" — кыргызча 🙂 */
function Bsod({ progress }: { progress: number }) {
  const pct = Math.min(100, Math.round(progress * 130));
  return (
    <div className="prank-bsod" aria-hidden="true">
      <div className="prank-bsod__face">:(</div>
      <p>
        Компьютериңизде көйгөй чыкты жана аны өчүрүп-күйгүзүү керек. Биз ката маалыматын чогултуп жатабыз, анан сиз үчүн
        кайра күйгүзөбүз.
      </p>
      <p className="prank-bsod__pct">{pct}% аткарылды</p>
      <div className="prank-bsod__row">
        <div className="prank-bsod__qr" />
        <small>
          Көбүрөөк маалымат алгыңыз келсе, кийинчерээк бул катаны интернеттен издеңиз:
          <br />
          Токтотуу коду: AIBEK_PORTFOLIO_TOO_COOL
        </small>
      </div>
    </div>
  );
}
