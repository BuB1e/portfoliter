import { certificationLine, educationLine } from "~/lib/fields";
import type { Certification, Education } from "~/lib/portfolio";

interface BandingRecordsProps {
  education: Education[];
  certifications: Certification[];
}

const CELL = "border-b border-fg-pine/30 px-4 py-3 text-left align-top";

// One row per tag. A record with no date lets "Banded by" span the "When" column, so no cell is empty.
export function BandingRecords({ education, certifications }: BandingRecordsProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border-[1.5px] border-fg-pine bg-fg-paper [&_tr:last-child_td]:border-b-0">
        <thead>
          <tr className="bg-fg-header text-[0.9rem]">
            <th scope="col" className={`${CELL} font-semibold`}>Record</th>
            <th scope="col" className={`${CELL} font-semibold`}>Banded by</th>
            <th scope="col" className={`${CELL} font-semibold`}>When</th>
          </tr>
        </thead>
        <tbody>
          {education.map((entry) => {
            const line = educationLine(entry);
            return (
              <tr key={`education-${entry.id}`}>
                <td className={CELL}>
                  {line.title}
                  {line.description && <span className="block text-[0.9rem] text-fg-moss">{line.description}</span>}
                </td>
                <td className={CELL} colSpan={line.dates ? 1 : 2}>
                  {line.institution}
                </td>
                {line.dates && <td className={CELL}>{line.dates}</td>}
              </tr>
            );
          })}
          {certifications.map((cert) => {
            const line = certificationLine(cert);
            return (
              <tr key={`certification-${cert.id}`}>
                <td className={CELL}>{line.credentialUrl ? <a href={line.credentialUrl}>{line.name}</a> : line.name}</td>
                <td className={CELL} colSpan={line.date ? 1 : 2}>
                  {line.issuer}
                </td>
                {line.date && <td className={CELL}>{line.date}</td>}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
