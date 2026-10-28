import { SectionEntries } from "~/components/shared/SectionEntries";
import { certificationLine, educationLine, experienceLine } from "~/lib/fields";
import { skillGroupLabel } from "~/lib/labels";
import type { Certification, Education, Experience, SectionEntry, SkillGroup } from "~/lib/portfolio";
import { Meter, QuestStatus } from "./QuestWindow";

// Jobs as the quest log: the role is the quest, the company gave it, the skills were the rewards.
export function QuestLog({ experiences }: { experiences: Experience[] }) {
  return (
    <ol className="grid gap-6">
      {experiences.map((experience) => {
        const line = experienceLine(experience);
        return (
          <li key={experience.id} className="border-l-4 border-ql-gold/70 pl-4">
            <h3 className="text-[1.3rem] leading-tight font-bold">{line.role}</h3>
            <p className="mt-1 text-ql-soft">
              <QuestStatus endDate={experience.endDate} />, {line.dates}
            </p>
            <dl className="mt-2 grid gap-x-4 gap-y-0.5 sm:grid-cols-[auto_1fr]">
              <dt className="text-ql-gold">Giver</dt>
              <dd>{line.company}</dd>
              {line.location && (
                <>
                  <dt className="text-ql-gold">Region</dt>
                  <dd>{line.location}</dd>
                </>
              )}
              {line.employmentType && (
                <>
                  <dt className="text-ql-gold">Party role</dt>
                  <dd>{line.employmentType}</dd>
                </>
              )}
            </dl>
            {line.description && <p className="mt-2 max-w-[68ch] leading-relaxed">{line.description}</p>}
            {line.skills.length > 0 && (
              <p className="mt-2 text-ql-soft">
                Rewards: <span className="text-ql-green">{line.skills.join(", ")}</span>
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}

// Skill categories as stats. The bar shows how many skills the category holds against the largest
// one, so every number on it is a real count; the skills themselves are listed as abilities.
export function Stats({ groups }: { groups: SkillGroup[] }) {
  const most = Math.max(...groups.map((group) => group.skills.length));
  return (
    <dl className="grid gap-5 md:grid-cols-2 md:gap-x-10">
      {groups.map((group) => {
        const label = skillGroupLabel(group);
        return (
          <div key={group.key}>
            <dt className="grid grid-cols-[7.5rem_1fr_2.5rem] items-center gap-3">
              <span className="font-bold text-ql-gold">{label}</span>
              <Meter label={`${label}: ${group.skills.length} skills`} value={group.skills.length} max={most} />
              <span className="text-right tabular-nums">{group.skills.length}</span>
            </dt>
            <dd className="mt-1.5 leading-snug">{group.skills.join(", ")}</dd>
          </div>
        );
      })}
    </dl>
  );
}

// Education as the training grounds the hero studied at.
export function Training({ education }: { education: Education[] }) {
  return (
    <ul className="grid gap-4">
      {education.map((entry) => {
        const line = educationLine(entry);
        return (
          <li key={entry.id}>
            <h3 className="text-[1.2rem] font-bold">{line.institution}</h3>
            {line.qualification && <p>{line.qualification}</p>}
            {line.dates && <p className="text-ql-soft">{line.dates}</p>}
            {line.description && <p className="text-ql-green">{line.description}</p>}
          </li>
        );
      })}
    </ul>
  );
}

// Certifications as key items in the inventory; date and link appear only when set.
export function KeyItems({ certifications }: { certifications: Certification[] }) {
  return (
    <ul className="grid gap-3">
      {certifications.map((cert) => {
        const line = certificationLine(cert);
        return (
          <li key={cert.id} className="flex items-start gap-3">
            <span aria-hidden="true" className="mt-1.5 size-3 shrink-0 rotate-45 border-2 border-ql-gold bg-ql-window-top" />
            <div className="min-w-0">
              <h3 className="font-bold">{line.credentialUrl ? <a href={line.credentialUrl}>{line.name}</a> : line.name}</h3>
              <p className="text-ql-soft">From {line.meta}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// Any custom section as a plain list of entries.
export function Entries({ entries }: { entries: SectionEntry[] }) {
  return <SectionEntries entries={entries} classNames={{ list: "grid gap-2", title: "font-bold", detail: "text-ql-soft" }} />;
}
