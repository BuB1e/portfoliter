import { useId } from "react";
import { Link } from "react-router";

import type { Education, Experience, Project } from "~/lib/portfolio";
import { findEducation, findExperience, projectDates, projectPath, shortDescription } from "~/lib/projects";

interface SpecProjectsProps {
  projects: Project[];
  experiences: Experience[];
  education: Education[];
}

// "Work at Acme, Jan 2024 to now", "Personal", "University, Kasetsart University, ..."
export function specContext(project: Project, experience: Experience | null, education: Education | null): string {
  const where = {
    WORK: experience ? `Work at ${experience.company}` : "Work",
    PERSONAL: "Personal",
    UNIVERSITY: education ? `University, ${education.institution}` : "University",
  }[project.projectType];
  const dates = projectDates(project);
  return dates ? `${where}, ${dates}` : where;
}

function SpecProject({ project, context }: { project: Project; context: string }) {
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
          {project.isFeatured && <span className="text-[0.85rem] font-medium text-ss-blue">Selected work</span>}
        </h3>
        <p className="text-[0.95rem] text-ss-muted">{context}</p>
        {project.summary && (
          <p id={descriptionId} className="mt-2 max-w-[65ch] leading-relaxed">
            {shortDescription(project.summary)}
          </p>
        )}
        {project.skills.length > 0 && <p className="mt-2 text-[0.95rem] text-ss-muted">{project.skills.join(", ")}</p>}
      </div>
      <span aria-hidden="true" className="pt-1 text-[0.95rem] font-medium text-ss-blue group-hover:underline">
        Full spec
      </span>
    </Link>
  );
}

export function SpecProjects({ projects, experiences, education }: SpecProjectsProps) {
  return (
    <ul className="divide-y divide-ss-rule [&>li:first-child>a]:pt-0 [&>li:last-child>a]:pb-0">
      {projects.map((project) => (
        <li key={project.id}>
          <SpecProject
            project={project}
            context={specContext(project, findExperience(project, experiences), findEducation(project, education))}
          />
        </li>
      ))}
    </ul>
  );
}
