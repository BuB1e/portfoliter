import { Link } from "react-router";

import type { Portfolio, ProjectDetail } from "~/lib/portfolio";
import { educationLabel, experienceLabel, PROJECT_GROUP_LABELS, projectDates } from "~/lib/projects";
import { Markdown } from "./Markdown";

// project is null for unknown or draft slugs; portfolio is null until a profile exists.
export interface ProjectPageProps {
  portfolio: Portfolio | null;
  project: ProjectDetail | null;
}

const markdownClass =
  "space-y-4 leading-relaxed [&_a]:underline [&_code]:font-mono [&_code]:text-sm [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:font-semibold [&_li]:mt-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_pre]:overflow-x-auto [&_ul]:list-disc [&_ul]:pl-6";

const backLinkClass =
  "text-sm underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";

export function DefaultProjectPage({ project }: ProjectPageProps) {
  if (!project) {
    return (
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-8 sm:px-8">
        <h1 className="text-3xl font-bold">Project not found</h1>
        <p>This project does not exist or is not published yet.</p>
        <Link to="/" className={backLinkClass}>
          Back to all projects
        </Link>
      </main>
    );
  }

  const dates = projectDates(project);
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-8">
      <Link to="/" className={backLinkClass}>
        Back to all projects
      </Link>
      <header className="space-y-2">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {PROJECT_GROUP_LABELS[project.projectType]} project{dates && `, ${dates}`}
        </p>
        <h1 className="text-3xl font-bold">{project.title}</h1>
        {project.summary && <p className="text-lg">{project.summary}</p>}
      </header>
      {project.coverUrl && (
        <img src={project.coverUrl} alt={`Cover of ${project.title}`} className="w-full rounded-lg" />
      )}
      {project.content && <Markdown className={markdownClass}>{project.content}</Markdown>}
      <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[max-content_1fr]">
        {project.experience && (
          <>
            <dt className="font-semibold">Built at</dt>
            <dd>{experienceLabel(project.experience)}</dd>
          </>
        )}
        {project.education && (
          <>
            <dt className="font-semibold">Part of</dt>
            <dd>{educationLabel(project.education)}</dd>
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
