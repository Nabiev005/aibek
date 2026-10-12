import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { navLinks } from '../data';
import type { Theme } from '../hooks/useTheme';
import { MoonIcon, SunIcon } from './Icons';

type Props = { theme: Theme; onToggleTheme: () => void; onOpenTerminal: () => void };

/** Жогорку меню: логотип, бөлүмдөргө шилтемелер, тема которуштуруучу, мобилдик меню. */
export function Navbar({ theme, onToggleTheme, onOpenTerminal }: Props) {
  const [active, setActive] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  // Скролл: меню фонун өзгөртүү + жогорудагы прогресс тилкеси
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? window.scrollY / max : 0;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${ratio})`;
      setScrolled(window.scrollY > 20);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll-spy: азыр кайсы бөлүм көрүнүп турганын аныктайт
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    navLinks.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Мобилдик меню ачык болсо — Escape менен жабуу жана скроллду бөгөттөө
  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''} ${open ? 'nav--open' : ''}`}>
      <div className="nav__progress" ref={progressRef} />
      <div className="nav__inner container">
        <a href="#home" className="nav__logo" onClick={close}>
          АН<span>.</span>
        </a>

        <nav className="nav__links" aria-label="Негизги меню">
          {navLinks.map((link, i) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={`nav__link ${active === link.id ? 'is-active' : ''}`}
              style={{ '--i': i } as CSSProperties}
              onClick={close}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="nav__actions">
          {/* Интерактивдүү терминалды ачуу */}
          <button
            className="theme-toggle term-btn"
            onClick={onOpenTerminal}
            aria-label="Терминалды ачуу (Ctrl + K)"
            title="Терминал (Ctrl + K)"
            data-magnetic
          >
            <span className="term-btn__icon">&gt;_</span>
          </button>
          <button
            data-magnetic
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Жарык режимге өтүү' : 'Караңгы режимге өтүү'}
            title={theme === 'dark' ? 'Жарык режим' : 'Караңгы режим'}
          >
            {/* key өзгөргөндө иконка кайра анимация менен чыгат */}
            <span className="theme-toggle__icon" key={theme}>
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </span>
          </button>
          <button
            className="burger"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Менюну жабуу' : 'Менюну ачуу'}
            aria-expanded={open}
          >
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
