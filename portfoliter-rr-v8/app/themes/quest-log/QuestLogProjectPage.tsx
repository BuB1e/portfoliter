import type { ReactNode } from "react";
import { Link } from "react-router";

import { Markdown, markdownBase } from "~/components/Markdown";
import { questGiver } from "~/components/quest-log/QuestBoard";
import { formatMonth } from "~/lib/format";
import { educationLabel, experienceLabel, projectDates, projectGroupHref } from "~/lib/projects";
import type { ThemeProjectPageProps } from "../types";
import { FONTS_HREF, QUEST_TYPES } from "./QuestLogPage";

const markdownClass = `${markdownBase} text-[1.15rem] leading-relaxed [&_h2]:font-ql [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:font-ql [&_h3]:text-xl [&_li]:marker:text-ql-wax [&_code]:bg-ql-ink/10 [&_code]:px-1 [&_pre]:bg-ql-ink/5 [&_blockquote]:border-ql-ink-soft [&_blockquote]:italic [&_a]:text-ql-wax`;

function MenuLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="ql-window inline-block px-4 py-2 text-[1.1rem] no-underline hover:text-ql-gold">
      {children}
    </Link>
  );
}

// A wooden roller at the top and bottom of the scroll; part of the layout, never over text.
function Roller() {
  return (
    <div aria-hidden="true" className="relative z-10 -mx-3 h-5 rounded-full bg-[linear-gradient(180deg,#a8743f,#5b3417)] shadow-[0_3px_0_#2c1708] sm:-mx-5" />
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="font-ql text-ql-ink-soft">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </>
  );
}

// A project as a quest scroll: the quest's giver, status and dates, its map (cover), the objectives
// (the markdown content), the rewards (skills) and where to go next (demo and source).
export function QuestLogProjectPage({ portfolio, project }: ThemeProjectPageProps) {
  const fonts = <link rel="stylesheet" href={FONTS_HREF} precedence="default" />;
  const ownerName = portfolio?.profile.fullName ?? null;

  if (!project) {
    return (
      <main className="mx-auto max-w-xl px-4 py-20">
        {fonts}
        <div className="ql-window px-6 py-8">
          <h1 className="text-[2.2rem] leading-none font-bold text-ql-gold">No such quest</h1>
          <p className="mt-4 text-[1.1rem] leading-relaxed">
            This scroll is blank. The quest does not exist or has not been posted to the board yet.
          </p>
          <p className="mt-6">
            <Link to="/" className="text-ql-gold">
              Return to the quest board
            </Link>
          </p>
        </div>
      </main>
    );
  }

  const type = QUEST_TYPES[project.projectType];
  const dates = projectDates(project);

  return (
    <div className="mx-auto max-w-[52rem] px-4 py-8 sm:px-6 sm:py-12">
      {fonts}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center justify-between gap-4">
        <MenuLink to={projectGroupHref(project.projectType)}>Back to {type.title.toLowerCase()}</MenuLink>
        {ownerName && (
          <Link to="/" className="text-ql-soft hover:text-ql-gold">
            {ownerName}
          </Link>
        )}
      </nav>

      <main className="mt-10 px-3 sm:px-5">
        <Roller />
        <article aria-labelledby="quest-title" className="ql-parchment px-5 py-8 font-ql-scroll text-ql-ink sm:px-10 sm:py-10">
          <header className="text-center">
            <p className="font-ql text-ql-wax">
              {type.title.replace(/s$/, "")}
              {project.isFeatured && ", Epic quest"}
            </p>
            <h1 id="quest-title" className="mt-2 font-ql text-[clamp(2rem,6vw,3.2rem)] leading-[1.02] font-bold break-words">
              {project.title}
            </h1>
            {project.summary && <p className="mx-auto mt-4 max-w-[46ch] text-[1.25rem] leading-snug italic">{project.summary}</p>}
          </header>

          <dl className="mx-auto mt-8 grid max-w-[36rem] grid-cols-[auto_1fr] gap-x-5 gap-y-2 border-y-2 border-ql-ink/30 py-4 text-[1.1rem]">
            <Detail label="Giver">{questGiver(project.experience, project.education)}</Detail>
            <Detail label="Status">
              {project.endDate ? `Cleared, ${formatMonth(project.endDate)}` : "In progress"}
            </Detail>
            {dates && <Detail label="Dates">{dates}</Detail>}
          </dl>

          <figure className="mt-8">
            {project.coverUrl ? (
              <img
                src={project.coverUrl}
                alt={`Map of ${project.title}`}
                className="w-full border-4 border-ql-ink/70 shadow-[4px_5px_0_rgb(59_36_18/0.35)] sepia-[.35]"
              />
            ) : (
              <div aria-hidden="true" className="grid aspect-[16/7] place-items-center border-2 border-dashed border-ql-ink/50 font-ql text-ql-ink-soft">
                No map for this quest
              </div>
            )}
            <figcaption className={project.coverUrl ? "mt-2 text-center italic text-ql-ink-soft" : "sr-only"}>
              {project.coverUrl ? `The map of ${project.title}` : `No map was drawn for ${project.title}`}
            </figcaption>
          </figure>

          <section aria-labelledby="objectives-title" className="mt-10">
            <h2 id="objectives-title" className="font-ql text-[1.6rem] font-bold">
              Objectives
            </h2>
            <div className="mt-3">
              {project.content ? (
                <Markdown className={markdownClass}>{project.content}</Markdown>
              ) : (
                <p className="text-[1.15rem] leading-relaxed">
                  The scroll lists no further objectives. {project.summary}
                </p>
              )}
            </div>
          </section>

          {project.skills.length > 0 && (
            <section aria-labelledby="rewards-title" className="mt-10">
              <h2 id="rewards-title" className="font-ql text-[1.6rem] font-bold">
                Rewards
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {project.skills.map((skill) => (
                  <li key={skill} className="border-2 border-ql-ink/60 bg-ql-ink/5 px-2.5 py-0.5 font-ql">
                    {skill}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(project.experience || project.education) && (
            <section aria-labelledby="giver-title" className="mt-10">
              <h2 id="giver-title" className="font-ql text-[1.6rem] font-bold">
                About the giver
              </h2>
              {project.experience && (
                <>
                  <p className="mt-2 text-[1.15rem] font-bold">{experienceLabel(project.experience)}</p>
                  {project.experience.description && <p className="mt-1 text-[1.1rem] leading-relaxed">{project.experience.description}</p>}
                </>
              )}
              {project.education && (
                <>
                  <p className="mt-2 text-[1.15rem] font-bold">{educationLabel(project.education)}</p>
                  {project.education.description && <p className="mt-1 text-[1.1rem]">{project.education.description}</p>}
                </>
              )}
            </section>
          )}

          {(project.demoUrl || project.repoUrl) && (
            <section aria-labelledby="next-title" className="mt-10">
              <h2 id="next-title" className="font-ql text-[1.6rem] font-bold">
                Where to go next
              </h2>
              <ul className="mt-3 grid gap-2 text-[1.15rem]">
                {project.demoUrl && (
                  <li>
                    <a href={project.demoUrl} className="font-bold text-ql-wax">
                      Visit {project.title} (live demo)
                    </a>
                  </li>
                )}
                {project.repoUrl && (
                  <li>
                    <a href={project.repoUrl} className="font-bold text-ql-wax">
                      Read the source code of {project.title}
                    </a>
                  </li>
                )}
              </ul>
            </section>
          )}

          <div
            aria-hidden="true"
            className="mx-auto mt-12 grid size-16 place-items-center rounded-full bg-ql-wax font-ql text-2xl font-bold text-ql-parchment shadow-[inset_0_0_0_4px_rgb(0_0_0/0.18),2px_3px_0_rgb(59_36_18/0.35)]"
          >
            {project.title.charAt(0)}
          </div>
        </article>
        <Roller />
      </main>
    </div>
  );
}
