import type { ReactNode } from "react";

import { certificationLine, educationLine, experienceLine } from "~/lib/fields";
import { skillGroupLabel } from "~/lib/labels";
import type { Certification, Education, Experience, Section, SkillGroup } from "~/lib/portfolio";

// Jobs as the "people on the move" column: short appointment notices, newest first as the API sends them.
export function Appointments({ experiences }: { experiences: Experience[] }) {
  return (
    <ol className="bs-column-rule gap-10 md:columns-2 xl:columns-3">
      {experiences.map((experience) => {
        const line = experienceLine(experience);
        return (
          <li key={experience.id} className="mb-8 break-inside-avoid">
            <h3 className="text-[1.3rem] leading-tight font-bold">
              {line.role}, {line.company}
            </h3>
            <p className="mt-1 text-[0.92rem] text-bs-grey italic">{line.meta}</p>
            {line.description && <p className="mt-2 leading-[1.55]">{line.description}</p>}
            {line.skills.length > 0 && <p className="mt-2 text-[0.9rem] text-bs-grey">Skills on the job: {line.skills.join(", ")}</p>}
          </li>
        );
      })}
    </ol>
  );
}

// Skills as classified ads, one boxed ad per category; uncategorized skills run under "Other".
export function Classifieds({ groups }: { groups: SkillGroup[] }) {
  return (
    <ul className="columns-[15rem] gap-4">
      {groups.map((group) => (
        <li key={group.key} className="mb-4 break-inside-avoid border border-bs-ink p-3">
          <h3 className="border-b border-bs-ink pb-1 text-lg font-bold">
            {skillGroupLabel(group)}
            <span className="font-normal text-bs-grey">, {group.skills.length} listed</span>
          </h3>
          <p className="mt-2 text-[0.95rem] leading-snug">{group.skills.join(", ")}.</p>
        </li>
      ))}
    </ul>
  );
}

interface NoticesProps {
  education: Education[];
  certifications: Certification[];
  extras: Section[];
}

function Notice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-8 break-inside-avoid">
      <h3 className="border-b border-bs-ink pb-1 text-center text-lg font-bold">{title}</h3>
      <div className="mt-3 grid gap-3">{children}</div>
    </section>
  );
}

// Education, certifications and any custom section as the paper's public notices.
export function Notices({ education, certifications, extras }: NoticesProps) {
  return (
    <div className="bs-column-rule gap-10 md:columns-2 xl:columns-3">
      {education.length > 0 && (
        <Notice title="Degrees conferred">
          {education.map((entry) => {
            const line = educationLine(entry);
            return (
              <p key={entry.id} className="leading-[1.55]">
                <span className="font-semibold">{line.institution}</span>
                {line.qualification && `, ${line.qualification}`}
                {line.dates && <span className="text-bs-grey">, {line.dates}</span>}.
                {line.description && ` ${line.description.replace(/\.$/, "")}.`}
              </p>
            );
          })}
        </Notice>
      )}
      {certifications.length > 0 && (
        <Notice title="Certificates">
          {certifications.map((cert) => {
            const line = certificationLine(cert);
            return (
              <p key={cert.id} className="leading-[1.55]">
                <span className="font-semibold">{line.credentialUrl ? <a href={line.credentialUrl}>{line.name}</a> : line.name}</span>, issued by{" "}
                {line.issuer}
                {line.date && <span className="text-bs-grey">, {line.date}</span>}.
              </p>
            );
          })}
        </Notice>
      )}
      {extras.map((section) => (
        <Notice key={section.key} title={section.title}>
          {section.entries.map((entry, index) => (
            <p key={`${entry.title}-${index}`} className="leading-[1.55]">
              <span className="font-semibold">{entry.url ? <a href={entry.url}>{entry.title}</a> : entry.title}</span>
              {entry.detail && `, ${entry.detail}`}
            </p>
          ))}
        </Notice>
      ))}
    </div>
  );
}
