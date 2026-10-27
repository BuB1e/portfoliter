import { Link } from "react-router";

import { habitat, LabelRow, specimenCover, specimenNumber } from "~/components/field-guide/SpecimenGrid";
import { Markdown, markdownBase } from "~/components/Markdown";
import { educationLabel, experienceLabel, projectDates, projectGroupHref } from "~/lib/projects";
import type { ThemeProjectPageProps } from "../types";
import { FONTS_HREF, GuideBar, SPECIMEN_GROUPS } from "./FieldGuidePage";

const markdownClass = `${markdownBase} max-w-[64ch] font-fg-serif text-[1.15rem] leading-[1.6] [&_h2]:pt-2 [&_h2]:text-[1.8rem] [&_h2]:font-semibold [&_h3]:text-xl [&_h3]:font-semibold [&_li]:marker:text-fg-rust [&_strong]:text-fg-pine [&_code]:font-fg-sans [&_code]:bg-fg-header [&_code]:px-1 [&_pre]:bg-fg-header [&_blockquote]:border-fg-ochre [&_blockquote]:italic`;

const backLinkClass = "font-fg-serif text-lg italic";

// A project as a species account: the plate, the identification marks, then the field notes.
export function FieldGuideProjectPage({ portfolio, project }: ThemeProjectPageProps) {
  const fonts = <link rel="stylesheet" href={FONTS_HREF} precedence="default" />;

  if (!project) {
    return (
      <div className="mx-auto max-w-[1120px] px-5 pb-16">
        {fonts}
        <GuideBar plate="Plate missing" />
        <main className="grid justify-items-center gap-4 py-24 text-center">
          <h1 className="font-fg-serif text-[clamp(2.6rem,7vw,4.5rem)] leading-none font-semibold">No such specimen</h1>
          <p className="max-w-[44ch] font-fg-serif text-lg">
            Nothing has been recorded under this name, or the record is still being written up.
          </p>
          <Link to="/" className={backLinkClass}>
            Back to the field guide
          </Link>
        </main>
      </div>
    );
  }

  const dates = projectDates(project);
  const group = SPECIMEN_GROUPS[project.projectType];

  return (
    <div className="mx-auto max-w-[1120px] px-5 pb-16">
      {fonts}
      <GuideBar plate={`Specimen ${specimenNumber(project)}`} />

      <nav aria-label="Breadcrumb" className="mt-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <Link to={projectGroupHref(project.projectType)} className={backLinkClass}>
          Back to {group.title.toLowerCase()}
        </Link>
        {portfolio && (
          <Link to="/" className="font-medium">
            {portfolio.profile.fullName}
          </Link>
        )}
      </nav>

      <main>
        <header className="grid items-start gap-10 pt-8 pb-12 md:grid-cols-[1.05fr_1fr] md:gap-12 md:pt-12">
          <div className="min-w-0">
            <p className="text-[0.95rem] font-semibold text-fg-moss">Specimen {specimenNumber(project)}</p>
            <h1 className="mt-1 font-fg-serif text-[clamp(2.6rem,6.5vw,4.8rem)] leading-[0.98] font-semibold tracking-[-0.02em] break-words">
              {project.title}
            </h1>
            <p className="mt-3 font-fg-serif text-[clamp(1.2rem,2.2vw,1.6rem)] leading-snug text-fg-moss italic">
              {habitat(project, project.experience, project.education)}
            </p>
            {project.summary && <p className="mt-6 max-w-[44ch] font-fg-serif text-xl leading-normal">{project.summary}</p>}
            <div className="mt-8 grid gap-2">
              {dates && <LabelRow term="Collected">{dates}</LabelRow>}
              {project.experience && <LabelRow term="Keeper">{experienceLabel(project.experience)}</LabelRow>}
              {project.education && <LabelRow term="Institute">{educationLabel(project.education)}</LabelRow>}
              {project.skills.length > 0 && <LabelRow term="Made of">{project.skills.join(", ")}</LabelRow>}
              {(project.repoUrl || project.demoUrl) && (
                <LabelRow term="Observe">
                  {project.repoUrl && <a href={project.repoUrl}>Source code</a>}
                  {project.repoUrl && project.demoUrl && ", "}
                  {project.demoUrl && <a href={project.demoUrl}>Live demo</a>}
                </LabelRow>
              )}
            </div>
          </div>
          <figure className="border-[1.5px] border-fg-pine bg-fg-paper p-4">
            <div className="relative">
              {project.coverUrl ? (
                <img src={project.coverUrl} alt={`Cover image of ${project.title}`} className="block w-full" />
              ) : (
                <div aria-hidden="true" className="aspect-[4/3]" style={{ background: specimenCover(project) }} />
              )}
              <span aria-hidden="true" className="absolute top-3.5 left-1/2 size-4 -translate-x-1/2 rounded-full bg-fg-rust shadow-[0_2px_0_rgb(0_0_0/0.25)]" />
            </div>
            <figcaption className="mt-2.5 text-center font-fg-serif text-[0.95rem] leading-snug italic">
              Fig. 1. {project.title}, {project.coverUrl ? "as collected" : "no photograph on file"}.
            </figcaption>
          </figure>
        </header>

        <section aria-labelledby="notes-title" className="border-t-[1.5px] border-fg-pine pt-10">
          <h2 id="notes-title" className="mb-6 font-fg-serif text-[clamp(2.1rem,4.4vw,3rem)] leading-none font-semibold tracking-[-0.015em]">
            Field notes
          </h2>
          {project.content ? (
            <Markdown className={markdownClass}>{project.content}</Markdown>
          ) : (
            <p className="font-fg-serif text-lg italic">No field notes yet. The observer is still watching.</p>
          )}
        </section>
      </main>
    </div>
  );
}
