import { formatRange } from "~/lib/format";
import type { Experience } from "~/lib/portfolio";

interface SpecExperienceProps {
  experiences: Experience[];
}

export function SpecExperience({ experiences }: SpecExperienceProps) {
  return (
    <ol className="grid gap-9">
      {experiences.map((experience) => (
        <li key={experience.id} className="grid gap-1 sm:grid-cols-[150px_1fr] sm:gap-6">
          <span className="text-[0.95rem] text-ss-muted tabular-nums">{formatRange(experience.startDate, experience.endDate)}</span>
          <div>
            <h3 className="text-xl font-semibold">
              {experience.role}, {experience.company}
            </h3>
            {experience.location && <p className="text-[0.95rem] text-ss-muted">{experience.location}</p>}
            {experience.description && <p className="mt-2 max-w-[65ch] leading-relaxed">{experience.description}</p>}
            {experience.skills.length > 0 && (
              <p className="mt-2 text-[0.95rem] text-ss-muted">{experience.skills.join(", ")}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
