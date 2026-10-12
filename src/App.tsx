import { useCallback, useEffect, useState } from 'react';
import { About } from './components/About';
import { BackgroundFX } from './components/BackgroundFX';
import { DevTerminal } from './components/DevTerminal';
import { Contact } from './components/Contact';
import { Cursor } from './components/Cursor';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { Loader } from './components/Loader';
import { Navbar } from './components/Navbar';
import { Projects } from './components/Projects';
import { Skills } from './components/Skills';
import { Timeline } from './components/Timeline';
import { useReducedMotion } from './hooks/useMediaQuery';
import { useDevExtras } from './hooks/useDevExtras';
import { useMagnetic } from './hooks/useMagnetic';
import { useScrollReveal } from './hooks/useScrollReveal';
import { useTheme } from './hooks/useTheme';

export default function App() {
  const { theme, toggle } = useTheme();
  const reduced = useReducedMotion();
  const [loaded, setLoaded] = useState(false);
  const handleLoaded = useCallback(() => setLoaded(true), []);

  const [terminalOpen, setTerminalOpen] = useState(false);
  const openTerminal = useCallback(() => setTerminalOpen(true), []);
  const closeTerminal = useCallback(() => setTerminalOpen(false), []);

  // Скролл кылганда бөлүмдөрдүн жумшак чыгышы
  useScrollReveal();
  // Баскычтардын чычканга тартылышы
  useMagnetic();
  // Консолдогу салам жана өтмөктүн аталышы
  useDevExtras();

  // Ctrl + K (Mac: ⌘ + K) — терминалды ачуу/жабуу
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setTerminalOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Жүктөө учурунда барактын скроллун бөгөттөйбүз
  useEffect(() => {
    document.documentElement.classList.toggle('is-loading', !loaded);
  }, [loaded]);

  return (
    <>
      {/* Интерактивдүү фон: аврора шейдери + чекит-торчо */}
      <BackgroundFX theme={theme} reduced={reduced} />
      <Loader reduced={reduced} onDone={handleLoaded} />
      <Cursor />
      <Navbar theme={theme} onToggleTheme={toggle} onOpenTerminal={openTerminal} />
      <DevTerminal open={terminalOpen} onClose={closeTerminal} onToggleTheme={toggle} />

      <main>
        <Hero theme={theme} reduced={reduced} started={loaded} onOpenTerminal={openTerminal} />
        <About theme={theme} reduced={reduced} />
        <Skills />
        <Projects />
        <Timeline />
        <Contact theme={theme} reduced={reduced} />
      </main>

      <Footer />
    </>
  );
}
