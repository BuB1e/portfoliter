import type { ReactNode } from "react";

import { formatMonth, formatRange } from "~/lib/format";
import type { Certification, Education } from "~/lib/portfolio";
import { StatusPill } from "./StatusPill";

interface ComplianceProps {
  education: Education[];
  certifications: Certification[];
}

function Row({ title, detail, label }: { title: ReactNode; detail: string; label: string }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-st-muted">{detail}</p>
      </div>
      <StatusPill tone="up" label={label} />
    </li>
  );
}

export function Compliance({ education, certifications }: ComplianceProps) {
  return (
    <ul className="divide-y divide-st-line">
      {education.map((item) => (
        <Row
          key={item.institution}
          title={[item.degree, item.field].filter(Boolean).join(", ") || item.institution}
          detail={[item.institution, formatRange(item.startDate, item.endDate)].filter(Boolean).join(", ")}
          label="Completed"
        />
      ))}
      {certifications.map((cert) => (
        <Row
          key={cert.name}
          title={cert.credentialUrl ? <a href={cert.credentialUrl} className="text-st-info">{cert.name}</a> : cert.name}
          detail={cert.issuedDate ? `${cert.issuer}, ${formatMonth(cert.issuedDate)}` : cert.issuer}
          label="Verified"
        />
      ))}
    </ul>
  );
}
