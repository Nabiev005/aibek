import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { contacts, navLinks, profile, projects, skillGroups } from '../data';
import { fireConfetti } from '../lib/confetti';
import { bishkekStatus, bishkekTime } from '../lib/time';

/* ------------------------------------------------------------------
 * Интерактивдүү терминал: конок буйрук жазып, сайтты "терминалдан"
 * карай алат. Ачуу: Ctrl + K (Mac'та ⌘ + K) же менюдагы ">_" баскычы.
 * Жаңы буйрук кошуу үчүн — runCommand() ичине жаңы case кошуңуз
 * жана аны COMMANDS тизмесине жазыңыз.
 * ------------------------------------------------------------------ */

type Props = { open: boolean; onClose: () => void; onToggleTheme: () => void };
type Line = { id: number; node: ReactNode };

// Буйруктар жана алардын сүрөттөмөсү (help'те көрүнөт, Tab менен толукталат)
const COMMANDS: [string, string][] = [
  ['help', 'бардык буйруктар'],
  ['whoami', 'мен киммин'],
  ['about', 'кыскача мен жөнүндө'],
  ['skills', 'көндүмдөрүм'],
  ['projects', 'долбоорлорум'],
  ['open <n>', 'n-долбоорду ачуу'],
  ['contact', 'байланыштар'],
  ['ls', 'сайттын бөлүмдөрү'],
  ['cd <бөлүм>', 'бөлүмгө өтүү'],
  ['theme', 'караңгы/жарык режим'],
  ['time', 'Бишкекте саат канча'],
  ['clear', 'экранды тазалоо'],
  ['exit', 'терминалды жабуу'],
];

const PROMPT = (
  <>
    <span className="term__user">visitor@aibek</span>
    <span className="term__path">:~$</span>{' '}
  </>
);

const bar = (level: number) => {
  const filled = Math.round(level / 10);
  return '█'.repeat(filled) + '░'.repeat(10 - filled);
};

const WELCOME: ReactNode[] = [
  <span className="term__out--muted">Aibek OS v1.0 — интерактивдүү терминал</span>,
  <span>
    Салам! 👋 Буйруктарды көрүү үчүн <b className="term__cmd">help</b> деп жазыңыз.
  </span>,
];

export function DevTerminal({ open, onClose, onToggleTheme }: Props) {
  const idRef = useRef(0);
  const makeLines = (nodes: ReactNode[]) => nodes.map((node) => ({ id: idRef.current++, node }));

  const [lines, setLines] = useState<Line[]>(() => makeLines(WELCOME));
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Ачылганда input'ка фокус, скроллду бөгөттөө
  useEffect(() => {
    document.documentElement.classList.toggle('terminal-open', open);
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  // Жаңы сап кошулганда төмөн түшүү
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [lines]);

  /** Терминалды жаап, бөлүмгө жылуу. */
  const goTo = (id: string) => {
    onClose();
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 150);
  };

  /** Буйрукту аткарып, чыгуучу саптарды кайтарат. */
  const runCommand = (raw: string): ReactNode[] | 'clear' => {
    const [cmd = '', ...args] = raw.trim().split(/\s+/);
    const arg = args.join(' ');

    switch (cmd.toLowerCase()) {
      case '':
        return [];

      case 'help':
        return COMMANDS.map(([name, desc]) => (
          <span>
            <b className="term__cmd">{name.padEnd(12)}</b> <span className="term__out--muted">{desc}</span>
          </span>
        ));

      case 'whoami':
        return [<span className="term__out--ok">{profile.fullName}</span>, profile.roles.join(' · ')];

      case 'about':
        return [
          `📍 ${profile.city}`,
          `🏢 ${profile.studio} — негиздөөчү жана жетекчи`,
          `⏳ ${profile.experienceYears}+ жыл тажрыйба`,
          <span className="term__out--muted">Толугураак: cd about</span>,
        ];

      case 'skills':
        return skillGroups.flatMap((g) => [
          <span className="term__out--info">// {g.title}</span>,
          ...g.skills.map((s) => (
            <span>
              {s.name.padEnd(12)} <span className="term__out--ok">{bar(s.level)}</span> {s.level}%
            </span>
          )),
        ]);

      case 'projects':
        return [
          ...projects.map((p, i) => (
            <span>
              <span className="term__out--info">[{i + 1}]</span> {p.title}{' '}
              {p.link !== '#' && (
                <a href={p.link} target="_blank" rel="noreferrer" className="term__link">
                  ↗
                </a>
              )}
            </span>
          )),
          <span className="term__out--muted">Ачуу үчүн: open 1</span>,
        ];

      case 'open': {
        const project = projects[Number(arg) - 1];
        if (!project) return [<span className="term__out--err">Мындай долбоор жок. Мисалы: open 1</span>];
        if (project.link === '#') return [`${project.title} — шилтеме азырынча жок`];
        window.open(project.link, '_blank', 'noopener');
        return [<span className="term__out--ok">✓ {project.title} ачылды</span>];
      }

      case 'contact':
        return [
          <a href={`mailto:${contacts.email}`} className="term__link">📧 {contacts.email}</a>,
          <a href={contacts.telegram.url} target="_blank" rel="noreferrer" className="term__link">✈️ Telegram: {contacts.telegram.label}</a>,
          <a href={contacts.instagram.url} target="_blank" rel="noreferrer" className="term__link">📸 Instagram: {contacts.instagram.label}</a>,
          <a href={contacts.github.url} target="_blank" rel="noreferrer" className="term__link">🐙 GitHub: {contacts.github.label}</a>,
        ];

      case 'ls':
        return [
          <span className="term__out--info">{navLinks.filter((l) => l.id !== 'home').map((l) => `${l.id}/`).join('  ')}</span>,
        ];

      case 'cd': {
        const target = arg.replace(/\/$/, '') || 'home';
        const id = target === '~' || target === '..' ? 'home' : target;
        if (!navLinks.some((l) => l.id === id)) {
          return [<span className="term__out--err">cd: {target}: мындай бөлүм жок. "ls" жазып көрүңүз</span>];
        }
        goTo(id);
        return [];
      }

      case 'theme':
        onToggleTheme();
        return [<span className="term__out--ok">✓ Тема которулду</span>];

      case 'time':
      case 'date':
        return [`🕐 Бишкекте азыр ${bishkekTime()} — Айбек ${bishkekStatus()}`];

      case 'echo':
        return [arg];

      case 'sudo':
        if (arg === 'hire-aibek') {
          fireConfetti();
          setTimeout(() => goTo('contact'), 1600);
          return [
            <span className="term__out--ok">[sudo] уруксат берилди ✓</span>,
            '🎉 Эң туура чечим! Байланыш бөлүмүнө өтүп жатабыз…',
          ];
        }
        return [<span className="term__out--err">sudo: уруксат жок 😄 Аракет кылып көрүңүз: sudo hire-aibek</span>];

      case 'clear':
        return 'clear';

      case 'exit':
        onClose();
        return [];

      default:
        return [
          <span className="term__out--err">
            {cmd}: буйрук табылган жок. <b className="term__cmd">help</b> деп жазыңыз
          </span>,
        ];
    }
  };

  const submit = () => {
    const raw = input;
    setInput('');
    setHistoryIndex(-1);
    if (raw.trim()) setHistory((h) => [raw, ...h]);

    const result = runCommand(raw);
    if (result === 'clear') return setLines([]);

    const echo = (
      <span>
        {PROMPT}
        {raw}
      </span>
    );
    setLines((prev) => [...prev, ...makeLines([echo, ...result])]);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      submit();
    } else if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowUp') {
      // Мурунку буйруктар тарыхы
      e.preventDefault();
      const next = Math.min(historyIndex + 1, history.length - 1);
      if (history[next] !== undefined) {
        setHistoryIndex(next);
        setInput(history[next]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = historyIndex - 1;
      setHistoryIndex(Math.max(next, -1));
      setInput(next >= 0 ? history[next] : '');
    } else if (e.key === 'Tab') {
      // Tab менен буйрукту толуктоо
      e.preventDefault();
      const match = COMMANDS.map(([n]) => n.split(' ')[0]).find((n) => n.startsWith(input.trim()));
      if (match && input.trim()) setInput(match + ' ');
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  if (!open) return null;

  return (
    <div className="dev-terminal" role="dialog" aria-modal="true" aria-label="Интерактивдүү терминал" onClick={onClose}>
      <div className="dev-terminal__window" onClick={(e) => e.stopPropagation()}>
        <div className="term__bar">
          <span className="term__dots">
            <button aria-label="Жабуу" onClick={onClose} />
            <i />
            <i />
          </span>
          <span className="term__title">visitor@aibek — zsh</span>
          <kbd className="dev-terminal__esc">Esc</kbd>
        </div>

        <div className="term__body dev-terminal__body" ref={bodyRef} onClick={() => inputRef.current?.focus()}>
          {lines.map((line) => (
            <div key={line.id} className="term__line">
              {line.node}
            </div>
          ))}

          <label className="term__line dev-terminal__input">
            {PROMPT}
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
              aria-label="Буйрук жазыңыз"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
