import type { ReactNode } from "react";

import { certificationLine, educationLine } from "~/lib/fields";
import type { Certification, Education } from "~/lib/portfolio";
import { StatusPill } from "./StatusPill";

interface ComplianceProps {
  education: Education[];
  certifications: Certification[];
}

interface RowProps {
  title: ReactNode;
  detail: string;
  note: string | null;
  // No pill when there is nothing to vouch for (a certification with no credential link).
  label: string | null;
}

function Row({ title, detail, note, label }: RowProps) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
      <div>
        <h3 className="font-semibold">{title}</h3>
        {detail && <p className="text-sm text-st-muted">{detail}</p>}
        {note && <p className="mt-1 max-w-[65ch]">{note}</p>}
      </div>
      {label && <StatusPill tone="up" label={label} />}
    </li>
  );
}

export function Compliance({ education, certifications }: ComplianceProps) {
  return (
    <ul className="divide-y divide-st-line">
      {education.map((entry) => {
        const line = educationLine(entry);
        return (
          <Row
            key={`edu-${entry.id}`}
            title={line.title}
            detail={line.qualification ? line.meta : (line.dates ?? "")}
            note={line.description}
            label={entry.endDate ? "Completed" : "In progress"}
          />
        );
      })}
      {certifications.map((cert) => {
        const line = certificationLine(cert);
        return (
          <Row
            key={`cert-${cert.id}`}
            title={
              line.credentialUrl ? (
                <a href={line.credentialUrl} className="text-st-info">
                  {line.name}
                </a>
              ) : (
                line.name
              )
            }
            detail={line.meta}
            note={null}
            label={line.credentialUrl ? "Verified" : null}
          />
        );
      })}
    </ul>
  );
}
