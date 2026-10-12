import { useEffect, useRef, type CSSProperties } from 'react';
import { timeline } from '../data';
import { SectionTitle } from './SectionTitle';

/** Тажрыйба жана билим — вертикалдуу убакыт тилкеси, сызыгы скролл менен толот. */
export function Timeline() {
  const listRef = useRef<HTMLOListElement>(null);

  // Скроллго жараша борбордогу сызыктын толушу (--progress: 0..1)
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const onScroll = () => {
      const rect = list.getBoundingClientRect();
      const viewMid = window.innerHeight * 0.6;
      const progress = Math.min(1, Math.max(0, (viewMid - rect.top) / rect.height));
      list.style.setProperty('--progress', progress.toFixed(3));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <section id="experience" className="section experience">
      <div className="container">
        <SectionTitle index="04" title="Тажрыйба" subtitle="Иштеген жерлерим жана окуган жайларым" />

        <ol className="timeline" ref={listRef}>
          {timeline.map((item, i) => (
            <li
              key={item.title + item.period}
              className={`timeline__item ${i % 2 ? 'timeline__item--right' : 'timeline__item--left'}`}
              data-reveal={i % 2 ? 'right' : 'left'}
              style={{ '--d': '80ms' } as CSSProperties}
            >
              <span className="timeline__dot" aria-hidden="true" />
              <div className="timeline__card">
                <div className="timeline__top">
                  <span className="timeline__period">{item.period}</span>
                  <span className={`timeline__type timeline__type--${item.type}`}>
                    {item.type === 'work' ? 'Иш' : 'Билим'}
                  </span>
                </div>
                <h3 className="timeline__title">{item.title}</h3>
                <p className="timeline__place">{item.place}</p>
                <p className="timeline__desc">{item.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
