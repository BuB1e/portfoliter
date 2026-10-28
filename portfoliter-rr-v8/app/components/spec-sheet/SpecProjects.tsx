import { useId } from "react";
import { Link } from "react-router";

import { Cover } from "~/components/shared/Cover";
import { linkedName } from "~/lib/fields";
import type { Project } from "~/lib/portfolio";
import { projectDates, projectPath, shortDescription } from "~/lib/projects";

export const FEATURED_LABEL = "Selected work";

// "Work at Acme, Jan 2024 to now", "Personal", "University, Porto Polytechnic, Sep 2021 to Jun 2022"
export function specContext(project: Project): string {
  const linked = linkedName(project);
  const where = {
    WORK: linked ? `Work at ${linked}` : "Work",
    PERSONAL: "Personal",
    UNIVERSITY: linked ? `University, ${linked}` : "University",
  }[project.projectType];
  const dates = projectDates(project);
  return dates ? `${where}, ${dates}` : where;
}

function SpecProject({ project }: { project: Project }) {
  const titleId = useId();
  const descriptionId = useId();
  return (
    <Link
      to={projectPath(project.slug)}
      aria-labelledby={titleId}
      aria-describedby={project.summary ? descriptionId : undefined}
      className="group grid gap-1 py-6 no-underline sm:grid-cols-[1fr_auto] sm:gap-x-8"
    >
      <div className="min-w-0">
        <h3 id={titleId} className="flex flex-wrap items-baseline gap-x-3 text-xl font-semibold group-hover:underline">
          {project.title}
          {project.isFeatured && <span className="text-[0.85rem] font-medium text-ss-blue">{FEATURED_LABEL}</span>}
        </h3>
        <p className="text-[0.95rem] text-ss-muted">{specContext(project)}</p>
        {project.summary && (
          <p id={descriptionId} className="mt-2 max-w-[65ch] leading-relaxed">
            {shortDescription(project.summary)}
          </p>
        )}
        {project.skills.length > 0 && <p className="mt-2 text-[0.95rem] text-ss-muted">{project.skills.join(", ")}</p>}
      </div>
      <div className="flex flex-col items-start gap-3 pt-1 sm:items-end">
        <Cover url={project.coverUrl} title={project.title} className="order-first mt-3 aspect-[4/3] w-40 border border-ss-rule object-cover sm:mt-0" />
        <span aria-hidden="true" className="text-[0.95rem] font-medium text-ss-blue group-hover:underline">
          Full spec
        </span>
      </div>
    </Link>
  );
}

export function SpecProjects({ projects }: { projects: Project[] }) {
  return (
    <ul className="divide-y divide-ss-rule [&>li:first-child>a]:pt-0 [&>li:last-child>a]:pb-0">
      {projects.map((project) => (
        <li key={project.id}>
          <SpecProject project={project} />
        </li>
      ))}
    </ul>
  );
}
