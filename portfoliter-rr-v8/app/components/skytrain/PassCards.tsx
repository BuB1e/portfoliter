import type { ReactNode } from "react";

import { certificationLine, educationLine } from "~/lib/fields";
import type { Certification, Education } from "~/lib/portfolio";

interface PassCardsProps {
  education: Education[];
  certifications: Certification[];
}

const CARD_COLORS = ["bg-sky-blue", "bg-sky-pink", "bg-sky-silom"];

interface PassProps {
  color: string;
  title: ReactNode;
  issuer: string;
  when: string | null;
  note: string | null;
}

// Stored-value card look: education and certifications are the passes this rider holds. Lines with
// no value (a certification with no date) are left off the card.
function Pass({ color, title, issuer, when, note }: PassProps) {
  return (
    <li className={`flex min-h-[200px] max-w-[360px] flex-col justify-between gap-4 rounded-2xl p-5 text-white ${color}`}>
      <div className="flex items-start justify-between gap-3">
        <span className="font-sky-sign text-lg font-bold">{issuer}</span>
        <span aria-hidden="true" className="h-7 w-10 flex-none rounded-md bg-sky-yellow/90" />
      </div>
      <div>
        <h3 className="font-sky-sign text-2xl leading-tight font-bold">{title}</h3>
        {note && <p className="mt-1 text-white/90">{note}</p>}
        {when && <p className="mt-1 text-sm text-white/80">{when}</p>}
      </div>
    </li>
  );
}

export function PassCards({ education, certifications }: PassCardsProps) {
  const passes = [
    ...education.map((entry) => {
      const line = educationLine(entry);
      return { key: `edu-${entry.id}`, title: line.title, issuer: line.institution, when: line.dates, note: line.description };
    }),
    ...certifications.map((cert) => {
      const line = certificationLine(cert);
      return {
        key: `cert-${cert.id}`,
        title: line.credentialUrl ? (
          <a href={line.credentialUrl} className="text-white">
            {line.name}
          </a>
        ) : (
          line.name
        ),
        issuer: line.issuer,
        when: line.date,
        note: null,
      };
    }),
  ];

  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {passes.map((pass, index) => (
        <Pass key={pass.key} color={CARD_COLORS[index % CARD_COLORS.length]} title={pass.title} issuer={pass.issuer} when={pass.when} note={pass.note} />
      ))}
    </ul>
  );
}
