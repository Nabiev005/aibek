import type { CSSProperties } from 'react';
import { contacts, profile } from '../data';
import { useTypewriter } from '../hooks/useTypewriter';
import type { Theme } from '../hooks/useTheme';
import { HeroMonitor } from './HeroMonitor';
import { HeroScene } from './HeroScene';
import { GithubIcon, InstagramIcon, MapPinIcon, TelegramIcon } from './Icons';

type Props = { theme: Theme; reduced: boolean; started: boolean; onOpenTerminal: () => void };

/** Сөздү тамгаларга бөлүп, ар бирине кечиктирүү берет (кезек менен чыгуу анимациясы). */
function SplitText({ text, offset = 0 }: { text: string; offset?: number }) {
  return (
    <>
      {[...text].map((ch, i) => (
        <span key={i} className="char" style={{ '--ci': i + offset } as CSSProperties}>
          {ch}
        </span>
      ))}
    </>
  );
}

/** Башкы экран: чоң аты-жөн, typewriter кесиптер, код жазылган монитор жана 3D фон. */
export function Hero({ theme, reduced, started, onOpenTerminal }: Props) {
  const typed = useTypewriter(profile.roles, { enabled: started && !reduced });

  return (
    <section id="home" className={`hero ${started ? 'is-started' : ''}`}>
      <HeroScene theme={theme} reduced={reduced} />
      <div className="hero__glow" aria-hidden="true" />

      <div className="container hero__content">
        {/* Сол жак: текст */}
        <div className="hero__text">
        <div className="hero__hello">
          {/* Тегерек аватар — градиент шакек жана "онлайн" белгиси менен */}
          <span className="hero__avatar">
            <img src={profile.photos.hero} alt={profile.fullName} width={56} height={56} />
            <span className="hero__avatar-dot" aria-hidden="true" />
          </span>
          <span>
            <span className="hero__wave" aria-hidden="true">👋</span> Салам, мен —
          </span>
        </div>

        <h1 className="hero__name" aria-label={`${profile.firstName} ${profile.lastName}`}>
          <span className="hero__line" aria-hidden="true">
            <SplitText text={profile.firstName} />
          </span>
          <span className="hero__line hero__line--outline" aria-hidden="true">
            <SplitText text={profile.lastName} offset={profile.firstName.length} />
          </span>
        </h1>

        <p className="hero__role">
          {reduced ? (
            profile.roles.join(' · ')
          ) : (
            <>
              <span className="hero__typed">{typed}</span>
              <span className="hero__caret" aria-hidden="true" />
            </>
          )}
        </p>

        <p className="hero__desc">
          {profile.experienceYears} жылдык тажрыйба менен заманбап веб-тиркемелерди, ыңгайлуу интерфейстерди
          жана эсте калган визуалдык дизайнды түзөм.
        </p>

        <div className="hero__actions">
          <a href="#projects" className="btn btn--primary" data-magnetic>
            <span>Долбоорлорум</span>
          </a>
          <a href="#contact" className="btn btn--ghost" data-magnetic>
            <span>Байланышуу</span>
          </a>
        </div>

        <div className="hero__meta">
          {/* Терминал жөнүндө кеңеш — компьютерде гана көрүнөт */}
          <button className="chip chip--kbd" onClick={onOpenTerminal}>
            <kbd>Ctrl</kbd>+<kbd>K</kbd> терминалды ачуу
          </button>
          <span className="chip">
            <MapPinIcon width={16} height={16} /> {profile.city}
          </span>
          <span className="chip">
            <span className="chip__dot" /> Жаңы долбоорлорго ачыкмын
          </span>
        </div>
        </div>

        {/* Оң жак: код жазылып турган монитор */}
        <HeroMonitor reduced={reduced} started={started} />
      </div>

      <div className="hero__socials">
        <a href={contacts.github.url} target="_blank" rel="noreferrer" aria-label="GitHub">
          <GithubIcon />
        </a>
        <a href={contacts.telegram.url} target="_blank" rel="noreferrer" aria-label="Telegram">
          <TelegramIcon />
        </a>
        <a href={contacts.instagram.url} target="_blank" rel="noreferrer" aria-label="Instagram">
          <InstagramIcon />
        </a>
      </div>

      <a href="#about" className="hero__scroll" aria-label="Төмөн түшүү">
        <span className="hero__mouse">
          <span />
        </span>
        <span className="hero__scroll-text">Скролл</span>
      </a>
    </section>
  );
}
