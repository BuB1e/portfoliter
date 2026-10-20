import { formatRange } from "~/lib/format";
import type { Project } from "~/lib/portfolio";

interface SpecProjectsProps {
  projects: Project[];
  companyById: Record<number, string>;
}

function context(project: Project, companyById: Record<number, string>): string {
  const where =
    project.projectType === "WORK" && project.experienceId
      ? `Work at ${companyById[project.experienceId] ?? "a company"}`
      : project.projectType === "WORK"
        ? "Work"
        : "Personal";
  return project.startDate ? `${where}, ${formatRange(project.startDate, project.endDate)}` : where;
}

export function SpecProjects({ projects, companyById }: SpecProjectsProps) {
  return (
    <ul className="divide-y divide-ss-rule">
      {projects.map((project) => (
        <li key={project.id} className="grid gap-1 py-6 first:pt-0 last:pb-0 sm:grid-cols-[1fr_auto] sm:gap-x-8">
          <div>
            <h3 className="flex flex-wrap items-baseline gap-x-3 text-xl font-semibold">
              {project.title}
              {project.isFeatured && <span className="text-[0.85rem] font-medium text-ss-blue">Selected work</span>}
            </h3>
            <p className="text-[0.95rem] text-ss-muted">{context(project, companyById)}</p>
            {project.summary && <p className="mt-2 max-w-[65ch] leading-relaxed">{project.summary}</p>}
            {project.skills.length > 0 && <p className="mt-2 text-[0.95rem] text-ss-muted">{project.skills.join(", ")}</p>}
          </div>
          {(project.repoUrl || project.demoUrl) && (
            <div className="flex gap-5 pt-1 text-[0.95rem] font-medium sm:flex-col sm:items-end sm:gap-1">
              {project.demoUrl && <a href={project.demoUrl} className="text-ss-blue">Live site</a>}
              {project.repoUrl && <a href={project.repoUrl} className="text-ss-blue">Source</a>}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
