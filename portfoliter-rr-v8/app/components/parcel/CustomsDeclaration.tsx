import type { ReactNode } from "react";

import { certificationLine, educationLine } from "~/lib/fields";
import type { Certification, Education } from "~/lib/portfolio";

interface CustomsDeclarationProps {
  education: Education[];
  certifications: Certification[];
}

const CELL = "border-b border-parcel-ink px-4 py-3 text-left align-top";

// One declared item. With no date, the issuer cell spans the date column, so no row has an empty box.
function Row({ item, issuer, date }: { item: ReactNode; issuer: ReactNode; date: string | null }) {
  return (
    <tr>
      <td className={CELL}>{item}</td>
      <td className={CELL} colSpan={date ? 1 : 2}>
        {issuer}
      </td>
      {date && <td className={CELL}>{date}</td>}
    </tr>
  );
}

export function CustomsDeclaration({ education, certifications }: CustomsDeclarationProps) {
  return (
    <div className="overflow-x-auto border-[3px] border-parcel-ink bg-parcel-label">
      <table className="w-full border-collapse [&_tr:last-child_td]:border-b-0">
        <thead>
          <tr className="bg-parcel-header text-[0.85rem] font-extrabold font-stretch-75%">
            <th scope="col" className={CELL}>
              Item
            </th>
            <th scope="col" className={CELL}>
              Issued by
            </th>
            <th scope="col" className={CELL}>
              Date
            </th>
          </tr>
        </thead>
        <tbody>
          {education.map((entry) => {
            const line = educationLine(entry);
            return (
              <Row
                key={`education-${entry.id}`}
                item={
                  <>
                    {line.title}
                    {line.description && <span className="mt-1 block text-[0.9rem] font-stretch-85%">{line.description}</span>}
                  </>
                }
                issuer={line.institution}
                date={line.dates}
              />
            );
          })}
          {certifications.map((cert) => {
            const line = certificationLine(cert);
            return (
              <Row
                key={`certification-${cert.id}`}
                item={line.credentialUrl ? <a href={line.credentialUrl}>{line.name}</a> : line.name}
                issuer={line.issuer}
                date={line.date}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
