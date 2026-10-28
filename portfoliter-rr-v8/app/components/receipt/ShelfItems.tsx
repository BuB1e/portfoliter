import { useId } from "react";
import { Link } from "react-router";

import { Cover } from "~/components/shared/Cover";
import type { Project } from "~/lib/portfolio";
import { projectDates, projectPath, shortDescription } from "~/lib/projects";
import { Line, Sub, Tag, yearTag } from "./ReceiptParts";

export const STAFF_PICK = "Staff pick";

// Where an item came from: the job or the school it was made for, or nothing for side projects.
export function itemOrigin(project: Project): string {
  if (project.experience) {
    return `${project.experience.role} @ ${project.experience.company}`;
  }
  return project.education ? `@ ${project.education.institution}` : "";
}

// The item's photo printed in one ink, or a blank product box with its initial when there is no cover.
export function ItemPhoto({ project, size }: { project: Project; size: "small" | "large" }) {
  const box = size === "small" ? "size-14 sm:size-16" : "aspect-[4/3] w-full";
  return (
    <Cover
      url={project.coverUrl}
      title={project.title}
      className={`rc-thermal ${box} border-2 border-rc-ink object-cover`}
      isLazy={size === "small"}
      fallback={
        <div
          aria-hidden="true"
          className={`${box} grid place-items-center border-2 border-dashed border-rc-faded text-rc-faded ${size === "small" ? "text-xl font-extrabold" : "text-sm"}`}
        >
          {size === "small" ? project.title.charAt(0) : "No photo on file"}
        </div>
      }
    />
  );
}

function Item({ project }: { project: Project }) {
  const origin = itemOrigin(project);
  const tagId = useId();
  const titleId = useId();
  const descriptionId = useId();
  const dates = projectDates(project);
  return (
    <Link
      to={projectPath(project.slug)}
      aria-labelledby={project.isFeatured ? `${titleId} ${tagId}` : titleId}
      aria-describedby={project.summary ? descriptionId : undefined}
      className="group -mx-2 grid grid-cols-[auto_1fr] gap-3 px-2 py-3 no-underline hover:bg-rc-ink/5"
    >
      <ItemPhoto project={project} size="small" />
      <div className="min-w-0">
        {project.isFeatured && <Tag id={tagId}>{STAFF_PICK}</Tag>}
        <h3 id={titleId} className="font-bold group-hover:underline">
          <Line label={project.title} amount={yearTag(project.startDate, project.endDate)} />
        </h3>
        {origin && <Sub isFaded={false}>{origin}</Sub>}
        {dates && <Sub>{dates}</Sub>}
        {project.summary && (
          <p id={descriptionId} className="mt-1 pl-4 break-words">
            {shortDescription(project.summary)}
          </p>
        )}
        {project.skills.length > 0 && <Sub>+ {project.skills.join(", ")}</Sub>}
      </div>
    </Link>
  );
}

export function ShelfItems({ projects }: { projects: Project[] }) {
  return (
    <>
      <ul className="grid gap-1">
        {projects.map((project) => (
          <li key={project.id}>
            <Item project={project} />
          </li>
        ))}
      </ul>
      <div className="mt-3 border-t-2 border-dashed border-rc-ink pt-3">
        <Line label="Items" amount={projects.length} isStrong />
      </div>
    </>
  );
}
