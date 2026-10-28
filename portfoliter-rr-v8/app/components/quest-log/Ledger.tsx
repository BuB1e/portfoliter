import { capitalize, formatMonth, formatRange } from "~/lib/format";
import type { Certification, Education, Experience } from "~/lib/portfolio";
import type { SectionItem } from "~/lib/sectionItems";
import type { SkillGroup } from "~/lib/skills";
import { Meter, QuestStatus } from "./QuestWindow";

// Jobs as the quest log: the role is the quest, the company gave it, the skills were the rewards.
export function QuestLog({ experiences }: { experiences: Experience[] }) {
  return (
    <ol className="grid gap-6">
      {experiences.map((experience) => (
        <li key={experience.id} className="border-l-4 border-ql-gold/70 pl-4">
          <h3 className="text-[1.3rem] leading-tight font-bold">{experience.role}</h3>
          <p className="mt-1 text-ql-soft">
            <QuestStatus endDate={experience.endDate} />, {formatRange(experience.startDate, experience.endDate)}
          </p>
          <dl className="mt-2 grid gap-x-4 gap-y-0.5 sm:grid-cols-[auto_1fr]">
            <dt className="text-ql-gold">Giver</dt>
            <dd>{experience.company}</dd>
            {experience.location && (
              <>
                <dt className="text-ql-gold">Region</dt>
                <dd>{experience.location}</dd>
              </>
            )}
            {experience.employmentType && (
              <>
                <dt className="text-ql-gold">Party role</dt>
                <dd>{capitalize(experience.employmentType)}</dd>
              </>
            )}
          </dl>
          {experience.description && <p className="mt-2 max-w-[68ch] leading-relaxed">{experience.description}</p>}
          {experience.skills.length > 0 && (
            <p className="mt-2 text-ql-soft">
              Rewards: <span className="text-ql-green">{experience.skills.join(", ")}</span>
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}

// Skill categories as stats. The bar shows how many skills the category holds against the largest
// one, so every number on it is a real count; the skills themselves are listed as abilities.
export function Stats({ groups }: { groups: SkillGroup[] }) {
  const most = Math.max(...groups.map((group) => group.names.length));
  return (
    <dl className="grid gap-5 md:grid-cols-2 md:gap-x-10">
      {groups.map((group) => (
        <div key={group.category}>
          <dt className="grid grid-cols-[7.5rem_1fr_2.5rem] items-center gap-3">
            <span className="font-bold text-ql-gold">{group.category}</span>
            <Meter label={`${group.category}: ${group.names.length} skills`} value={group.names.length} max={most} />
            <span className="text-right tabular-nums">{group.names.length}</span>
          </dt>
          <dd className="mt-1.5 leading-snug">{group.names.join(", ")}</dd>
        </div>
      ))}
    </dl>
  );
}

// Education as the training grounds the hero studied at.
export function Training({ education }: { education: Education[] }) {
  return (
    <ul className="grid gap-4">
      {education.map((entry) => {
        const course = [entry.degree, entry.field].filter(Boolean).join(" ");
        const dates = formatRange(entry.startDate, entry.endDate);
        return (
          <li key={entry.id}>
            <h3 className="text-[1.2rem] font-bold">{entry.institution}</h3>
            {course && <p>{course}</p>}
            {dates && <p className="text-ql-soft">{dates}</p>}
            {entry.description && <p className="text-ql-green">{entry.description}</p>}
          </li>
        );
      })}
    </ul>
  );
}

// Certifications as key items in the inventory; date and link are optional.
export function KeyItems({ certifications }: { certifications: Certification[] }) {
  return (
    <ul className="grid gap-3">
      {certifications.map((cert) => (
        <li key={cert.name} className="flex items-start gap-3">
          <span aria-hidden="true" className="mt-1.5 size-3 shrink-0 rotate-45 border-2 border-ql-gold bg-ql-window-top" />
          <div className="min-w-0">
            <h3 className="font-bold">{cert.credentialUrl ? <a href={cert.credentialUrl}>{cert.name}</a> : cert.name}</h3>
            <p className="text-ql-soft">
              From {cert.issuer}
              {cert.issuedDate && `, ${formatMonth(cert.issuedDate)}`}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

// Any custom section as a plain list of entries.
export function Entries({ items }: { items: SectionItem[] }) {
  return (
    <ul className="grid gap-2">
      {items.map((item, index) => (
        <li key={`${item.title}-${index}`}>
          <span className="font-bold">{item.url ? <a href={item.url}>{item.title}</a> : item.title}</span>
          {item.detail && <span className="text-ql-soft">: {item.detail}</span>}
        </li>
      ))}
    </ul>
  );
}
