import { experienceLine } from "~/lib/fields";
import type { Experience } from "~/lib/portfolio";

interface MigrationRecordProps {
  experiences: Experience[];
}

export function MigrationRecord({ experiences }: MigrationRecordProps) {
  return (
    <ol className="relative before:absolute before:inset-y-2.5 before:left-[7px] before:border-l-2 before:border-dotted before:border-fg-pine">
      {experiences.map((experience) => {
        const line = experienceLine(experience);
        return (
          <li key={experience.id} className="relative pb-10 pl-10">
            <span
              aria-hidden="true"
              className={`absolute top-[0.45rem] left-0 size-4 rounded-full border-2 border-fg-pine ${line.isCurrent ? "bg-fg-ochre" : "bg-fg-paper"}`}
            />
            <span className="text-[0.95rem] font-semibold">{line.dates}</span>
            <h3 className="my-0.5 font-fg-serif text-[1.6rem] leading-[1.15] font-semibold">{line.company}</h3>
            <p className="mb-2 font-fg-serif text-[1.05rem] text-fg-moss italic">
              {[line.role, line.employmentType, line.location].filter(Boolean).join(", ")}
            </p>
            {line.description && <p className="mb-2 max-w-[64ch]">{line.description}</p>}
            {line.skills.length > 0 && <p className="text-[0.92rem]">Observed eating: {line.skills.join(", ")}</p>}
          </li>
        );
      })}
    </ol>
  );
}
