import { Link } from "react-router";

import { FeedSection } from "~/components/dating/FeedSection";
import { datingCover, metAt, TYPE_CHIPS } from "~/components/dating/SwipeCard";
import { Markdown, markdownBase } from "~/components/Markdown";
import { Cover } from "~/components/shared/Cover";
import { linkedLine } from "~/lib/fields";
import { firstName } from "~/lib/format";
import { LABELS } from "~/lib/labels";
import { projectDates, projectGroupHref } from "~/lib/projects";
import type { ThemeProjectPageProps } from "../types";
import { DECKS, FONTS_HREF, TopBar } from "./DatingPage";

const markdownClass = `${markdownBase} rounded-[22px] bg-night-raised px-6 py-6 text-[1.05rem] leading-relaxed [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:tracking-tight [&_h3]:font-bold [&_li]:marker:text-flame [&_strong]:text-lilac [&_code]:rounded [&_code]:bg-night [&_code]:px-1 [&_pre]:rounded-xl [&_pre]:bg-night [&_a]:text-mint`;

const pill = "rounded-full px-4 py-2.5 text-[0.95rem] font-bold no-underline";

// A project as a dating profile: the photo card on the left, its prompts and interests on the right.
export function DatingProjectPage({ portfolio, project }: ThemeProjectPageProps) {
  const fonts = <link rel="stylesheet" href={FONTS_HREF} precedence="default" />;

  if (!project) {
    return (
      <>
        {fonts}
        <TopBar tagline="Profile not found" />
        <main className="mx-auto grid max-w-[1120px] justify-items-center gap-5 px-4 py-24 text-center">
          <h1 className="text-[clamp(2.4rem,7vw,4rem)] leading-none font-extrabold tracking-tighter">This profile has left the app</h1>
          <p className="max-w-[44ch] opacity-80">It does not exist, or it has not been published yet. Plenty of other projects to swipe on.</p>
          <Link to="/" className={`${pill} bg-flame text-white`}>
            Back to swiping
          </Link>
        </main>
      </>
    );
  }

  const deck = DECKS[project.projectType];
  const dates = projectDates(project);
  const email = portfolio?.profile.email ?? null;
  const owner = portfolio ? firstName(portfolio.profile.fullName) : null;
  const linked = linkedLine(project);
  const linkedDescription = project.experience?.description || project.education?.description;

  return (
    <>
      {fonts}
      <TopBar tagline="It's a match, probably" />
      <div className="mx-auto grid max-w-[1120px] items-start gap-10 px-4 pt-4 pb-20 md:grid-cols-[minmax(300px,420px)_1fr]">
        <aside className="overflow-hidden rounded-[28px] bg-card text-ink md:sticky md:top-5">
          <div className="relative aspect-[4/5]" style={{ background: datingCover(project) }}>
            <Cover url={project.coverUrl} title={project.title} className="absolute inset-0 size-full object-cover" isLazy={false} />
            <span className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-ink py-1.5 pr-3 pl-2.5 text-sm text-card">
              <span aria-hidden="true" className={`size-2.5 rounded-full ${project.endDate ? "bg-lilac" : "bg-mint"}`} />
              {project.endDate ? "Taking a break" : "Active now"}
            </span>
          </div>
          <div className="px-6 pt-5 pb-6">
            <h1 className="text-[clamp(2.1rem,5vw,2.8rem)] leading-none font-extrabold tracking-tight break-words">{project.title}</h1>
            <p className="mt-1.5 mb-4 text-[0.95rem] text-muted">
              {metAt(project)}
              {dates ? `, ${dates}` : ""}
            </p>
            <ul aria-label="Looking for" className="mb-6 flex flex-wrap gap-2">
              <li className="rounded-full border-[1.5px] border-ink px-3 py-0.5 text-sm">{TYPE_CHIPS[project.projectType]}</li>
              {project.isFeatured && <li className="rounded-full border-[1.5px] border-ink px-3 py-0.5 text-sm">{LABELS.featured}</li>}
            </ul>
            <div className="flex flex-wrap gap-2.5">
              {email && (
                <a href={`mailto:${email}?subject=${encodeURIComponent(`About ${project.title}`)}`} className={`${pill} bg-flame text-white`}>
                  Ask {owner ?? "me"} about it
                </a>
              )}
              {project.demoUrl && (
                <a href={project.demoUrl} className={`${pill} border-[1.5px] border-ink`}>
                  Try it
                </a>
              )}
              {project.repoUrl && (
                <a href={project.repoUrl} className={`${pill} border-[1.5px] border-ink`}>
                  See the code
                </a>
              )}
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <nav aria-label="Breadcrumb" className="mb-10">
            <Link to={projectGroupHref(project.projectType)} className="rounded-full border-[1.5px] border-lilac px-4 py-2 font-bold no-underline hover:bg-night-raised">
              {deck.back}
            </Link>
          </nav>
          {project.summary && (
            <div className="mb-10 rounded-[22px] bg-night-raised px-6 pt-5 pb-6">
              <p className="mb-1 text-[0.95rem] opacity-75">My elevator pitch</p>
              <p className="text-[clamp(1.4rem,2.6vw,1.9rem)] leading-tight font-semibold tracking-tight">{project.summary}</p>
            </div>
          )}
          <FeedSection id="story-title" title="The long version" lede="Everything you would ask on a second date.">
            {project.content ? (
              <Markdown className={markdownClass}>{project.content}</Markdown>
            ) : (
              <p className="opacity-80">Still writing this part. Mysterious, right?</p>
            )}
          </FeedSection>
          {project.skills.length > 0 && (
            <FeedSection id="interests-title" title="Interests" lede="What this project is made of.">
              <ul className="flex flex-wrap gap-2.5">
                {project.skills.map((skill) => (
                  <li key={skill} className="rounded-full border-[1.5px] border-lilac px-4 py-1.5 font-semibold">
                    {skill}
                  </li>
                ))}
              </ul>
            </FeedSection>
          )}
          {linked && (
            <FeedSection id="met-title" title="Where we met" lede="Every good story has a setting.">
              <div className="rounded-[22px] bg-night-raised px-6 pt-5 pb-6">
                <p className="text-xl font-semibold">{linked.title}</p>
                {linked.dates && <p className="mt-0.5 text-[0.95rem] opacity-75">{linked.dates}</p>}
                {linkedDescription && <p className="mt-2 opacity-80">{linkedDescription}</p>}
              </div>
            </FeedSection>
          )}
        </main>
      </div>
    </>
  );
}
