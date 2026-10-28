import { experienceLine } from "~/lib/fields";
import type { Experience } from "~/lib/portfolio";

interface SpecExperienceProps {
  experiences: Experience[];
}

export function SpecExperience({ experiences }: SpecExperienceProps) {
  return (
    <ol className="grid gap-9">
      {experiences.map((experience) => {
        const line = experienceLine(experience);
        const facts = [line.employmentType, line.location].filter(Boolean).join(", ");
        return (
          <li key={experience.id} className="grid gap-1 sm:grid-cols-[150px_1fr] sm:gap-6">
            <span className="text-[0.95rem] text-ss-muted tabular-nums">{line.dates}</span>
            <div>
              <h3 className="text-xl font-semibold">
                {line.role}, {line.company}
              </h3>
              {facts && <p className="text-[0.95rem] text-ss-muted">{facts}</p>}
              {line.description && <p className="mt-2 max-w-[65ch] leading-relaxed">{line.description}</p>}
              {line.skills.length > 0 && <p className="mt-2 text-[0.95rem] text-ss-muted">{line.skills.join(", ")}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
