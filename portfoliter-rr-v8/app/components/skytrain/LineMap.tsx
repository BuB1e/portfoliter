import { Link } from "react-router";

import { experienceLine } from "~/lib/fields";
import type { Experience, Project } from "~/lib/portfolio";
import { projectPath } from "~/lib/projects";

interface LineMapProps {
  experiences: Experience[];
  projects: Project[];
}

// Experiences arrive newest first; codes count up from the first job (S1). Projects built at a job
// (their embedded experience) are interchanges at its station.
export function LineMap({ experiences, projects }: LineMapProps) {
  return (
    <ol className="relative">
      <span aria-hidden="true" className="absolute top-3 bottom-3 left-[13px] w-2.5 rounded-full bg-sky-sukhumvit" />
      {experiences.map((experience, index) => {
        const code = `S${experiences.length - index}`;
        const line = experienceLine(experience);
        const interchanges = projects.filter((project) => project.experience?.id === experience.id);
        return (
          <li key={experience.id} className="relative pb-12 pl-14 last:pb-0">
            <span
              aria-hidden="true"
              className={`absolute top-1 left-0 size-9 rounded-full border-[6px] border-sky-sukhumvit ${line.isCurrent ? "bg-sky-yellow" : "bg-white"}`}
            />
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-md bg-sky-sukhumvit px-2 py-0.5 font-sky-sign text-sm font-bold text-white">{code}</span>
              <span className="text-[0.95rem] font-semibold text-sky-muted">{line.dates}</span>
              {line.isCurrent && <span className="rounded-md bg-sky-yellow px-2 py-0.5 text-sm font-semibold">You are here</span>}
            </div>
            <h3 className="mt-1.5 font-sky-sign text-[2rem] leading-none font-bold">{line.company}</h3>
            <p className="mt-1 font-medium">{[line.role, line.employmentType, line.location].filter(Boolean).join(", ")}</p>
            {line.description && <p className="mt-2 max-w-[62ch] text-sky-muted">{line.description}</p>}
            {line.skills.length > 0 && (
              <ul aria-label={`Lines served at ${line.company}`} className="mt-3 flex flex-wrap gap-2">
                {line.skills.map((skill) => (
                  <li key={skill} className="rounded-md border-2 border-sky-sukhumvit px-2 py-0.5 text-sm font-semibold">
                    {skill}
                  </li>
                ))}
              </ul>
            )}

            {interchanges.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-3">
                {interchanges.map((project) => (
                  <li key={project.id}>
                    <Link
                      to={projectPath(project.slug)}
                      className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 no-underline shadow-[0_1px_0_rgb(22_37_28/0.08)] hover:underline"
                    >
                      <span aria-hidden="true" className="size-5 flex-none rounded-full border-[5px] border-sky-sukhumvit bg-white" />
                      <span>
                        <span className="block text-sm font-semibold text-sky-muted">Change here for</span>
                        <span className="block font-sky-sign text-xl leading-tight font-bold">{project.title}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ol>
  );
}
