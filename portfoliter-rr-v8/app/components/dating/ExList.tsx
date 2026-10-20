import { formatRange } from "~/lib/format";
import type { Experience } from "~/lib/portfolio";

interface ExListProps {
  experiences: Experience[];
}

export function ExList({ experiences }: ExListProps) {
  return (
    <ul className="grid gap-4">
      {experiences.map((experience) => (
        <li key={experience.id} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 border-b border-card/20 pb-5">
          <h3 className="text-2xl font-bold tracking-tight">{experience.company}</h3>
          <span
            className={`self-start rounded-full px-3 py-0.5 text-sm font-bold ${
              experience.endDate ? "bg-night-raised text-card" : "bg-mint text-ink"
            }`}
          >
            {experience.endDate ? "Amicable split" : "It's serious"}
          </span>
          <p className="col-span-2 text-[0.95rem] opacity-75">
            {experience.role}, {formatRange(experience.startDate, experience.endDate)}
          </p>
          {experience.description && <p className="col-span-2 mt-1 max-w-[62ch]">{experience.description}</p>}
        </li>
      ))}
    </ul>
  );
}
