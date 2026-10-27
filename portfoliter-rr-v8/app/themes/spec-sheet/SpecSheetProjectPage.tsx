import { Link } from "react-router";

import { Markdown, markdownBase } from "~/components/Markdown";
import { SpecRow } from "~/components/spec-sheet/SpecRow";
import { specContext } from "~/components/spec-sheet/SpecProjects";
import { educationLabel, experienceLabel, projectDates, projectGroupHref } from "~/lib/projects";
import type { ThemeProjectPageProps } from "../types";
import { FONTS_HREF, GROUP_LABELS } from "./SpecSheetPage";

const markdownClass = `${markdownBase} max-w-[65ch] text-[1.05rem] leading-relaxed [&_a]:text-ss-blue [&_code]:bg-ss-rule/60 [&_code]:px-1 [&_h2]:pt-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:font-semibold [&_li]:marker:text-ss-muted [&_pre]:bg-ss-rule/40`;

function TopBar({ ownerName, backHref, backLabel }: { ownerName: string | null; backHref: string; backLabel: string }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 pt-10 text-[0.95rem] font-medium">
      <Link to={backHref} className="text-ss-blue">
        {backLabel}
      </Link>
      {ownerName && (
        <Link to="/" className="text-ss-muted">
          {ownerName}
        </Link>
      )}
    </nav>
  );
}

// A project as a spec sheet: the same label-and-content rows as the home page, one per fact.
export function SpecSheetProjectPage({ portfolio, project }: ThemeProjectPageProps) {
  const fonts = <link rel="stylesheet" href={FONTS_HREF} precedence="default" />;
  const ownerName = portfolio?.profile.fullName ?? null;

  if (!project) {
    return (
      <div className="mx-auto max-w-[1040px] px-5 pb-24">
        {fonts}
        <TopBar ownerName={ownerName} backHref="/" backLabel="All projects" />
        <main className="pt-20">
          <h1 className="text-[clamp(2.5rem,7vw,4.5rem)] leading-[0.95] font-bold tracking-[-0.03em]">No such project</h1>
          <p className="mt-5 max-w-[46ch] text-lg text-ss-muted">
            This project does not exist or is not published yet. Every published project is listed on the home page.
          </p>
        </main>
      </div>
    );
  }

  const dates = projectDates(project);
  const hasLinks = Boolean(project.repoUrl || project.demoUrl);

  return (
    <div className="mx-auto max-w-[1040px] px-5">
      {fonts}
      <TopBar ownerName={ownerName} backHref={projectGroupHref(project.projectType)} backLabel={`All ${GROUP_LABELS[project.projectType].toLowerCase()}`} />

      <header className="pt-12 pb-12 md:pt-16 md:pb-16">
        <p className="text-[0.95rem] text-ss-muted">{specContext(project, project.experience, project.education)}</p>
        <h1 className="mt-3 max-w-[18ch] text-[clamp(2.6rem,7vw,5rem)] leading-[0.95] font-bold tracking-[-0.035em] break-words">
          {project.title}
        </h1>
        {project.summary && (
          <p className="mt-6 max-w-[48ch] text-[clamp(1.15rem,2.2vw,1.45rem)] leading-snug text-ss-muted">{project.summary}</p>
        )}
      </header>

      <main className="pb-16">
        {project.coverUrl && (
          <SpecRow id="cover-title" label="Cover">
            <img src={project.coverUrl} alt={`Cover image of ${project.title}`} className="w-full border border-ss-rule" />
          </SpecRow>
        )}
        {project.content && (
          <SpecRow id="detail-title" label="Detail">
            <Markdown className={markdownClass}>{project.content}</Markdown>
          </SpecRow>
        )}
        {dates && (
          <SpecRow id="period-title" label="Period">
            <p className="text-lg tabular-nums">{dates}</p>
          </SpecRow>
        )}
        {project.experience && (
          <SpecRow id="built-at-title" label="Built at">
            <p className="text-lg font-semibold">{experienceLabel(project.experience)}</p>
            {project.experience.description && <p className="mt-1 max-w-[65ch] text-ss-muted">{project.experience.description}</p>}
          </SpecRow>
        )}
        {project.education && (
          <SpecRow id="part-of-title" label="Part of">
            <p className="text-lg font-semibold">{educationLabel(project.education)}</p>
            {project.education.description && <p className="mt-1 text-ss-muted">{project.education.description}</p>}
          </SpecRow>
        )}
        {project.skills.length > 0 && (
          <SpecRow id="stack-title" label="Stack">
            <p className="text-lg">{project.skills.join(", ")}</p>
          </SpecRow>
        )}
        {hasLinks && (
          <SpecRow id="links-title" label="Links">
            <p className="flex flex-wrap gap-x-7 gap-y-2 text-lg font-medium">
              {project.demoUrl && (
                <a href={project.demoUrl} className="text-ss-blue">
                  Live site
                </a>
              )}
              {project.repoUrl && (
                <a href={project.repoUrl} className="text-ss-blue">
                  Source code
                </a>
              )}
            </p>
          </SpecRow>
        )}
      </main>
    </div>
  );
}
