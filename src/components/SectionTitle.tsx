import { ScrambleText } from './ScrambleText';

type Props = { index: string; title: string; subtitle?: string };

/** Бөлүмдүн номери, аталышы ("хакер" эффекти менен) жана кошумча сүрөттөмөсү. */
export function SectionTitle({ index, title, subtitle }: Props) {
  return (
    <header className="section-title" data-reveal>
      <span className="section-title__index">{index}</span>
      <h2 className="section-title__text" aria-label={title}>
        <ScrambleText text={title} />
      </h2>
      {subtitle && <p className="section-title__sub">{subtitle}</p>}
    </header>
  );
}
