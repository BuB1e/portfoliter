import { Link } from "react-router";

import { linkedName } from "~/lib/fields";
import { formatMonth } from "~/lib/format";
import type { Project } from "~/lib/portfolio";
import { projectPath, shortDescription } from "~/lib/projects";

export const FEATURED_LABEL = "Highlight of the show";

function workDates(project: Project): string | null {
  return project.startDate ? [formatMonth(project.startDate), project.endDate && formatMonth(project.endDate)].filter(Boolean).join(" to ") : null;
}

// The wall label beside a work, set the way a gallery sets one: the title, who it was made with and when,
// the medium, then a few lines about it.
export function WallLabel({ project, isLinked = true }: { project: Project; isLinked?: boolean }) {
  const made = [linkedName(project), workDates(project)].filter(Boolean).join(", ");
  const text = (
    <>
      <span className="ex-exhibit-title ex-lead block font-semibold transition-colors">{project.title}</span>
      {made && <span className="mt-1 block text-ex-dim">{made}</span>}
      <span className="mt-4 block">{shortDescription(project.summary)}</span>
    </>
  );
  return (
    <div className="max-w-[34ch]">
      {isLinked ? (
        <Link to={projectPath(project.slug)} className="ex-exhibit-link">
          {text}
        </Link>
      ) : (
        text
      )}
      {project.skills.length > 0 && <p className="ex-small mt-4 text-ex-dim">{project.skills.join(", ")}</p>}
      {project.isFeatured && <p className="ex-small mt-2 font-semibold text-ex-gold">{FEATURED_LABEL}</p>}
    </div>
  );
}

// A work with no photograph hangs as an empty lit frame: the wall it would cover, and the title on it.
function EmptyFrame({ title }: { title: string }) {
  return (
    <span aria-hidden="true" className="ex-exhibit-picture flex aspect-[4/3] items-center justify-center bg-ex-wall p-[12%]">
      <span className="flex h-full w-full items-center justify-center bg-ex-plinth p-6 text-center text-ex-dim">{title}</span>
    </span>
  );
}

// One room of the show: its name, then each work hung on alternating sides with space around it, its label
// beside it, the way works are hung in a quiet gallery.
export function Room({ id, name, note, projects }: { id: string; name: string; note: string; projects: Project[] }) {
  return (
    <section aria-labelledby={id} className="ex-section ex-wrap">
      <div data-reveal="" className="grid gap-4 md:grid-cols-12 md:items-end">
        <h2 id={id} className="ex-display md:col-span-9">
          {name}
        </h2>
        <p className="text-ex-dim md:col-span-3">{note}</p>
      </div>
      <ul className="mt-20 flex flex-col gap-[clamp(96px,12vw,180px)]">
        {projects.map((project, index) => {
          const isRight = index % 2 === 1;
          return (
            <li
              key={project.id}
              data-exhibit=""
              className="grid items-end gap-8 md:grid-cols-12"
            >
              <Link
                to={projectPath(project.slug)}
                tabIndex={-1}
                aria-hidden="true"
                className={isRight ? "md:col-span-7 md:col-start-6 md:row-start-1" : "md:col-span-7"}
              >
                {project.coverUrl ? (
                  <img src={project.coverUrl} alt="" loading="lazy" className="ex-exhibit-picture" />
                ) : (
                  <EmptyFrame title={project.title} />
                )}
              </Link>
              <div data-reveal="" className={isRight ? "md:col-span-4 md:col-start-1 md:row-start-1" : "md:col-span-4 md:col-start-9"}>
                <WallLabel project={project} />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
