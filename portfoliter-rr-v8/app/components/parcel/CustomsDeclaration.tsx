import { formatMonth, formatRange } from "~/lib/format";
import type { Certification, Education } from "~/lib/portfolio";

interface CustomsDeclarationProps {
  education: Education[];
  certifications: Certification[];
}

const CELL = "border-b border-parcel-ink px-4 py-3 text-left align-top";

export function CustomsDeclaration({ education, certifications }: CustomsDeclarationProps) {
  return (
    <div className="overflow-x-auto border-[3px] border-parcel-ink bg-parcel-label">
      <table className="w-full border-collapse [&_tr:last-child_td]:border-b-0">
        <thead>
          <tr className="bg-parcel-header text-[0.85rem] font-extrabold font-stretch-75%">
            <th scope="col" className={CELL}>Item</th>
            <th scope="col" className={CELL}>Issued by</th>
            <th scope="col" className={CELL}>Date</th>
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
