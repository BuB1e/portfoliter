import { Link } from "react-router";

import { linkedName } from "~/lib/fields";
import { formatMonth } from "~/lib/format";
import type { Project } from "~/lib/portfolio";
import { projectPath, shortDescription } from "~/lib/projects";
import { Heart, likeHref } from "./ProfilePoster";

export const FEATURED_LABEL = "Featured";

export function plateId(slug: string): string {
  return `plate-${slug}`;
}

// The like for one project: an email to the owner that opens with the match, so it works without
// JavaScript. Null when the owner has no email.
export function projectLikeHref(email: string | null, title: string): string | null {
  return email ? likeHref(email, `It's a match: ${title}`) : null;
}

interface PlateProps {
  project: Project;
  nextId: string;
  email: string | null;
  ownerFirstName: string;
}

// A project with no photo gets the like it has not had yet: one big flat heart, cropped by the plate.
export function DrawnHeart() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" preserveAspectRatio="xMaxYMin meet" className="absolute -top-[8%] -right-[6%] h-[110%] w-[80%] text-dn-flame">
      <path
        d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 5.3 3.1 1.7-1.9 3.2-3.1 5.3-3.1 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z"
        fill="currentColor"
      />
    </svg>
  );
}

// One project as a full-screen photo plate, like one picture in a profile: the cover fills the panel and
// one solid card holds what it is, with Like (write to the owner about it) and Pass (on to the next one).
function Plate({ project, nextId, email, ownerFirstName }: PlateProps) {
  const from = linkedName(project);
  const dates = project.startDate ? [formatMonth(project.startDate), project.endDate && formatMonth(project.endDate)].filter(Boolean).join(" to ") : null;
  const like = projectLikeHref(email, project.title);

  return (
    <li id={plateId(project.slug)} className="relative flex min-h-[72svh] items-end overflow-hidden bg-dn-wine md:min-h-[78svh]">
      {project.coverUrl ? (
        <img src={project.coverUrl} alt={`Cover of ${project.title}`} loading="lazy" className="dn-plate-picture" />
      ) : (
        <DrawnHeart />
      )}

      <div data-reveal="" className="relative m-[var(--dn-margin)] w-full max-w-[460px] bg-dn-paper p-6 sm:p-8">
        <Link to={projectPath(project.slug)} className="dn-card-link">
          <span className="dn-card-title dn-lineup block font-extrabold">{project.title}</span>
          <span className="dn-small mt-2 block font-semibold text-dn-muted">
            {project.isFeatured && <span className="mr-2 text-dn-flame">{FEATURED_LABEL}</span>}
            {[from, dates].filter(Boolean).join(", ")}
          </span>
          <span className="mt-3 block">{shortDescription(project.summary)}</span>
        </Link>
        {project.skills.length > 0 && <p className="dn-small mt-3">{project.skills.join(", ")}</p>}
        <div className="mt-6 flex flex-wrap gap-3">
          {like && (
            <a href={like} className="dn-button" aria-label={`Like ${project.title} and write to ${ownerFirstName}`}>
              <Heart /> Like
            </a>
          )}
          <a href={`#${nextId}`} className="dn-button dn-button-quiet" aria-label={`Pass on ${project.title}`}>
            Pass
          </a>
        </div>
      </div>
    </li>
  );
}

interface ProjectPlatesProps {
  id: string;
  title: string;
  lede: string;
  projects: Project[];
  // Where Pass on the last plate goes: the next section.
  afterId: string;
  email: string | null;
  ownerFirstName: string;
}

export function ProjectPlates({ id, title, lede, projects, afterId, email, ownerFirstName }: ProjectPlatesProps) {
  return (
    <section aria-labelledby={id} className="dn-section">
      <div data-reveal="" className="dn-wrap grid gap-4 pb-10 md:grid-cols-12 md:items-end">
        <h2 id={id} className="dn-heading md:col-span-7">
          {title}
        </h2>
        <p className="max-w-[40ch] md:col-span-4 md:col-start-9">{lede}</p>
      </div>
      <ul>
        {projects.map((project, index) => (
          <Plate
            key={project.id}
            project={project}
            nextId={projects[index + 1] ? plateId(projects[index + 1].slug) : afterId}
            email={email}
            ownerFirstName={ownerFirstName}
          />
        ))}
      </ul>
    </section>
  );
}
