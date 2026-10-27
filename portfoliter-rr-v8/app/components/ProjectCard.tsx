import { Link } from "react-router";

import type { Project } from "~/lib/portfolio";
import { projectDates, projectPath, shortDescription } from "~/lib/projects";

// The whole card is one real link to the project page, so it works without JavaScript and in new tabs.
export function ProjectCard({ project }: { project: Project }) {
  const dates = projectDates(project);
  return (
    <Link
      to={projectPath(project.slug)}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-colors hover:border-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-500"
    >
      {project.coverUrl && (
        <img src={project.coverUrl} alt={`Cover of ${project.title}`} className="aspect-video w-full object-cover" loading="lazy" />
      )}
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-semibold group-hover:underline">{project.title}</h3>
        {dates && <p className="text-sm text-gray-500 dark:text-gray-400">{dates}</p>}
        {project.summary && <p className="mt-1 text-sm leading-relaxed">{shortDescription(project.summary)}</p>}
      </div>
    </Link>
  );
}
