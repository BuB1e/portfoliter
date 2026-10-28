import { useId } from "react";
import { Link } from "react-router";

import type { Project } from "~/lib/portfolio";
import { projectDates, projectPath, shortDescription } from "~/lib/projects";
import { ProjectIcon } from "./Icons";

// The "made at" line of a file: the job or the school the backend embeds, or nothing for side projects.
export function fileOrigin(project: Pick<Project, "experience" | "education">): string {
  if (project.experience) {
    return `${project.experience.role}, ${project.experience.company}`;
  }
  return project.education ? project.education.institution : "";
}

function FileTile({ project }: { project: Project }) {
  const origin = fileOrigin(project);
  const pinId = useId();
  const titleId = useId();
  const descriptionId = useId();
  const dates = projectDates(project);
  return (
    <Link
      to={projectPath(project.slug)}
      aria-labelledby={project.isFeatured ? `${titleId} ${pinId}` : titleId}
      aria-describedby={project.summary ? descriptionId : undefined}
      className="group flex h-full gap-3 p-2 text-rd-dark no-underline hover:bg-rd-title/10"
    >
      <ProjectIcon project={project} />
      <div className="min-w-0">
        <h3 id={titleId} className="leading-tight font-bold break-words">
          <span className="px-0.5 group-hover:bg-rd-title group-hover:text-white group-focus-visible:bg-rd-title group-focus-visible:text-white">
            {project.title}
          </span>
        </h3>
        {project.isFeatured && (
          <p id={pinId} className="mt-0.5 font-rd-pixel text-[0.8rem] text-rd-title">
            Pinned
          </p>
        )}
        {(origin || dates) && <p className="mt-0.5 text-[0.88rem] text-rd-muted">{[origin, dates].filter(Boolean).join(". ")}</p>}
        {project.summary && (
          <p id={descriptionId} className="mt-1 text-[0.95rem] leading-snug">
            {shortDescription(project.summary)}
          </p>
        )}
        {project.skills.length > 0 && <p className="mt-1 text-[0.85rem] text-rd-muted">{project.skills.join(", ")}</p>}
      </div>
    </Link>
  );
}

// A folder's contents in tiles view, inside the white sunken pane of the folder window.
export function FileTiles({ projects }: { projects: Project[] }) {
  return (
    <ul className="rd-sunken grid gap-1 bg-white p-2 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <li key={project.id} className="min-w-0">
          <FileTile project={project} />
        </li>
      ))}
    </ul>
  );
}
