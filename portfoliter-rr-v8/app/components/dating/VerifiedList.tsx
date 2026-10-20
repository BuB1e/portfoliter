import type { ReactNode } from "react";

import { formatMonth, formatRange } from "~/lib/format";
import type { Certification, Education } from "~/lib/portfolio";

interface VerifiedListProps {
  education: Education[];
  certifications: Certification[];
}

function Badge({ title, detail }: { title: ReactNode; detail: string }) {
  return (
    <div className="flex items-center gap-4 rounded-[18px] bg-night-raised px-5 py-4">
      <span aria-hidden="true" className="grid size-9 flex-none place-items-center rounded-full bg-mint font-extrabold text-ink">
        ✓
      </span>
      <div>
        <strong className="block text-lg">{title}</strong>
        <span className="text-sm opacity-75">{detail}</span>
      </div>
    </div>
  );
}

export function VerifiedList({ education, certifications }: VerifiedListProps) {
  return (
    <div className="grid gap-3">
      {education.map((item) => (
        <Badge
          key={item.institution}
          title={[item.degree, item.field].filter(Boolean).join(" in ") || item.institution}
          detail={[item.institution, formatRange(item.startDate, item.endDate)].filter(Boolean).join(", ")}
        />
      ))}
      {certifications.map((cert) => (
        <Badge
          key={cert.name}
          title={cert.credentialUrl ? <a href={cert.credentialUrl}>{cert.name}</a> : cert.name}
          detail={cert.issuedDate ? `${cert.issuer}, ${formatMonth(cert.issuedDate)}` : cert.issuer}
        />
      ))}
    </div>
  );
}
