import { formatRange } from "~/lib/format";
import type { Experience, Project } from "~/lib/portfolio";

interface LineMapProps {
  experiences: Experience[];
  projects: Project[];
}

// Experiences arrive newest first; codes count up from the first job (S1).
export function LineMap({ experiences, projects }: LineMapProps) {
  return (
    <ol className="relative">
      <span aria-hidden="true" className="absolute top-3 bottom-3 left-[13px] w-2.5 rounded-full bg-sky-sukhumvit" />
      {experiences.map((experience, index) => {
        const code = `S${experiences.length - index}`;
        const isCurrent = !experience.endDate;
        const interchanges = projects.filter((project) => project.experienceId === experience.id);
        return (
          <li key={experience.id} className="relative pb-12 pl-14 last:pb-0">
            <span
              aria-hidden="true"
              className={`absolute top-1 left-0 size-9 rounded-full border-[6px] border-sky-sukhumvit ${isCurrent ? "bg-sky-yellow" : "bg-white"}`}
            />
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-md bg-sky-sukhumvit px-2 py-0.5 font-sky-sign text-sm font-bold text-white">{code}</span>
              <span className="text-[0.95rem] font-semibold text-sky-muted">{formatRange(experience.startDate, experience.endDate)}</span>
              {isCurrent && <span className="rounded-md bg-sky-yellow px-2 py-0.5 text-sm font-semibold">You are here</span>}
            </div>
            <h3 className="mt-1.5 font-sky-sign text-[2rem] leading-none font-bold">{experience.company}</h3>
            <p className="mt-1 font-medium">
              {experience.role}
              {experience.location ? `, ${experience.location}` : ""}
            </p>
            {experience.description && <p className="mt-2 max-w-[62ch] text-sky-muted">{experience.description}</p>}

            {interchanges.length > 0 && (
              <ul className="mt-5 grid gap-3">
                {interchanges.map((project) => (
                  <li key={project.id} className="flex gap-3 rounded-2xl bg-white p-4 shadow-[0_1px_0_rgb(22_37_28/0.08)]">
                    <span aria-hidden="true" className="mt-1 size-5 flex-none rounded-full border-[5px] border-sky-gold bg-white" />
                    <div>
                      <p className="text-sm font-semibold text-sky-muted">Change here for</p>
                      <h4 className="font-sky-sign text-xl leading-tight font-bold">{project.title}</h4>
                      {project.summary && <p className="mt-1 max-w-[60ch]">{project.summary}</p>}
                      {project.skills.length > 0 && <p className="mt-1 text-sm text-sky-muted">{project.skills.join(", ")}</p>}
                    </div>
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
