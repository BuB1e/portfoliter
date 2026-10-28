import { experienceLine } from "~/lib/fields";
import type { Experience } from "~/lib/portfolio";

interface ExListProps {
  experiences: Experience[];
}

export function ExList({ experiences }: ExListProps) {
  return (
    <ul className="grid gap-4">
      {experiences.map((experience) => {
        const line = experienceLine(experience);
        return (
          <li key={experience.id} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 border-b border-card/20 pb-5">
            <h3 className="text-2xl font-bold tracking-tight">{line.company}</h3>
            <span
              className={`self-start rounded-full px-3 py-0.5 text-sm font-bold ${line.isCurrent ? "bg-mint text-ink" : "bg-night-raised text-card"}`}
            >
              {line.isCurrent ? "It's serious" : "Amicable split"}
            </span>
            <p className="col-span-2 text-[0.95rem] opacity-75">
              {line.role}, {line.meta}
            </p>
            {line.description && <p className="col-span-2 mt-1 max-w-[62ch]">{line.description}</p>}
            {line.skills.length > 0 && (
              <ul aria-label={`Shared interests at ${line.company}`} className="col-span-2 mt-2 flex flex-wrap gap-2">
                {line.skills.map((skill) => (
                  <li key={skill} className="rounded-full border-[1.5px] border-lilac px-3 py-0.5 text-sm font-semibold">
                    {skill}
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}
