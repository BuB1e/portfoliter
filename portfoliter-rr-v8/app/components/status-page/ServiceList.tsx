import { formatRange } from "~/lib/format";
import type { Project } from "~/lib/portfolio";
import { StatusPill } from "./StatusPill";

interface ServiceListProps {
  projects: Project[];
  companyById: Record<number, string>;
}

function environment(project: Project, companyById: Record<number, string>): string {
  if (project.projectType === "PERSONAL") {
    return "Side project";
  }
  const company = project.experienceId ? companyById[project.experienceId] : undefined;
  return company ? `Production at ${company}` : "Production";
}

export function ServiceList({ projects, companyById }: ServiceListProps) {
  return (
    <ul className="divide-y divide-st-line">
      {projects.map((project) => (
        <li key={project.id} className="px-5 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">{project.title}</h3>
            {project.endDate ? <StatusPill tone="muted" label="Retired" /> : <StatusPill tone="up" label="Operational" />}
          </div>
          <p className="text-sm text-st-muted">
            {environment(project, companyById)}
            {project.startDate ? `, ${formatRange(project.startDate, project.endDate)}` : ""}
          </p>
          {project.summary && <p className="mt-2 max-w-[65ch]">{project.summary}</p>}
          {project.skills.length > 0 && <p className="mt-2 text-sm text-st-muted">Depends on {project.skills.join(", ")}</p>}
          {(project.repoUrl || project.demoUrl) && (
            <p className="mt-2 flex gap-4 text-sm font-medium">
              {project.demoUrl && <a href={project.demoUrl} className="text-st-info">Open service</a>}
              {project.repoUrl && <a href={project.repoUrl} className="text-st-info">Source</a>}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
