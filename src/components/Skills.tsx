import type { CSSProperties } from 'react';
import { skillGroups } from '../data';
import { SectionTitle } from './SectionTitle';

/** Көндүмдөр: топтор боюнча карточкалар, иконка жана анимацияланган прогресс тилкеси. */
export function Skills() {
  const allNames = skillGroups.flatMap((g) => g.skills.map((s) => s.name));

  return (
    <section id="skills" className="section skills">
      <div className="container">
        <SectionTitle index="02" title="Көндүмдөр" subtitle="Күн сайын колдонгон технологиялар жана куралдар" />

        <div className="skills__groups">
          {skillGroups.map((group, gi) => (
            <div key={group.title} className="skills__group" data-reveal style={{ '--d': `${gi * 120}ms` } as CSSProperties}>
              <h3 className="skills__group-title">{group.title}</h3>
              <ul className="skills__list">
                {group.skills.map((skill, i) => (
                  <li
                    key={skill.name}
                    className="skill"
                    data-reveal
                    style={{ '--d': `${gi * 120 + i * 70}ms`, '--level': `${skill.level}%` } as CSSProperties}
                  >
                    <div className="skill__icon">
                      <img src={skill.icon} alt="" loading="lazy" width={28} height={28} />
                    </div>
                    <div className="skill__body">
                      <div className="skill__head">
                        <span className="skill__name">{skill.name}</span>
                        <span className="skill__value">{skill.level}%</span>
                      </div>
                      <div
                        className="skill__bar"
                        role="progressbar"
                        aria-label={skill.name}
                        aria-valuenow={skill.level}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <span className="skill__fill" />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Чексиз жылып турган көндүмдөр тасмасы (эки жолу кайталанат — үзгүлтүксүз көрүнүш үчүн) */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee__track">
          {[...allNames, ...allNames].map((name, i) => (
            <span key={i} className="marquee__item">
              {name} <span className="marquee__star">✦</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
