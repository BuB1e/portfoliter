import { Link } from "react-router";

import { Cover } from "~/components/shared/Cover";
import { linkedName } from "~/lib/fields";
import { LABELS } from "~/lib/labels";
import type { Project } from "~/lib/portfolio";
import { projectDates, projectPath, shortDescription } from "~/lib/projects";

// The whole card is one real link to the project page, so it works without JavaScript and in new tabs.
export function ProjectCard({ project }: { project: Project }) {
  const dates = projectDates(project);
  const linked = linkedName(project);
  return (
    <Link
      to={projectPath(project.slug)}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-colors hover:border-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-500"
    >
      <Cover url={project.coverUrl} title={project.title} className="aspect-video w-full object-cover" />
      <div className="flex flex-1 flex-col gap-1 p-4">
        {project.isFeatured && <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">{LABELS.featured}</p>}
        <h3 className="font-semibold group-hover:underline">{project.title}</h3>
        {(dates || linked) && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{[linked, dates].filter(Boolean).join(", ")}</p>
        )}
        {project.summary && <p className="mt-1 text-sm leading-relaxed">{shortDescription(project.summary)}</p>}
        {project.skills.length > 0 && <p className="mt-auto pt-2 text-xs text-gray-600 dark:text-gray-400">{project.skills.join(", ")}</p>}
      </div>
    </Link>
  );
}
