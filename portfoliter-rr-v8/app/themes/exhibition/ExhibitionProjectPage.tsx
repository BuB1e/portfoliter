import { Link } from "react-router";

import { FEATURED_LABEL, Room } from "~/components/exhibition/Room";
import { useExhibitWalk } from "~/components/exhibition/walk";
import { Markdown, markdownBase } from "~/components/Markdown";
import { useReveal } from "~/hooks/useReveal";
import { linkedLine } from "~/lib/fields";
import { projectDates, projectGroupHref } from "~/lib/projects";
import type { ThemeProjectPageProps } from "../types";
import { FONTS_HREF, MaskedTitle, ROOMS, Wordmark } from "./ExhibitionPage";

const markdownClass = `${markdownBase} ex-prose max-w-[64ch]`;
const MAX_NEIGHBOURS = 2;

// One work on its own wall: its label and title in the dark half, the work itself lit in the lighter half,
// then the long text about it and the works that hang beside it in the same room.
export function ExhibitionProjectPage({ portfolio, project }: ThemeProjectPageProps) {
  useReveal();
  useExhibitWalk();
  const fonts = <link rel="stylesheet" href={FONTS_HREF} precedence="default" />;

  if (!project) {
    return (
      <div className="ex-page">
        {fonts}
        <main className="ex-wrap grid min-h-[80svh] place-content-center justify-items-center gap-6 text-center">
          <h1 className="ex-display">Not on show</h1>
          <p className="ex-lead max-w-[36ch] text-ex-dim">This work is not hanging. It may be in storage, or it never existed.</p>
          <Link to="/" className="ex-button">
            Back to the entrance
          </Link>
        </main>
      </div>
    );
  }

  const room = ROOMS[project.projectType];
  const linked = linkedLine(project);
  const dates = projectDates(project);
  const email = portfolio?.profile.email;
  const neighbours = (portfolio?.projects ?? []).filter((other) => other.projectType === project.projectType && other.id !== project.id).slice(0, MAX_NEIGHBOURS);
  const facts: [string, string][] = (
    [
      ["Made", dates],
      [linked?.kind === "education" ? "Made at" : "Made for", linked?.label ?? ""],
      ["Medium", project.skills.join(", ")],
      ["Room", room.name],
    ] satisfies [string, string][]
  ).filter(([, value]) => value);

  return (
    <div id="top" className="ex-page">
      {fonts}
      <header className="grid lg:min-h-[100svh] lg:grid-cols-2">
        <div className="flex flex-col justify-between gap-12 p-[var(--ex-margin)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Wordmark />
            <Link to={projectGroupHref(project.projectType)} className="ex-link ex-small">
              Back to {room.name.toLowerCase()}
            </Link>
          </div>
          <div>
            <MaskedTitle text={project.title} className="ex-heading" />
            <p data-reveal="" className="ex-lead mt-6 max-w-[40ch]">
              {project.summary}
            </p>
            <dl data-reveal="" style={{ "--i": 1 } as React.CSSProperties} className="mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-[auto_1fr]">
              {facts.map(([name, value]) => (
                <div key={name} className="contents">
                  <dt className="text-ex-dim">{name}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
              {project.isFeatured && (
                <div className="contents">
                  <dt className="text-ex-dim">Note</dt>
                  <dd className="text-ex-gold">{FEATURED_LABEL}</dd>
                </div>
              )}
            </dl>
            <div data-reveal="" style={{ "--i": 2 } as React.CSSProperties} className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              {project.demoUrl && (
                <a href={project.demoUrl} className="ex-button">
                  See it working
                </a>
              )}
              {project.repoUrl && (
                <a href={project.repoUrl} className={project.demoUrl ? "ex-link" : "ex-button"}>
                  Read the source
                </a>
              )}
              {!project.demoUrl && !project.repoUrl && email && (
                <a href={`mailto:${email}?subject=${encodeURIComponent(`About ${project.title}`)}`} className="ex-button">
                  Ask about this work
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center bg-ex-wall p-[var(--ex-margin)]">
          {project.coverUrl ? (
            <img src={project.coverUrl} alt={`Cover of ${project.title}`} className="max-h-[80svh] w-full object-contain" />
          ) : (
            <span aria-hidden="true" className="flex aspect-[4/3] w-full max-w-[560px] items-center justify-center bg-ex-plinth p-8 text-center text-ex-dim">
              {project.title}
            </span>
          )}
        </div>
      </header>

      <main>
        {project.content && (
          <section aria-labelledby="text-title" className="ex-section ex-wrap grid gap-10 md:grid-cols-12">
            <h2 id="text-title" data-reveal="" className="ex-heading md:col-span-4">
              About the work
            </h2>
            <div data-reveal="" style={{ "--i": 1 } as React.CSSProperties} className="md:col-span-8">
              <Markdown className={markdownClass}>{project.content}</Markdown>
            </div>
          </section>
        )}
        {neighbours.length > 0 && <Room id="neighbours-title" name="In the same room" note={room.note} projects={neighbours} />}
      </main>

      <footer className="ex-wrap ex-small mt-[var(--ex-gap)] grid gap-2 py-10 text-ex-dim md:grid-cols-[1fr_auto_1fr]">
        <p>{portfolio ? `${portfolio.profile.fullName}: selected works` : "Selected works"}</p>
        <Link to="/" className="ex-link">
          Back to the entrance
        </Link>
        <p className="md:text-right">Hung with portfoliter</p>
      </footer>
    </div>
  );
}
