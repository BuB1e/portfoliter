import { Link } from "react-router";

import { Markdown, markdownBase } from "~/components/Markdown";
import { AuthorBio } from "~/components/preprint/AuthorBio";
import { FEATURED_LABEL, Figures } from "~/components/preprint/Figures";
import { useReveal } from "~/hooks/useReveal";
import { linkedLine } from "~/lib/fields";
import { projectDates, projectGroupHref } from "~/lib/projects";
import type { ThemeProjectPageProps } from "../types";
import { FONTS_HREF, RESULT_GROUPS } from "./PreprintPage";

const markdownClass = `${markdownBase} pp-prose pp-justify`;
const MAX_RELATED = 2;

// One project as a short paper of its own: title, where it was done, the summary as its abstract, the
// cover as its first figure, then the write-up and related work from the same group.
export function PreprintProjectPage({ portfolio, project }: ThemeProjectPageProps) {
  useReveal();
  const fonts = <link rel="stylesheet" href={FONTS_HREF} precedence="default" />;

  if (!project) {
    return (
      <div className="pp-page">
        {fonts}
        <main className="pp-wrap grid min-h-[80svh] place-content-center justify-items-center gap-6 text-center">
          <h1 className="pp-display">Paper not found</h1>
          <p className="pp-lead max-w-[36ch]">No paper at this address. It may be withdrawn, or still a draft.</p>
          <Link to="/" className="pp-button">
            Back to the main paper
          </Link>
        </main>
      </div>
    );
  }

  const group = RESULT_GROUPS[project.projectType];
  const linked = linkedLine(project);
  const dates = projectDates(project);
  const related = (portfolio?.projects ?? []).filter((other) => other.projectType === project.projectType && other.id !== project.id).slice(0, MAX_RELATED);
  const email = portfolio?.profile.email;

  return (
    <div className="pp-page">
      {fonts}
      <header className="pp-wrap pt-[clamp(56px,8vw,120px)] text-center">
        <h1 className="pp-display mx-auto max-w-[18ch]">
          <span className="pp-mask">
            <span>{project.title}</span>
          </span>
        </h1>
        <p data-reveal="" className="mt-6 italic">
          {[portfolio?.profile.fullName, linked?.label].filter(Boolean).join(". ")}
        </p>
        <p data-reveal="" style={{ "--i": 1 } as React.CSSProperties} className="pp-small mt-2 text-pp-soft">
          {[project.isFeatured ? FEATURED_LABEL : null, group, dates].filter(Boolean).join(". ")}
        </p>
        <div data-reveal="" style={{ "--i": 2 } as React.CSSProperties} className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {project.demoUrl && (
            <a href={project.demoUrl} className="pp-button">
              Open the live demo
            </a>
          )}
          {project.repoUrl && (
            <a href={project.repoUrl} className={project.demoUrl ? "pp-link" : "pp-button"}>
              Read the source
            </a>
          )}
          {!project.demoUrl && !project.repoUrl && email && (
            <a href={`mailto:${email}?subject=${encodeURIComponent(`About ${project.title}`)}`} className="pp-button">
              Ask the author about it
            </a>
          )}
          <Link to={projectGroupHref(project.projectType)} className="pp-link">
            Back to {group.toLowerCase()}
          </Link>
        </div>
      </header>

      <main>
        <section aria-labelledby="summary-title" className="pp-section pp-wrap">
          <div className="pp-column">
            <h2 id="summary-title" className="pp-heading">
              Abstract
            </h2>
            <p className="pp-justify mt-6">{project.summary}</p>
            {project.skills.length > 0 && <p className="pp-small mt-4 text-pp-soft">Keywords: {project.skills.join(", ")}.</p>}
          </div>
          {project.coverUrl && (
            <figure data-reveal="" className="mx-auto mt-14 max-w-[64rem]">
              <img src={project.coverUrl} alt={`Cover of ${project.title}`} className="w-full" />
              <figcaption className="pp-small pp-column mt-3 text-pp-soft">
                <span className="font-semibold text-pp-ink">{project.title}</span>, as it stands.
              </figcaption>
            </figure>
          )}
        </section>

        {project.content && (
          <section aria-labelledby="body-title" className="pp-section pp-wrap">
            <div className="pp-column">
              <h2 id="body-title" data-reveal="" className="pp-heading">
                What was built
              </h2>
              <div data-reveal="" style={{ "--i": 1 } as React.CSSProperties} className="mt-6">
                <Markdown className={markdownClass}>{project.content}</Markdown>
              </div>
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section aria-labelledby="related-title" className="pp-section pp-wrap">
            <h2 id="related-title" data-reveal="" className="pp-heading pp-column">
              Related work
            </h2>
            <div className="mt-8">
              <Figures projects={related} />
            </div>
          </section>
        )}
      </main>

      {portfolio && <AuthorBio profile={portfolio.profile} links={portfolio.links} />}
    </div>
  );
}
