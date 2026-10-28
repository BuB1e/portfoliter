import { formatRange } from "~/lib/format";
import type { Experience } from "~/lib/portfolio";

interface MigrationRecordProps {
  experiences: Experience[];
}

export function MigrationRecord({ experiences }: MigrationRecordProps) {
  return (
    <ol className="relative before:absolute before:inset-y-2.5 before:left-[7px] before:border-l-2 before:border-dotted before:border-fg-pine">
      {experiences.map((experience) => (
        <li key={experience.id} className="relative pb-10 pl-10">
          <span
            aria-hidden="true"
            className={`absolute top-[0.45rem] left-0 size-4 rounded-full border-2 border-fg-pine ${experience.endDate ? "bg-fg-paper" : "bg-fg-ochre"}`}
          />
          <span className="text-[0.95rem] font-semibold">{formatRange(experience.startDate, experience.endDate)}</span>
          <h3 className="my-0.5 font-fg-serif text-[1.6rem] leading-[1.15] font-semibold">{experience.company}</h3>
          <p className="mb-2 font-fg-serif text-[1.05rem] text-fg-moss italic">
            {experience.role}
            {experience.location ? `, ${experience.location}` : ""}
          </p>
          {experience.description && <p className="mb-2 max-w-[64ch]">{experience.description}</p>}
          {experience.skills.length > 0 && (
            <p className="text-[0.92rem]">Observed eating: {experience.skills.join(", ")}</p>
          )}
        </li>
      ))}
    </ol>
  );
}
