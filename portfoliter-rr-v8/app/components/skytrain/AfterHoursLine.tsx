import { formatRange } from "~/lib/format";
import type { Project } from "~/lib/portfolio";

interface AfterHoursLineProps {
  projects: Project[];
}

// Personal projects as gold-line platform signs, coded G1, G2, ...
export function AfterHoursLine({ projects }: AfterHoursLineProps) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2">
      {projects.map((project, index) => (
        <li key={project.id} className="overflow-hidden rounded-2xl bg-white">
          <div className="flex items-center gap-3 bg-sky-gold px-5 py-3 text-sky-ink">
            <span className="grid size-8 place-items-center rounded-full bg-white font-sky-sign text-sm font-bold">G{index + 1}</span>
            <span className="font-semibold">{project.isFeatured ? "Express service" : "All stations"}</span>
          </div>
          <div className="px-5 pt-4 pb-5">
            <h3 className="font-sky-sign text-[1.7rem] leading-none font-bold">{project.title}</h3>
            {project.startDate && (
              <p className="mt-1 text-sm font-semibold text-sky-muted">{formatRange(project.startDate, project.endDate)}</p>
            )}
            {project.summary && <p className="mt-2">{project.summary}</p>}
            {project.skills.length > 0 && <p className="mt-2 text-sm text-sky-muted">{project.skills.join(", ")}</p>}
            {(project.repoUrl || project.demoUrl) && (
              <p className="mt-3 flex gap-4 font-semibold">
                {project.demoUrl && <a href={project.demoUrl}>Ride it</a>}
                {project.repoUrl && <a href={project.repoUrl}>Source code</a>}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
