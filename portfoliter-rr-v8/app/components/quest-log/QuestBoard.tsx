import { useId } from "react";
import { Link } from "react-router";

import { Cover } from "~/components/shared/Cover";
import type { Project } from "~/lib/portfolio";
import { projectDates, projectPath, shortDescription } from "~/lib/projects";
import { Cursor, QuestStatus } from "./QuestWindow";

// Who handed out the quest: the company (with the role taken on) or the school the backend embeds,
// or the owner for side projects.
export function questGiver(project: Pick<Project, "experience" | "education">): string {
  if (project.experience) {
    return `${project.experience.company} (${project.experience.role})`;
  }
  return project.education ? project.education.institution : "Self-assigned";
}

// The quest's map: its cover picture, or a pixel crest with the quest's initial when it has none.
export function QuestArt({ project, className = "" }: { project: Project; className?: string }) {
  return (
    <Cover
      url={project.coverUrl}
      title={project.title}
      className={`w-full object-cover ${className}`}
      fallback={
        <div
          aria-hidden="true"
          className={`grid w-full place-items-center bg-[repeating-conic-gradient(var(--color-ql-window-bottom)_0_25%,var(--color-ql-edge)_0_50%)] bg-[length:16px_16px] ${className}`}
        >
          <span className="grid size-16 place-items-center border-[3px] border-ql-gold bg-ql-edge text-4xl font-bold text-ql-gold">
            {project.title.charAt(0)}
          </span>
        </div>
      }
    />
  );
}

function QuestCard({ project }: { project: Project }) {
  const giver = questGiver(project);
  const epicId = useId();
  const titleId = useId();
  const descriptionId = useId();
  const dates = projectDates(project);
  return (
    <Link
      to={projectPath(project.slug)}
      aria-labelledby={project.isFeatured ? `${titleId} ${epicId}` : titleId}
      aria-describedby={project.summary ? descriptionId : undefined}
      className="group flex h-full flex-col border-2 border-ql-frame/60 bg-ql-edge/45 no-underline hover:border-ql-gold"
    >
      <QuestArt project={project} className="aspect-[16/9] border-b-2 border-ql-frame/60" />
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-start gap-2">
          <Cursor />
          <div className="min-w-0">
            {project.isFeatured && (
              <p id={epicId} className="text-ql-gold">
                Epic quest
              </p>
            )}
            <h3 id={titleId} className="text-[1.3rem] leading-tight font-bold break-words group-hover:text-ql-gold">
              {project.title}
            </h3>
          </div>
        </div>
        <p className="text-ql-soft">
          Giver: <span className="text-white">{giver}</span>
        </p>
        <p className="text-ql-soft">
          <QuestStatus endDate={project.endDate} />
          {dates && `, ${dates}`}
        </p>
        {project.summary && (
          <p id={descriptionId} className="mt-1 leading-snug">
            {shortDescription(project.summary)}
          </p>
        )}
        {project.skills.length > 0 && (
          <p className="mt-auto pt-2 text-ql-soft">
            Rewards: <span className="text-ql-green">{project.skills.join(", ")}</span>
          </p>
        )}
      </div>
    </Link>
  );
}

export function QuestBoard({ projects }: { projects: Project[] }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <li key={project.id}>
          <QuestCard project={project} />
        </li>
      ))}
    </ul>
  );
}
