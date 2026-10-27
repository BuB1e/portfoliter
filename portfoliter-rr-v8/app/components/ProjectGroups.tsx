import type { Project } from "~/lib/portfolio";
import { groupProjects, PROJECT_GROUP_LABELS } from "~/lib/projects";
import { ProjectCard } from "./ProjectCard";

// Work, Personal and University projects as three sections; empty groups are not rendered.
export function ProjectGroups({ projects }: { projects: Project[] }) {
  return groupProjects(projects).map((group) => {
    const headingId = `projects-${group.type.toLowerCase()}`;
    return (
      <section key={group.type} aria-labelledby={headingId} className="space-y-3">
        <h2 id={headingId} className="text-xl font-semibold">
          {PROJECT_GROUP_LABELS[group.type]} projects
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {group.projects.map((project) => (
            <li key={project.id}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      </section>
    );
  });
}
