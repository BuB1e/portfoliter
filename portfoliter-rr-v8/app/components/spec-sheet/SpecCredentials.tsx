import type { ReactNode } from "react";

import { certificationLine, educationLine } from "~/lib/fields";
import type { Certification, Education } from "~/lib/portfolio";

interface SpecCredentialsProps {
  education: Education[];
  certifications: Certification[];
}

// The date column is left out when there is no date; the content keeps its own column.
function Entry({ when, title, detail, note }: { when: string | null; title: ReactNode; detail: string; note?: string | null }) {
  return (
    <li className="grid gap-1 sm:grid-cols-[150px_1fr] sm:gap-6">
      {when && <span className="text-[0.95rem] text-ss-muted tabular-nums">{when}</span>}
      <div className="sm:col-start-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        {detail && <p className="text-ss-muted">{detail}</p>}
        {note && <p className="mt-1 max-w-[65ch]">{note}</p>}
      </div>
    </li>
  );
}

export function SpecCredentials({ education, certifications }: SpecCredentialsProps) {
  return (
    <ul className="grid gap-6">
      {education.map((item) => {
        const line = educationLine(item);
        return (
          <Entry
            key={`education-${item.id}`}
            when={line.dates}
            title={line.title}
            detail={line.qualification ? line.institution : ""}
            note={line.description}
          />
        );
      })}
      {certifications.map((cert) => {
        const line = certificationLine(cert);
        return (
          <Entry
            key={`certification-${cert.id}`}
            when={line.date}
            title={line.credentialUrl ? <a href={line.credentialUrl}>{line.name}</a> : line.name}
            detail={line.issuer}
          />
        );
      })}
    </ul>
  );
}
