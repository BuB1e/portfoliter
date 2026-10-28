import type { ReactNode } from "react";

import { capitalize, formatMonth, formatRange } from "~/lib/format";
import type { Certification, Education, Experience } from "~/lib/portfolio";
import type { SectionItem } from "~/lib/sectionItems";
import type { SkillGroup } from "~/lib/skills";

// Jobs as the "people on the move" column: short appointment notices, newest first as the API sends them.
export function Appointments({ experiences }: { experiences: Experience[] }) {
  return (
    <ol className="bs-column-rule gap-10 md:columns-2 xl:columns-3">
      {experiences.map((experience) => {
        const meta = [experience.employmentType && capitalize(experience.employmentType), experience.location].filter(Boolean).join(", ");
        return (
          <li key={experience.id} className="mb-8 break-inside-avoid">
            <h3 className="text-[1.3rem] leading-tight font-bold">
              {experience.role}, {experience.company}
            </h3>
            <p className="mt-1 text-[0.92rem] text-bs-grey italic">
              {formatRange(experience.startDate, experience.endDate)}
              {meta && `. ${meta}`}
            </p>
            {experience.description && <p className="mt-2 leading-[1.55]">{experience.description}</p>}
            {experience.skills.length > 0 && <p className="mt-2 text-[0.9rem] text-bs-grey">Skills on the job: {experience.skills.join(", ")}</p>}
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
        <li key={group.category} className="mb-4 break-inside-avoid border border-bs-ink p-3">
          <h3 className="border-b border-bs-ink pb-1 text-lg font-bold">
            {group.category}
            <span className="font-normal text-bs-grey">, {group.names.length} listed</span>
          </h3>
          <p className="mt-2 text-[0.95rem] leading-snug">{group.names.join(", ")}.</p>
        </li>
      ))}
    </ul>
  );
}

interface NoticesProps {
  education: Education[];
  certifications: Certification[];
  extras: { key: string; title: string; items: SectionItem[] }[];
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
            const degree = [entry.degree, entry.field].filter(Boolean).join(" in ");
            const dates = formatRange(entry.startDate, entry.endDate);
            return (
              <p key={entry.id} className="leading-[1.55]">
                <span className="font-semibold">{entry.institution}</span>
                {degree && `, ${degree}`}
                {dates && <span className="text-bs-grey">, {dates}</span>}.
                {entry.description && ` ${entry.description.replace(/\.$/, "")}.`}
              </p>
            );
          })}
        </Notice>
      )}
      {certifications.length > 0 && (
        <Notice title="Certificates">
          {certifications.map((cert) => (
            <p key={cert.name} className="leading-[1.55]">
              <span className="font-semibold">{cert.credentialUrl ? <a href={cert.credentialUrl}>{cert.name}</a> : cert.name}</span>, issued by {cert.issuer}
              {cert.issuedDate && <span className="text-bs-grey">, {formatMonth(cert.issuedDate)}</span>}.
            </p>
          ))}
        </Notice>
      )}
      {extras.map((section) => (
        <Notice key={section.key} title={section.title}>
          {section.items.map((item, index) => (
            <p key={`${item.title}-${index}`} className="leading-[1.55]">
              <span className="font-semibold">{item.url ? <a href={item.url}>{item.title}</a> : item.title}</span>
              {item.detail && `, ${item.detail}`}
            </p>
          ))}
        </Notice>
      ))}
    </div>
  );
}
