import { Link } from "react-router";

import { Markdown } from "~/components/Markdown";
import { Cover } from "~/components/shared/Cover";
import { linkedLine } from "~/lib/fields";
import { LABELS } from "~/lib/labels";
import { PROJECT_GROUP_LABELS, projectDates, projectGroupHref } from "~/lib/projects";
import type { ThemeProjectPageProps } from "../types";

const markdownClass =
  "space-y-4 leading-relaxed [&_a]:underline [&_code]:font-mono [&_code]:text-sm [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:font-semibold [&_li]:mt-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_pre]:overflow-x-auto [&_ul]:list-disc [&_ul]:pl-6";

const backLinkClass = "text-sm underline underline-offset-2";

export function PlainProjectPage({ project }: ThemeProjectPageProps) {
  if (!project) {
    return (
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold">Project not found</h1>
        <p>This project does not exist or is not published yet.</p>
        <Link to="/" className={backLinkClass}>
          Back to all projects
        </Link>
      </main>
    );
  }

  const dates = projectDates(project);
  const linked = linkedLine(project);
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      <Link to={projectGroupHref(project.projectType)} className={backLinkClass}>
        Back to {PROJECT_GROUP_LABELS[project.projectType].toLowerCase()} projects
      </Link>
      <header className="space-y-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {[`${PROJECT_GROUP_LABELS[project.projectType]} project`, dates, project.isFeatured ? LABELS.featured : null]
            .filter(Boolean)
            .join(", ")}
        </p>
        <h1 className="text-3xl font-bold">{project.title}</h1>
        {project.summary && <p className="text-lg">{project.summary}</p>}
      </header>
      <Cover url={project.coverUrl} title={project.title} className="w-full rounded-lg" isLazy={false} />
      {project.content && <Markdown className={markdownClass}>{project.content}</Markdown>}
      <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[max-content_1fr]">
        {linked && (
          <>
            <dt className="font-semibold">{linked.kind === "experience" ? "Built at" : "Part of"}</dt>
            <dd>{linked.label}</dd>
          </>
        )}
        {project.skills.length > 0 && (
          <>
            <dt className="font-semibold">Skills</dt>
            <dd>{project.skills.join(", ")}</dd>
          </>
        )}
        {project.repoUrl && (
          <>
            <dt className="font-semibold">Code</dt>
            <dd>
              <a href={project.repoUrl} className="underline" target="_blank" rel="noopener noreferrer">
                Source code for {project.title}
              </a>
            </dd>
          </>
        )}
        {project.demoUrl && (
          <>
            <dt className="font-semibold">Demo</dt>
            <dd>
              <a href={project.demoUrl} className="underline" target="_blank" rel="noopener noreferrer">
                Live demo of {project.title}
              </a>
            </dd>
          </>
        )}
      </dl>
    </main>
  );
}
