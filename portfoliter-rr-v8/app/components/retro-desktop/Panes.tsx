import type { ReactNode } from "react";

import { SectionEntries } from "~/components/shared/SectionEntries";
import { certificationLine, educationLine, experienceLine } from "~/lib/fields";
import { skillGroupLabel } from "~/lib/labels";
import type { Certification, Education, Experience, SectionEntry, SkillGroup } from "~/lib/portfolio";
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
          const line = experienceLine(experience);
          return (
            <li key={experience.id} className="border-b border-dotted border-rd-shadow pb-5 last:border-0 last:pb-0">
              <h3 className="text-[1.1rem] font-bold">
                {line.role}, {line.company}
              </h3>
              <p className="font-rd-pixel text-[0.85rem] text-rd-muted">{line.meta}</p>
              {line.description && <p className="mt-1.5 max-w-[70ch] leading-relaxed">{line.description}</p>}
              {line.skills.length > 0 && <p className="mt-1.5 text-[0.92rem] text-rd-muted">Used: {line.skills.join(", ")}</p>}
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
          <div key={group.key}>
            <dt className="rd-raised flex justify-between gap-3 px-3 py-1 font-rd-pixel text-[0.9rem]">
              <span>{skillGroupLabel(group)}</span>
              <span className="text-rd-muted">{group.skills.length}</span>
            </dt>
            <dd className="flex flex-wrap gap-x-5 gap-y-1 px-3 py-2">
              {group.skills.map((name) => (
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
        const line = educationLine(entry);
        return (
          <GroupBox key={entry.id} title={line.institution}>
            {entry.degree && <Field label="Degree">{entry.degree}</Field>}
            {entry.field && <Field label="Field">{entry.field}</Field>}
            {line.dates && <Field label="Dates">{line.dates}</Field>}
            {line.description && <Field label="Notes">{line.description}</Field>}
          </GroupBox>
        );
      })}
    </div>
  );
}

// Issued date and credential rows appear only when set; there is no empty row in their place.
export function Certificates({ certifications }: { certifications: Certification[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {certifications.map((cert) => {
        const line = certificationLine(cert);
        return (
          <GroupBox key={cert.id} title={line.name}>
            <Field label="Issuer">{line.issuer}</Field>
            {line.date && <Field label="Issued">{line.date}</Field>}
            {line.credentialUrl && (
              <Field label="Credential">
                <a href={line.credentialUrl} className="text-rd-link">
                  Verify {line.name}
                </a>
              </Field>
            )}
          </GroupBox>
        );
      })}
    </div>
  );
}

// Any custom section as a plain list.
export function ExtraList({ entries }: { entries: SectionEntry[] }) {
  return (
    <Pane>
      <SectionEntries
        entries={entries}
        classNames={{ list: "grid gap-1.5", title: "font-bold", detail: "text-rd-muted", link: "text-rd-link" }}
      />
    </Pane>
  );
}
