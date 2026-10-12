import { useEffect, useState } from 'react';
import { profile } from '../data';
import { bishkekStatus, bishkekTime } from '../lib/time';

/** Төмөнкү бөлүк: копирайт, Бишкектин жандуу сааты жана жогору кайтуу. */
export function Footer() {
  const year = new Date().getFullYear();
  const [now, setNow] = useState(() => new Date());

  // Саатты ар 30 секундда жаңыртабыз
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p>
          © {year} {profile.fullName}. Бардык укуктар корголгон.
        </p>
        <p className="footer__clock">
          <span className="chip__dot" /> Бишкекте азыр <strong>{bishkekTime(now)}</strong> — {bishkekStatus(now)}
        </p>
        <a href="#home" className="link-underline">
          Жогору ↑
        </a>
      </div>
    </footer>
  );
}
