import { useId } from "react";
import { Link } from "react-router";

import type { Education, Experience, Project } from "~/lib/portfolio";
import { findEducation, findExperience, projectDates, projectPath, shortDescription } from "~/lib/projects";
import { type StatusTone, StatusPill } from "./StatusPill";

export function environment(project: Project, experience: Experience | null, education: Education | null): string {
  if (project.projectType === "PERSONAL") {
    return "Side project";
  }
  if (project.projectType === "UNIVERSITY") {
    return education ? `Campus at ${education.institution}` : "Campus";
  }
  return experience ? `Production at ${experience.company}` : "Production";
}

// Finished university work is "Completed"; anything else with an end date was retired.
export function serviceStatus(project: Project): { tone: StatusTone; label: string } {
  if (!project.endDate) {
    return { tone: "up", label: "Operational" };
  }
  return { tone: "muted", label: project.projectType === "UNIVERSITY" ? "Completed" : "Retired" };
}

function Service({ project, env }: { project: Project; env: string }) {
  const titleId = useId();
  const descriptionId = useId();
  const status = serviceStatus(project);
  const dates = projectDates(project);
  return (
    <Link
      to={projectPath(project.slug)}
      aria-labelledby={titleId}
      aria-describedby={project.summary ? descriptionId : undefined}
      className="group block px-5 py-5 no-underline transition-colors hover:bg-st-bg"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 id={titleId} className="text-lg font-semibold group-hover:text-st-info group-hover:underline">
          {project.title}
        </h3>
        <StatusPill tone={status.tone} label={status.label} />
      </div>
      <p className="text-sm text-st-muted">
        {env}
        {dates ? `, ${dates}` : ""}
      </p>
      {project.summary && (
        <p id={descriptionId} className="mt-2 max-w-[65ch]">
          {shortDescription(project.summary)}
        </p>
      )}
      {project.skills.length > 0 && <p className="mt-2 text-sm text-st-muted">Depends on {project.skills.join(", ")}</p>}
      <span aria-hidden="true" className="mt-2 inline-block text-sm font-medium text-st-info">
        View status details
      </span>
    </Link>
  );
}

interface ServiceListProps {
  projects: Project[];
  experiences: Experience[];
  education: Education[];
}

export function ServiceList({ projects, experiences, education }: ServiceListProps) {
  return (
    <ul className="divide-y divide-st-line [&>li:first-child>a]:rounded-t-xl [&>li:last-child>a]:rounded-b-xl">
      {projects.map((project) => (
        <li key={project.id}>
          <Service project={project} env={environment(project, findExperience(project, experiences), findEducation(project, education))} />
        </li>
      ))}
    </ul>
  );
}
