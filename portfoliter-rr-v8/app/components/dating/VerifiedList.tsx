import type { ReactNode } from "react";

import { certificationLine, educationLine } from "~/lib/fields";
import type { Certification, Education } from "~/lib/portfolio";

interface VerifiedListProps {
  education: Education[];
  certifications: Certification[];
}

function Badge({ title, detail, note }: { title: ReactNode; detail: string; note?: string | null }) {
  return (
    <div className="flex items-center gap-4 rounded-[18px] bg-night-raised px-5 py-4">
      <span aria-hidden="true" className="grid size-9 flex-none place-items-center rounded-full bg-mint font-extrabold text-ink">
        ✓
      </span>
      <div>
        <strong className="block text-lg">{title}</strong>
        {detail && <span className="block text-sm opacity-75">{detail}</span>}
        {note && <span className="block text-sm">{note}</span>}
      </div>
    </div>
  );
}

// Schools and certifications as verification badges. A missing date or link leaves no gap.
export function VerifiedList({ education, certifications }: VerifiedListProps) {
  return (
    <div className="grid gap-3">
      {education.map((entry) => {
        const line = educationLine(entry);
        return <Badge key={entry.id} title={line.title} detail={line.qualification ? line.meta : (line.dates ?? "")} note={line.description} />;
      })}
      {certifications.map((cert) => {
        const line = certificationLine(cert);
        return (
          <Badge key={cert.id} title={line.credentialUrl ? <a href={line.credentialUrl}>{line.name}</a> : line.name} detail={line.meta} />
        );
      })}
    </div>
  );
}
