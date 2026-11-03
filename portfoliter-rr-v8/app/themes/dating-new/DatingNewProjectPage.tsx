import { Link } from "react-router";

import { QuietFooter } from "~/components/dating-new/MatchCard";
import { Heart, TopBar } from "~/components/dating-new/ProfilePoster";
import { DrawnHeart, FEATURED_LABEL, ProjectPlates, projectLikeHref } from "~/components/dating-new/ProjectPlates";
import { Markdown, markdownBase } from "~/components/Markdown";
import { useReveal } from "~/hooks/useReveal";
import { linkedLine } from "~/lib/fields";
import { firstName } from "~/lib/format";
import { projectDates, projectGroupHref } from "~/lib/projects";
import type { ThemeProjectPageProps } from "../types";
import { DECKS, FONTS_HREF } from "./DatingNewPage";

const MAX_NEIGHBOURS = 2;

const markdownClass =`${markdownBase} max-w-[68ch] text-[1.25rem] leading-relaxed [&_a]:font-bold [&_code]:bg-dn-surface [&_code]:px-1 [&_pre]:bg-dn-surface [&_blockquote]:border-dn-flame`;

// One project as its own profile photo: the cover fills the first screen with the card on it, then the
// whole story in one reading column.
export function DatingNewProjectPage({ portfolio, project }: ThemeProjectPageProps) {
  useReveal();
  const fonts = <link rel="stylesheet" href={FONTS_HREF} precedence="default" />;

  if (!project) {
    return (
      <div className="dn-page">
        {fonts}
        <TopBar />
        <main className="dn-wrap grid min-h-[70svh] place-content-center justify-items-center gap-6 text-center">
          <h1 className="dn-heading">This profile was deleted</h1>
          <p className="max-w-[40ch]">No project here. It may never have existed, or it is still a draft.</p>
          <Link to="/" className="dn-button">
            Back to swiping
          </Link>
        </main>
      </div>
    );
  }

  const deck = DECKS[project.projectType];
  const linked = linkedLine(project);
  const dates = projectDates(project);
  const email = portfolio?.profile.email ?? null;
  const owner = portfolio ? firstName(portfolio.profile.fullName) : "the owner";
  const like = projectLikeHref(email, project.title);
  const neighbours = (portfolio?.projects ?? [])
    .filter((other) => other.projectType === project.projectType && other.id !== project.id)
    .slice(0, MAX_NEIGHBOURS);

  return (
    <div id="top" className="dn-page">
      {fonts}
      <TopBar tagline={deck.title} />
      <header className="relative flex min-h-[82svh] items-end overflow-hidden bg-dn-wine md:min-h-[88svh]">
        {project.coverUrl ? (
          <img src={project.coverUrl} alt={`Cover of ${project.title}`} className="dn-plate-picture" />
        ) : (
          <DrawnHeart />
        )}
        <div data-reveal="" className="relative m-[var(--dn-margin)] w-full max-w-[560px] bg-dn-paper p-6 sm:p-10">
          <h1 data-reveal="" style={{ "--i": 1 } as React.CSSProperties} className="dn-heading">
            {project.title}
          </h1>
          {(project.isFeatured || dates) && (
            <p className="dn-small mt-3 font-semibold text-dn-muted">
              {project.isFeatured && <span className="mr-2 text-dn-flame">{FEATURED_LABEL}</span>}
              {dates && `Together ${dates}`}
            </p>
          )}
          {linked && (
            <p className="dn-small mt-1 font-semibold text-dn-muted">
              {linked.kind === "experience" ? "Met at work: " : "Met at school: "}
              {linked.label}
            </p>
          )}
          <p className="mt-4">{project.summary}</p>
          {project.skills.length > 0 && <p className="dn-small mt-3">Into: {project.skills.join(", ")}</p>}
          <div data-reveal="" style={{ "--i": 2 } as React.CSSProperties} className="mt-6 flex flex-wrap items-center gap-3">
            {like && (
              <a href={like} className="dn-button">
                <Heart /> Like, and tell {owner}
              </a>
            )}
            {project.demoUrl && (
              <a href={project.demoUrl} className="dn-button dn-button-quiet">
                Meet in person (demo)
              </a>
            )}
            {project.repoUrl && (
              <a href={project.repoUrl} className="dn-link">
                Read the source
              </a>
            )}
            <Link to={projectGroupHref(project.projectType)} className="dn-link">
              Back to my {deck.title.toLowerCase()}
            </Link>
          </div>
        </div>
      </header>

      <main>
        {project.content && (
          <section aria-labelledby="story-title" className="dn-section dn-wrap grid gap-6 md:grid-cols-12">
            <h2 id="story-title" data-reveal="" className="dn-heading md:col-span-4">
              Our story
            </h2>
            <div data-reveal="" style={{ "--i": 1 } as React.CSSProperties} className="md:col-span-8 md:col-start-5">
              <Markdown className={markdownClass}>{project.content}</Markdown>
            </div>
          </section>
        )}
        {neighbours.length > 0 && (
          <ProjectPlates
            id="more-title"
            title="More matches"
            lede={deck.lede}
            projects={neighbours}
            afterId="top"
            email={email}
            ownerFirstName={owner}
          />
        )}
      </main>

      {portfolio && <QuietFooter fullName={portfolio.profile.fullName} links={portfolio.links} />}
    </div>
  );
}
