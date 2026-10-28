import { formatMonth, formatRange } from "~/lib/format";
import type { Certification, Education } from "~/lib/portfolio";

interface BandingRecordsProps {
  education: Education[];
  certifications: Certification[];
}

const CELL = "border-b border-fg-pine/30 px-4 py-3 text-left";

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
          {education.map((item) => (
            <tr key={item.institution}>
              <td className={CELL}>{[item.degree, item.field].filter(Boolean).join(", ") || item.institution}</td>
              <td className={CELL}>{item.institution}</td>
              <td className={CELL}>{formatRange(item.startDate, item.endDate)}</td>
            </tr>
          ))}
          {certifications.map((cert) => (
            <tr key={cert.name}>
              <td className={CELL}>{cert.credentialUrl ? <a href={cert.credentialUrl}>{cert.name}</a> : cert.name}</td>
              <td className={CELL}>{cert.issuer}</td>
              <td className={CELL}>{cert.issuedDate ? formatMonth(cert.issuedDate) : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
