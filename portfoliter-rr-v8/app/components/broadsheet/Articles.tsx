import { useId } from "react";
import { Link } from "react-router";

import type { Education, Experience, Project } from "~/lib/portfolio";
import { findEducation, findExperience, projectDates, projectPath, shortDescription } from "~/lib/projects";

// The kicker over a headline: the newsroom the story came from.
export function storyDesk(project: Project, experience: Experience | null, education: Education | null): string {
  if (experience) {
    return `${experience.role}, ${experience.company}`;
  }
  if (education) {
    return education.institution;
  }
  return project.projectType === "PERSONAL" ? "Side project" : "";
}

// The story's photograph in one ink, or a halftone panel with the headline's initial when none was filed.
export function StoryPhoto({ project, className = "" }: { project: Project; className?: string }) {
  if (project.coverUrl) {
    return <img src={project.coverUrl} alt={`Photograph for ${project.title}`} className={`bs-photo w-full object-cover ${className}`} loading="lazy" />;
  }
  return (
    <div aria-hidden="true" className={`bs-halftone grid w-full place-items-center font-bs-nameplate text-7xl ${className}`}>
      {project.title.charAt(0)}
    </div>
  );
}

function Story({ project, desk, isLead }: { project: Project; desk: string; isLead: boolean }) {
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
              Editor&apos;s pick
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

interface ArticlesProps {
  projects: Project[];
  experiences: Experience[];
  education: Education[];
}

// Stories in ruled columns; the first one leads across two columns on wide screens. The list starts
// 1.25rem to the left inside a clipping box, so the first column's rule is cut off; the box keeps
// 0.5rem of room on every side so focus outlines are not.
export function Articles({ projects, experiences, education }: ArticlesProps) {
  return (
    <div className="-m-2 overflow-hidden p-2">
      <ul className="-mx-5 grid gap-y-10 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, index) => {
          const isLead = index === 0 && projects.length > 1;
          return (
            <li key={project.id} className={`min-w-0 border-l border-bs-rule px-5 ${isLead ? "md:col-span-2" : ""}`}>
              <Story
                project={project}
                desk={storyDesk(project, findExperience(project, experiences), findEducation(project, education))}
                isLead={isLead}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
