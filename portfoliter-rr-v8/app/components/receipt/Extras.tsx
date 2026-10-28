import { certificationLine, educationLine } from "~/lib/fields";
import { skillGroupLabel } from "~/lib/labels";
import type { Certification, Education, SectionEntry, SkillGroup } from "~/lib/portfolio";
import { Line, Sub } from "./ReceiptParts";

// Skills as the bag's contents, one line per category with its count; uncategorized ones are "Other".
export function InTheBag({ groups }: { groups: SkillGroup[] }) {
  return (
    <dl className="grid gap-3">
      {groups.map((group) => (
        <div key={group.key}>
          <dt className="font-bold">
            <Line label={skillGroupLabel(group)} amount={`x${group.skills.length}`} />
          </dt>
          <dd className="pl-4">{group.skills.join(", ")}</dd>
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
        const line = educationLine(entry);
        return (
          <li key={entry.id}>
            <h3 className="font-bold">
              <Line label="Member" amount={line.institution} />
            </h3>
            {line.qualification && <Line label="Plan" amount={line.qualification} />}
            {line.dates && <Line label="Valid" amount={line.dates} />}
            {line.description && <Line label="Points" amount={line.description} />}
          </li>
        );
      })}
    </ul>
  );
}

// Certifications as coupons applied at the till. An undated coupon prints no amount.
export function Coupons({ certifications }: { certifications: Certification[] }) {
  return (
    <ul className="grid gap-3">
      {certifications.map((cert) => {
        const line = certificationLine(cert);
        return (
          <li key={cert.id}>
            <h3 className="font-bold">
              <Line label={line.name} amount={line.date ?? undefined} />
            </h3>
            <Sub>
              Issued by {line.issuer}
              {line.credentialUrl && (
                <>
                  {", "}
                  <a href={line.credentialUrl} className="text-rc-ink">
                    verify coupon {line.name}
                  </a>
                </>
              )}
            </Sub>
          </li>
        );
      })}
    </ul>
  );
}

// Any free-form section, printed as plain lines.
export function ExtraLines({ entries }: { entries: SectionEntry[] }) {
  return (
    <ul className="grid gap-2">
      {entries.map((entry, index) => (
        <li key={`${entry.title}-${index}`}>
          <Line label={entry.url ? <a href={entry.url}>{entry.title}</a> : entry.title} amount={entry.detail ?? undefined} />
        </li>
      ))}
    </ul>
  );
}
