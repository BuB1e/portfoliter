import type { ReactNode } from "react";
import { Link } from "react-router";

import { Markdown, markdownBase } from "~/components/Markdown";
import { interchange, PROJECT_LINES, stationCode } from "~/components/skytrain/ProjectLine";
import { formatMonth } from "~/lib/format";
import type { ProjectType } from "~/lib/portfolio";
import { educationLabel, experienceLabel, positionInGroup, projectGroupHref } from "~/lib/projects";
import type { ThemeProjectPageProps } from "../types";
import { FONTS_HREF } from "./SkytrainPage";

// Line colour of the stops strip under "Lines served".
const STOP_BORDER: Record<ProjectType, string> = {
  WORK: "border-sky-sukhumvit",
  PERSONAL: "border-sky-gold",
  UNIVERSITY: "border-sky-blue",
};

const markdownClass = `${markdownBase} max-w-[64ch] text-[1.08rem] leading-relaxed [&_h2]:font-sky-sign [&_h2]:text-[2rem] [&_h2]:leading-none [&_h2]:font-bold [&_h3]:font-sky-sign [&_h3]:text-xl [&_h3]:font-bold [&_li]:marker:text-sky-silom [&_code]:rounded [&_code]:bg-sky-concrete [&_code]:px-1 [&_pre]:rounded-xl [&_pre]:bg-sky-concrete [&_a]:text-sky-blue`;

function InfoPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-label={title} className="rounded-2xl bg-white p-5">
      <h2 className="font-sky-sign text-xl font-bold">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function BackLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="inline-flex items-center gap-2 rounded-full bg-sky-yellow px-4 py-2 font-semibold text-sky-ink no-underline hover:underline">
      {children}
    </Link>
  );
}

// A project as a station: a platform sign in its line's colour, then platform information and the timetable.
export function SkytrainProjectPage({ portfolio, project }: ThemeProjectPageProps) {
  const fonts = <link rel="stylesheet" href={FONTS_HREF} precedence="default" />;

  if (!project) {
    return (
      <main className="mx-auto grid max-w-[1080px] justify-items-center gap-5 px-5 py-32 text-center">
        {fonts}
        <h1 className="font-sky-sign text-[clamp(3rem,10vw,5rem)] leading-none font-bold">Station closed</h1>
        <p className="max-w-[42ch] text-lg text-sky-muted">No train stops here. This project does not exist or is not open to passengers yet.</p>
        <BackLink to="/">Back to the network map</BackLink>
      </main>
    );
  }

  const line = PROJECT_LINES[project.projectType];
  const code = stationCode(project.projectType, Math.max(1, positionInGroup(project, portfolio?.projects ?? [])));
  const connection = interchange(project.experience, project.education);
  const isRunning = !project.endDate;

  return (
    <>
      {fonts}
      <header className={`overflow-hidden rounded-b-3xl ${line.band}`}>
        <div className="mx-auto max-w-[1080px] px-5 pt-8 pb-12 md:pb-16">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center justify-between gap-3">
            <BackLink to={projectGroupHref(project.projectType)}>Back to the {line.name}</BackLink>
            {portfolio && (
              <Link to="/" className="font-semibold">
                {portfolio.profile.fullName}
              </Link>
            )}
          </nav>
          <div className="mt-10 flex flex-wrap items-center gap-3 text-[0.95rem] font-semibold">
            <span className={`grid size-12 place-items-center rounded-full bg-white font-sky-sign text-lg font-bold ${line.roundel}`}>{code}</span>
            <span>{line.name}</span>
          </div>
          <p className="mt-6 text-lg opacity-80">This station</p>
          <h1 className="font-sky-sign text-[clamp(2.8rem,9vw,6rem)] leading-[0.9] font-bold tracking-[-0.01em] break-words">{project.title}</h1>
          {project.summary && <p className="mt-4 max-w-[48ch] text-xl leading-snug">{project.summary}</p>}
          {connection && (
            <div className="mt-8 inline-flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl bg-white px-5 py-3 text-sky-ink">
              <span className="font-sky-sign text-lg font-bold">Interchange</span>
              <span className="text-lg">{connection}</span>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto grid max-w-[1080px] gap-10 px-5 pt-14 pb-20 lg:grid-cols-[1fr_320px]">
        <section aria-labelledby="platform-title" className="min-w-0">
          <h2 id="platform-title" className="font-sky-sign text-[clamp(2.2rem,5vw,3.2rem)] leading-none font-bold">
            Platform information
          </h2>
          <p className="mt-2 mb-8 text-sky-muted">Everything about this stop, in order of travel.</p>
          {project.coverUrl && (
            <img src={project.coverUrl} alt={`Cover image of ${project.title}`} className="mb-8 w-full rounded-2xl" />
          )}
          {project.content ? (
            <Markdown className={markdownClass}>{project.content}</Markdown>
          ) : (
            <p className="text-lg">No announcements for this station yet.</p>
          )}
          {project.skills.length > 0 && (
            <div className="mt-12">
              <h2 className="font-sky-sign text-[2rem] leading-none font-bold">Lines served</h2>
              <ul className="mt-6 flex flex-wrap gap-y-4">
                {project.skills.map((skill) => (
                  <li key={skill} className={`relative min-w-[120px] flex-1 border-t-[6px] pt-4 pr-3 font-semibold ${STOP_BORDER[project.projectType]}`}>
                    <span aria-hidden="true" className={`absolute -top-[13px] left-0 size-5 rounded-full border-[5px] bg-white ${STOP_BORDER[project.projectType]}`} />
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <aside className="grid content-start gap-4">
          <InfoPanel title="Timetable">
            <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1">
              <dt className="font-semibold">Opened</dt>
              <dd>{project.startDate ? formatMonth(project.startDate) : "Not on the timetable"}</dd>
              <dt className="font-semibold">Service</dt>
              <dd>{isRunning ? "Running" : `Last train ${formatMonth(project.endDate)}`}</dd>
            </dl>
          </InfoPanel>
          {(project.experience || project.education) && (
            <InfoPanel title="Connecting line">
              {project.experience && <p>{experienceLabel(project.experience)}</p>}
              {project.education && <p>{educationLabel(project.education)}</p>}
            </InfoPanel>
          )}
          {(project.demoUrl || project.repoUrl) && (
            <InfoPanel title="Exits">
              <ul className="grid gap-2 font-semibold">
                {project.demoUrl && (
                  <li>
                    <a href={project.demoUrl} className="text-sky-blue">
                      Ride {project.title}
                    </a>
                  </li>
                )}
                {project.repoUrl && (
                  <li>
                    <a href={project.repoUrl} className="text-sky-blue">
                      Source code
                    </a>
                  </li>
                )}
              </ul>
            </InfoPanel>
          )}
        </aside>
      </main>
    </>
  );
}
