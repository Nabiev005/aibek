import type { CSSProperties } from 'react';
import { projects, type Project } from '../data';
import { useTilt } from '../hooks/useTilt';
import { ArrowIcon, GithubIcon } from './Icons';
import { SectionTitle } from './SectionTitle';

/** Бир долбоордун карточкасы — чычкан менен 3D бурулат. */
function ProjectCard({ project, index }: { project: Project; index: number }) {
  const tiltRef = useTilt<HTMLElement>(9);

  return (
    // Сырткы div — скролл анимациясы үчүн, ички article — tilt үчүн (transform кагылышпашы үчүн)
    <div className="project-wrap" data-reveal style={{ '--d': `${(index % 2) * 120}ms` } as CSSProperties}>
      <article className="project tilt" ref={tiltRef}>
        <div className="project__media">
          <img src={project.image} alt={project.title} loading="lazy" />
          <span className="project__num">{String(index + 1).padStart(2, '0')}</span>
        </div>

        <div className="project__body">
          <h3 className="project__title">{project.title}</h3>
          <p className="project__desc">{project.description}</p>

          <ul className="project__tech">
            {project.tech.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>

          <div className="project__actions">
            <a href={project.link} target="_blank" rel="noreferrer" className="btn btn--primary btn--sm">
              <span>Көрүү</span>
              <ArrowIcon width={16} height={16} />
            </a>
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noreferrer"
                className="icon-btn"
                aria-label={`${project.title} — GitHub`}
              >
                <GithubIcon />
              </a>
            )}
          </div>
        </div>

        <span className="tilt__glare" />
      </article>
    </div>
  );
}

/** Долбоорлор бөлүмү. */
export function Projects() {
  return (
    <section id="projects" className="section projects">
      <div className="container">
        <SectionTitle index="03" title="Долбоорлор" subtitle="Акыркы иштеримдин айрымдары" />
        <div className="projects__grid">
          {projects.map((p, i) => (
            <ProjectCard key={p.title} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
