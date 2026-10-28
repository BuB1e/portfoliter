import { useId } from "react";
import { Link } from "react-router";

import { Cover } from "~/components/shared/Cover";
import { linkedName } from "~/lib/fields";
import type { Project, ProjectType } from "~/lib/portfolio";
import { projectDates, projectPath, shortDescription } from "~/lib/projects";

interface LineStyle {
  title: string;
  name: string;
  note: string;
  code: string;
  band: string;
  roundel: string;
}

// Each project group runs on its own line, like the Bangkok network: work on the Sukhumvit line,
// personal projects on the Gold line, university projects on the MRT Blue line.
export const PROJECT_LINES: Record<ProjectType, LineStyle> = {
  WORK: {
    title: "Sukhumvit line: work",
    name: "Sukhumvit line",
    note: "Projects built on the job. Each one interchanges with the station where it was built.",
    code: "E",
    band: "bg-sky-sukhumvit text-white",
    roundel: "text-sky-sukhumvit",
  },
  PERSONAL: {
    title: "Gold line: after hours",
    name: "Gold line",
    note: "Personal projects. Runs evenings and weekends.",
    code: "G",
    band: "bg-sky-gold text-sky-ink",
    roundel: "text-sky-ink",
  },
  UNIVERSITY: {
    title: "Blue line: campus",
    name: "Blue line",
    note: "University projects. Stops at lecture halls, labs and one very long senior project.",
    code: "BL",
    band: "bg-sky-blue text-white",
    roundel: "text-sky-blue",
  },
};

export function stationCode(type: ProjectType, position: number): string {
  return `${PROJECT_LINES[type].code}${position}`;
}

// A featured project runs as an express; the rest stop at all stations.
export const EXPRESS_LABEL = "Express service";

interface StationCardProps {
  project: Project;
  code: string;
}

function StationCard({ project, code }: StationCardProps) {
  const titleId = useId();
  const descriptionId = useId();
  const line = PROJECT_LINES[project.projectType];
  const dates = projectDates(project);
  // The other line a project connects to: the job or the school it belongs to.
  const interchangeWith = linkedName(project);
  return (
    <Link
      to={projectPath(project.slug)}
      aria-labelledby={titleId}
      aria-describedby={project.summary ? descriptionId : undefined}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white no-underline shadow-[0_1px_0_rgb(22_37_28/0.08)] transition-shadow hover:shadow-[0_8px_24px_rgb(22_37_28/0.14)]"
    >
      <div className={`flex items-center gap-3 px-5 py-3 ${line.band}`}>
        <span className={`grid size-9 place-items-center rounded-full bg-white font-sky-sign text-sm font-bold ${line.roundel}`}>{code}</span>
        <span className="font-semibold">{project.isFeatured ? EXPRESS_LABEL : "All stations"}</span>
      </div>
      <Cover url={project.coverUrl} title={project.title} className="aspect-video w-full object-cover" />
      <div className="flex flex-1 flex-col px-5 pt-4 pb-5">
        <h3 id={titleId} className="font-sky-sign text-[1.7rem] leading-none font-bold group-hover:underline">
          {project.title}
        </h3>
        {dates && <p className="mt-1 text-sm font-semibold text-sky-muted">{dates}</p>}
        {project.summary && (
          <p id={descriptionId} className="mt-2">
            {shortDescription(project.summary)}
          </p>
        )}
        {interchangeWith && (
          <p className="mt-3 flex items-center gap-2 text-sm font-semibold">
            <span aria-hidden="true" className="size-3.5 flex-none rounded-full border-[3px] border-sky-ink bg-white" />
            Interchange: {interchangeWith}
          </p>
        )}
        {project.skills.length > 0 && <p className="mt-2 text-sm text-sky-muted">{project.skills.join(", ")}</p>}
        <span aria-hidden="true" className="mt-auto pt-4 font-sky-sign text-lg font-bold">
          Station information
        </span>
      </div>
    </Link>
  );
}

// Station codes count along the line in API order: G1, G2, ...
export function ProjectLine({ projects }: { projects: Project[] }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2">
      {projects.map((project, index) => (
        <li key={project.id}>
          <StationCard project={project} code={stationCode(project.projectType, index + 1)} />
        </li>
      ))}
    </ul>
  );
}
