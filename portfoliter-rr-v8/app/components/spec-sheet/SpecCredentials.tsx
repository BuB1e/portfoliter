import type { ReactNode } from "react";

import { formatMonth, formatRange } from "~/lib/format";
import type { Certification, Education } from "~/lib/portfolio";

interface SpecCredentialsProps {
  education: Education[];
  certifications: Certification[];
}

function Entry({ when, title, detail }: { when: string; title: ReactNode; detail: string }) {
  return (
    <li className="grid gap-1 sm:grid-cols-[150px_1fr] sm:gap-6">
      <span className="text-[0.95rem] text-ss-muted tabular-nums">{when}</span>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-ss-muted">{detail}</p>
      </div>
    </li>
  );
}

export function SpecCredentials({ education, certifications }: SpecCredentialsProps) {
  return (
    <ul className="grid gap-6">
      {education.map((item) => (
        <Entry
          key={item.institution}
          when={formatRange(item.startDate, item.endDate)}
          title={[item.degree, item.field].filter(Boolean).join(", ") || item.institution}
          detail={item.institution}
        />
      ))}
      {certifications.map((cert) => (
        <Entry
          key={cert.name}
          when={cert.issuedDate ? formatMonth(cert.issuedDate) : ""}
          title={cert.credentialUrl ? <a href={cert.credentialUrl}>{cert.name}</a> : cert.name}
          detail={cert.issuer}
        />
      ))}
    </ul>
  );
}
