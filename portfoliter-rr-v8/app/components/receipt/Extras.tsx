import { formatMonth, formatRange } from "~/lib/format";
import type { Certification, Education } from "~/lib/portfolio";
import type { SectionItem } from "~/lib/sectionItems";
import type { SkillGroup } from "~/lib/skills";
import { Line, Sub } from "./ReceiptParts";

// Skills as the bag's contents, one line per category with its count; uncategorized ones are "Other".
export function InTheBag({ groups }: { groups: SkillGroup[] }) {
  return (
    <dl className="grid gap-3">
      {groups.map((group) => (
        <div key={group.category}>
          <dt className="font-bold">
            <Line label={group.category} amount={`x${group.names.length}`} />
          </dt>
          <dd className="pl-4">{group.names.join(", ")}</dd>
        </div>
      ))}
    </dl>
  );
}

// Education as the shop's member card.
export function MemberCards({ education }: { education: Education[] }) {
  return (
    <ul className="grid gap-4">
      {education.map((entry) => {
        const plan = [entry.degree, entry.field].filter(Boolean).join(" ");
        const valid = formatRange(entry.startDate, entry.endDate);
        return (
          <li key={entry.id}>
            <h3 className="font-bold">
              <Line label="Member" amount={entry.institution} />
            </h3>
            {plan && <Line label="Plan" amount={plan} />}
            {valid && <Line label="Valid" amount={valid} />}
            {entry.description && <Line label="Points" amount={entry.description} />}
          </li>
        );
      })}
    </ul>
  );
}

// Certifications as coupons applied at the till. Date and link are both optional.
export function Coupons({ certifications }: { certifications: Certification[] }) {
  return (
    <ul className="grid gap-3">
      {certifications.map((cert) => (
        <li key={cert.name}>
          <h3 className="font-bold">
            <Line label={cert.name} amount={cert.issuedDate ? formatMonth(cert.issuedDate) : "Applied"} />
          </h3>
          <Sub>
            Issued by {cert.issuer}
            {cert.credentialUrl && (
              <>
                {", "}
                <a href={cert.credentialUrl} className="text-rc-ink">
                  verify coupon {cert.name}
                </a>
              </>
            )}
          </Sub>
        </li>
      ))}
    </ul>
  );
}

// Any free-form section, printed as plain lines.
export function ExtraLines({ items }: { items: SectionItem[] }) {
  return (
    <ul className="grid gap-2">
      {items.map((item, index) => (
        <li key={`${item.title}-${index}`}>
          <Line label={item.url ? <a href={item.url}>{item.title}</a> : item.title} amount={item.detail || undefined} />
        </li>
      ))}
    </ul>
  );
}
