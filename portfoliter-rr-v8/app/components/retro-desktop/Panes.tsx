import type { ReactNode } from "react";

import { capitalize, formatMonth, formatRange } from "~/lib/format";
import type { Certification, Education, Experience } from "~/lib/portfolio";
import type { SectionItem } from "~/lib/sectionItems";
import type { SkillGroup } from "~/lib/skills";
import { DocIcon } from "./Icons";

// White sunken area inside a window, where documents and lists live.
export function Pane({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rd-sunken bg-white p-3 sm:p-4 ${className}`}>{children}</div>;
}

// Jobs as a log file, one entry per job.
export function CareerLog({ experiences }: { experiences: Experience[] }) {
  return (
    <Pane>
      <ol className="grid gap-5">
        {experiences.map((experience) => {
          const meta = [formatRange(experience.startDate, experience.endDate), experience.employmentType && capitalize(experience.employmentType), experience.location]
            .filter(Boolean)
            .join(", ");
          return (
            <li key={experience.id} className="border-b border-dotted border-rd-shadow pb-5 last:border-0 last:pb-0">
              <h3 className="text-[1.1rem] font-bold">
                {experience.role}, {experience.company}
              </h3>
              <p className="font-rd-pixel text-[0.85rem] text-rd-muted">{meta}</p>
              {experience.description && <p className="mt-1.5 max-w-[70ch] leading-relaxed">{experience.description}</p>}
              {experience.skills.length > 0 && <p className="mt-1.5 text-[0.92rem] text-rd-muted">Used: {experience.skills.join(", ")}</p>}
            </li>
          );
        })}
      </ol>
    </Pane>
  );
}

// Skills as an installed-programs list, grouped by category; uncategorized ones are "Other".
export function InstalledSkills({ groups }: { groups: SkillGroup[] }) {
  return (
    <Pane className="p-0! sm:p-0!">
      <dl>
        {groups.map((group) => (
          <div key={group.category}>
            <dt className="rd-raised flex justify-between gap-3 px-3 py-1 font-rd-pixel text-[0.9rem]">
              <span>{group.category}</span>
              <span className="text-rd-muted">{group.names.length}</span>
            </dt>
            <dd className="flex flex-wrap gap-x-5 gap-y-1 px-3 py-2">
              {group.names.map((name) => (
                <span key={name} className="flex items-center gap-1.5">
                  <span aria-hidden="true" className="size-2.5 shrink-0 border border-rd-dark bg-rd-title-end" />
                  {name}
                </span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </Pane>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-x-3 sm:grid-cols-[7rem_1fr]">
      <dt className="text-rd-muted">{label}:</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  );
}

// A properties sheet: one "group box" per record with label and value rows.
function GroupBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border border-rd-shadow p-3 pt-2 shadow-[1px_1px_0_#fff,inset_1px_1px_0_#fff]">
      <h3 className="flex items-center gap-2 font-bold">
        <DocIcon size="small" />
        {title}
      </h3>
      <dl className="mt-2 grid gap-1">{children}</dl>
    </div>
  );
}

export function Diplomas({ education }: { education: Education[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {education.map((entry) => {
        const dates = formatRange(entry.startDate, entry.endDate);
        return (
          <GroupBox key={entry.id} title={entry.institution}>
            {entry.degree && <Field label="Degree">{entry.degree}</Field>}
            {entry.field && <Field label="Field">{entry.field}</Field>}
            {dates && <Field label="Dates">{dates}</Field>}
            {entry.description && <Field label="Notes">{entry.description}</Field>}
          </GroupBox>
        );
      })}
    </div>
  );
}

export function Certificates({ certifications }: { certifications: Certification[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {certifications.map((cert) => (
        <GroupBox key={cert.name} title={cert.name}>
          <Field label="Issuer">{cert.issuer}</Field>
          {cert.issuedDate && <Field label="Issued">{formatMonth(cert.issuedDate)}</Field>}
          {cert.credentialUrl && (
            <Field label="Credential">
              <a href={cert.credentialUrl} className="text-rd-link">
                Verify {cert.name}
              </a>
            </Field>
          )}
        </GroupBox>
      ))}
    </div>
  );
}

// Any custom section as a plain list.
export function ExtraList({ items }: { items: SectionItem[] }) {
  return (
    <Pane>
      <ul className="grid gap-1.5">
        {items.map((item, index) => (
          <li key={`${item.title}-${index}`} className="flex items-start gap-2">
            <DocIcon size="small" />
            <span>
              <span className="font-bold">
                {item.url ? (
                  <a href={item.url} className="text-rd-link">
                    {item.title}
                  </a>
                ) : (
                  item.title
                )}
              </span>
              {item.detail && <span className="text-rd-muted">: {item.detail}</span>}
            </span>
          </li>
        ))}
      </ul>
    </Pane>
  );
}
