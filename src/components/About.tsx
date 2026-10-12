import type { CSSProperties } from 'react';
import { contacts, profile } from '../data';
import { useTilt } from '../hooks/useTilt';
import type { Theme } from '../hooks/useTheme';
import { MiniScene } from './MiniScene';
import { SectionTitle } from './SectionTitle';

type Props = { theme: Theme; reduced: boolean };

/** Туулган күндөн учурдагы жашты эсептейт. */
function getAge(birthDate: string) {
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate());
  if (beforeBirthday) age--;
  return age;
}

/** "Мен жөнүндө" бөлүмү: сүрөт (3D tilt менен) + кыскача биография. */
export function About({ theme, reduced }: Props) {
  const photoRef = useTilt<HTMLDivElement>(8);

  const facts = [
    { label: 'Жашым', value: `${getAge(profile.birthDate)} жаш` },
    { label: 'Шаар', value: profile.city },
    { label: 'Тажрыйба', value: `${profile.experienceYears}+ жыл` },
    { label: 'Студия', value: profile.studio },
  ];

  return (
    <section id="about" className="section about">
      <div className="container">
        <SectionTitle index="01" title="Мен жөнүндө" subtitle="Ким экенимди жана эмне менен алектенеримди кыскача" />

        <div className="about__grid">
          {/* Сүрөт + анын артындагы 3D объект */}
          <div className="about__media" data-reveal="left">
            <MiniScene shape="torusKnot" theme={theme} reduced={reduced} className="about__scene" />
            <div className="about__photo tilt" ref={photoRef}>
              <img src={profile.photos.about} alt={`${profile.fullName} иш ордунда`} loading="lazy" />
              <span className="tilt__glare" />
              <span className="about__badge">
                <strong>{profile.experienceYears}+</strong> жыл тажрыйба
              </span>
            </div>
          </div>

          <div className="about__text">
            <p className="about__lead" data-reveal>
              Мен <strong>{profile.fullName}</strong> — Fullstack иштеп чыгуучу, UI/UX жана графикалык дизайнермин.
            </p>
            <p data-reveal style={{ '--d': '100ms' } as CSSProperties}>
              2005-жылы 23-июнда төрөлгөм. Азыркы учурда Бишкек шаарындагы Технопаркта жайгашкан{' '}
              <span className="accent">{profile.studio}</span> IT студиясынын негиздөөчүсү жана жетекчисимин.
            </p>
            <p data-reveal style={{ '--d': '200ms' } as CSSProperties}>
              Идеядан баштап дизайнга, андан ары иштеген продуктка чейин толук циклде иштейм: колдонуучуга ыңгайлуу
              интерфейстерди долбоорлоп, аларды тез жана сапаттуу кодго айлантам.
            </p>

            <ul className="about__facts">
              {facts.map((f, i) => (
                <li key={f.label} data-reveal style={{ '--d': `${250 + i * 80}ms` } as CSSProperties}>
                  <span>{f.label}</span>
                  <strong>{f.value}</strong>
                </li>
              ))}
            </ul>

            <div className="about__actions" data-reveal style={{ '--d': '550ms' } as CSSProperties}>
              <a href="#contact" className="btn btn--primary" data-magnetic>
                <span>Бирге иштешели</span>
              </a>
              <a href={`mailto:${contacts.email}`} className="link-underline">
                {contacts.email}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
