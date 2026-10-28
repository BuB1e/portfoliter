import { useId } from "react";
import { Link } from "react-router";

import { Cover } from "~/components/shared/Cover";
import type { Project } from "~/lib/portfolio";
import { projectDates, projectPath, shortDescription } from "~/lib/projects";
import { type StatusTone, StatusPill } from "./StatusPill";

// A featured project is one of the owner's key services.
export const KEY_SERVICE_LABEL = "Key service";

// Where a service runs, from the job or school embedded in the project.
export function environment(project: Project): string {
  if (project.projectType === "PERSONAL") {
    return "Side project";
  }
  if (project.projectType === "UNIVERSITY") {
    return project.education ? `Campus at ${project.education.institution}` : "Campus";
  }
  return project.experience ? `Production at ${project.experience.company}` : "Production";
}

// Finished university work is "Completed"; anything else with an end date was retired.
export function serviceStatus(project: Project): { tone: StatusTone; label: string } {
  if (!project.endDate) {
    return { tone: "up", label: "Operational" };
  }
  return { tone: "muted", label: project.projectType === "UNIVERSITY" ? "Completed" : "Retired" };
}

function Service({ project }: { project: Project }) {
  const titleId = useId();
  const descriptionId = useId();
  const status = serviceStatus(project);
  const dates = projectDates(project);
  return (
    <Link
      to={projectPath(project.slug)}
      aria-labelledby={titleId}
      aria-describedby={project.summary ? descriptionId : undefined}
      className="group flex gap-4 px-5 py-5 no-underline transition-colors hover:bg-st-bg"
    >
      <Cover
        url={project.coverUrl}
        title={project.title}
        className="hidden size-20 flex-none rounded-lg border border-st-line object-cover sm:block"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 id={titleId} className="text-lg font-semibold group-hover:text-st-info group-hover:underline">
            {project.title}
          </h3>
          <span className="flex flex-wrap gap-2">
            {project.isFeatured && <StatusPill tone="info" label={KEY_SERVICE_LABEL} />}
            <StatusPill tone={status.tone} label={status.label} />
          </span>
        </div>
        <p className="text-sm text-st-muted">{[environment(project), dates].filter(Boolean).join(", ")}</p>
        {project.summary && (
          <p id={descriptionId} className="mt-2 max-w-[65ch]">
            {shortDescription(project.summary)}
          </p>
        )}
        {project.skills.length > 0 && <p className="mt-2 text-sm text-st-muted">Depends on {project.skills.join(", ")}</p>}
        <span aria-hidden="true" className="mt-2 inline-block text-sm font-medium text-st-info">
          View status details
        </span>
      </div>
    </Link>
  );
}

export function ServiceList({ projects }: { projects: Project[] }) {
  return (
    <ul className="divide-y divide-st-line [&>li:first-child>a]:rounded-t-xl [&>li:last-child>a]:rounded-b-xl">
      {projects.map((project) => (
        <li key={project.id}>
          <Service project={project} />
        </li>
      ))}
    </ul>
  );
}
