import type { ReactNode } from "react";

import { formatMonth, formatRange } from "~/lib/format";
import type { Certification, Education } from "~/lib/portfolio";

interface PassCardsProps {
  education: Education[];
  certifications: Certification[];
}

const CARD_COLORS = ["bg-sky-blue", "bg-sky-pink", "bg-sky-silom"];

// Stored-value card look: education and certifications are the passes this rider holds.
function Pass({ color, title, issuer, when }: { color: string; title: ReactNode; issuer: string; when: string }) {
  return (
    <li className={`flex aspect-[1.586] max-w-[360px] flex-col justify-between rounded-2xl p-5 text-white ${color}`}>
      <div className="flex items-start justify-between gap-3">
        <span className="font-sky-sign text-lg font-bold">{issuer}</span>
        <span aria-hidden="true" className="h-7 w-10 flex-none rounded-md bg-sky-yellow/90" />
      </div>
      <div>
        <h3 className="font-sky-sign text-2xl leading-tight font-bold">{title}</h3>
        {when && <p className="mt-1 text-sm text-white/80">{when}</p>}
      </div>
    </li>
  );
}

export function PassCards({ education, certifications }: PassCardsProps) {
  const passes = [
    ...education.map((item) => ({
      key: item.institution,
      title: [item.degree, item.field].filter(Boolean).join(", ") || item.institution,
      issuer: item.institution,
      when: formatRange(item.startDate, item.endDate),
    })),
    ...certifications.map((cert) => ({
      key: cert.name,
      title: cert.credentialUrl ? <a href={cert.credentialUrl} className="text-white">{cert.name}</a> : cert.name,
      issuer: cert.issuer,
      when: cert.issuedDate ? formatMonth(cert.issuedDate) : "",
    })),
  ];

  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {passes.map((pass, index) => (
        <Pass key={pass.key} color={CARD_COLORS[index % CARD_COLORS.length]} title={pass.title} issuer={pass.issuer} when={pass.when} />
      ))}
    </ul>
  );
}
