import type { ReactNode } from "react";
import { Link } from "react-router";

import { EDITORS_PICK, storyDesk, StoryPhoto } from "~/components/broadsheet/Articles";
import { SlimMasthead } from "~/components/broadsheet/Masthead";
import { Markdown, markdownBase } from "~/components/Markdown";
import { linkedLine } from "~/lib/fields";
import { projectDates, projectGroupHref } from "~/lib/projects";
import type { ThemeProjectPageProps } from "../types";
import { DESKS, FONTS_HREF } from "./BroadsheetPage";

// Two newspaper columns from md up. List items stay whole across the column break; the first paragraph
// opens with a blackletter drop cap.
const markdownClass = `${markdownBase} bs-column-rule text-[1.08rem] leading-[1.65] md:columns-2 md:gap-10 [&_li]:break-inside-avoid [&_pre]:break-inside-avoid [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:leading-tight [&_h3]:text-xl [&_h3]:font-bold [&_code]:bg-bs-ink/10 [&_code]:px-1 [&_pre]:bg-bs-ink/5 [&_blockquote]:border-bs-ink [&_blockquote]:italic [&>p:first-child]:first-letter:float-left [&>p:first-child]:first-letter:mr-2 [&>p:first-child]:first-letter:font-bs-nameplate [&>p:first-child]:first-letter:text-[3.4rem] [&>p:first-child]:first-letter:leading-[0.8]`;

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-b border-dotted border-bs-rule py-3 last:border-0">
      <dt className="text-[0.9rem] text-bs-grey italic">{label}</dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  );
}

// A project as a full article: section kicker, headline, standfirst, byline, photo, two-column text, and
// a fact box with the dates, the job or school it was filed from, the skills and the links.
export function BroadsheetProjectPage({ portfolio, project }: ThemeProjectPageProps) {
  const fonts = <link rel="stylesheet" href={FONTS_HREF} precedence="default" />;
  const ownerName = portfolio?.profile.fullName ?? null;

  if (!project) {
    return (
      <div className="mx-auto max-w-[1180px] px-4 pb-16 sm:px-6">
        {fonts}
        <SlimMasthead fullName={ownerName} back={{ to: "/", label: "Back to the front page" }} />
        <main className="mx-auto mt-14 max-w-[40rem] border-y-4 border-bs-ink py-8">
          <p className="text-bs-red italic">Correction</p>
          <h1 className="mt-1 text-[clamp(2.2rem,6vw,3.6rem)] leading-[1.02] font-bold">No such story</h1>
          <p className="mt-4 text-lg leading-[1.6]">
            An earlier link pointed to a story that does not exist or has not been published yet. The paper regrets the
            error. Every published story is on the front page.
          </p>
          <Link to="/" className="mt-6 inline-block font-semibold">
            Read today&apos;s front page
          </Link>
        </main>
      </div>
    );
  }

  const desk = DESKS[project.projectType];
  const dates = projectDates(project);
  const filedFrom = storyDesk(project);
  const linked = linkedLine(project);
  const linkedDescription = project.experience?.description || project.education?.description || null;

  return (
    <div className="mx-auto max-w-[1180px] px-4 pb-16 sm:px-6">
      {fonts}
      <SlimMasthead fullName={ownerName} back={{ to: projectGroupHref(project.projectType), label: `Back to ${desk.title}` }} />

      <main>
        <article aria-labelledby="story-title">
          <header className="mx-auto max-w-[56rem] pt-10 text-center">
            <p className="text-bs-red italic">
              {desk.title}
              {project.isFeatured && <span className="font-semibold not-italic">, {EDITORS_PICK}</span>}
            </p>
            <h1 id="story-title" className="mt-2 text-[clamp(2.3rem,6.5vw,4.8rem)] leading-[1] font-bold tracking-[-0.02em] text-balance break-words">
              {project.title}
            </h1>
            {project.summary && (
              <p className="mx-auto mt-5 max-w-[44ch] text-[clamp(1.15rem,2.2vw,1.45rem)] leading-snug text-bs-grey italic">{project.summary}</p>
            )}
            <p className="mt-6 border-y border-bs-ink py-2 text-[0.95rem]">
              {ownerName && (
                <>
                  By <span className="font-semibold">{ownerName}</span>
                </>
              )}
              {filedFrom && <span className="text-bs-grey">{ownerName ? ", " : ""}filed from {filedFrom}</span>}
              {dates && <span className="text-bs-grey">. {dates}</span>}
            </p>
          </header>

          <figure className="mx-auto mt-8 max-w-[56rem]">
            <StoryPhoto project={project} className="aspect-[16/9]" isLazy={false} />
            <figcaption className="mt-2 border-b border-bs-rule pb-2 text-[0.88rem] text-bs-grey italic">
              {project.coverUrl ? project.title : "No photograph was filed with this story."}
            </figcaption>
          </figure>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_18rem]">
            <div className="min-w-0">
              {project.content ? (
                <Markdown className={markdownClass}>{project.content}</Markdown>
              ) : (
                <p className="max-w-[60ch] text-[1.08rem] leading-[1.65]">
                  This story runs as a brief. {project.summary} The fact box has the dates and the skills behind it.
                </p>
              )}
              <p aria-hidden="true" className="mt-6 text-center text-bs-grey">
                &#9632;
              </p>
            </div>

            <aside aria-labelledby="facts-title" className="h-fit border-t-4 border-bs-ink pt-3">
              <h2 id="facts-title" className="border-b border-bs-ink pb-2 text-xl font-bold">
                Fact box
              </h2>
              <dl>
                {dates && <Fact label="Dates">{dates}</Fact>}
                {linked && (
                  <Fact label={linked.kind === "experience" ? "Built at" : "Part of"}>
                    <span className="font-semibold">{linked.title}</span>
                    {linked.dates && <span className="block text-[0.95rem] text-bs-grey italic">{linked.dates}</span>}
                    {linkedDescription && <span className="mt-1 block text-[0.95rem] text-bs-grey">{linkedDescription}</span>}
                  </Fact>
                )}
                {project.skills.length > 0 && <Fact label="Filed under">{project.skills.join(", ")}</Fact>}
                {project.demoUrl && (
                  <Fact label="See it">
                    <a href={project.demoUrl}>Live demo of {project.title}</a>
                  </Fact>
                )}
                {project.repoUrl && (
                  <Fact label="Read the source">
                    <a href={project.repoUrl}>Source code of {project.title}</a>
                  </Fact>
                )}
              </dl>
            </aside>
          </div>
        </article>
      </main>
    </div>
  );
}
