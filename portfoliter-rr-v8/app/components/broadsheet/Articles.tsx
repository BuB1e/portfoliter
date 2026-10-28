import { useId } from "react";
import { Link } from "react-router";

import { Cover } from "~/components/shared/Cover";
import type { Project } from "~/lib/portfolio";
import { projectDates, projectPath, shortDescription } from "~/lib/projects";

export const EDITORS_PICK = "Editor's pick";

// The kicker over a headline: the newsroom the story came from.
export function storyDesk(project: Project): string {
  if (project.experience) {
    return `${project.experience.role}, ${project.experience.company}`;
  }
  if (project.education) {
    return project.education.institution;
  }
  return project.projectType === "PERSONAL" ? "Side project" : "";
}

// The story's photograph in one ink, or a halftone panel with the headline's initial when none was filed.
export function StoryPhoto({ project, className = "", isLazy = true }: { project: Project; className?: string; isLazy?: boolean }) {
  return (
    <Cover
      url={project.coverUrl}
      title={project.title}
      className={`bs-photo w-full object-cover ${className}`}
      isLazy={isLazy}
      fallback={
        <div aria-hidden="true" className={`bs-halftone grid w-full place-items-center font-bs-nameplate text-7xl ${className}`}>
          {project.title.charAt(0)}
        </div>
      }
    />
  );
}

function Story({ project, isLead }: { project: Project; isLead: boolean }) {
  const desk = storyDesk(project);
  const pickId = useId();
  const titleId = useId();
  const descriptionId = useId();
  const dates = projectDates(project);
  return (
    <Link
      to={projectPath(project.slug)}
      aria-labelledby={project.isFeatured ? `${titleId} ${pickId}` : titleId}
      aria-describedby={project.summary ? descriptionId : undefined}
      className={`group grid gap-4 no-underline ${isLead ? "md:grid-cols-[3fr_2fr] md:gap-6" : ""}`}
    >
      <StoryPhoto project={project} className={isLead ? "aspect-[4/3] md:order-2" : "aspect-[3/2]"} />
      <div className="min-w-0">
        <p className="text-[0.92rem] text-bs-red italic">
          {project.isFeatured && (
            <span id={pickId} className="mr-2 font-semibold not-italic">
              {EDITORS_PICK}
            </span>
          )}
          {desk}
        </p>
        <h3
          id={titleId}
          className={`mt-1 leading-[1.08] font-bold tracking-[-0.01em] text-balance break-words group-hover:underline ${
            isLead ? "text-[clamp(1.7rem,3.4vw,2.5rem)]" : "text-[1.45rem]"
          }`}
        >
          {project.title}
        </h3>
        {project.summary && (
          <p id={descriptionId} className="mt-2 text-[1.02rem] leading-[1.55]">
            {dates && <span className="font-semibold">{dates}. </span>}
            {shortDescription(project.summary)}
          </p>
        )}
        {!project.summary && dates && <p className="mt-2 font-semibold">{dates}</p>}
        {project.skills.length > 0 && <p className="mt-2 text-[0.9rem] text-bs-grey">Filed under {project.skills.join(", ")}</p>}
        <p aria-hidden="true" className="mt-2 text-[0.9rem] italic group-hover:underline">
          Full story inside
        </p>
      </div>
    </Link>
  );
}

// Stories in ruled columns; the first one leads across two columns on wide screens. The list starts
// 1.25rem to the left inside a clipping box, so the first column's rule is cut off; the box keeps
// 0.5rem of room on every side so focus outlines are not.
export function Articles({ projects }: { projects: Project[] }) {
  return (
    <div className="-m-2 overflow-hidden p-2">
      <ul className="-mx-5 grid gap-y-10 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, index) => {
          const isLead = index === 0 && projects.length > 1;
          return (
            <li key={project.id} className={`min-w-0 border-l border-bs-rule px-5 ${isLead ? "md:col-span-2" : ""}`}>
              <Story project={project} isLead={isLead} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
