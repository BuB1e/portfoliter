import type { SectionEntry } from "~/lib/portfolio";

export interface SectionEntriesClassNames {
  list?: string;
  item?: string;
  title?: string;
  detail?: string;
  link?: string;
}

interface SectionEntriesProps {
  entries: SectionEntry[];
  classNames?: SectionEntriesClassNames;
}

// The generic renderer for a free-form section's entries: each title (a link when the entry has one)
// and its detail line. Designs wrap it in their own section chrome and style it through classNames.
export function SectionEntries({ entries, classNames = {} }: SectionEntriesProps) {
  return (
    <ul className={classNames.list}>
      {entries.map((entry, index) => (
        <li key={`${entry.title}-${index}`} className={classNames.item}>
          <span className={classNames.title}>
            {entry.url ? (
              <a href={entry.url} className={classNames.link}>
                {entry.title}
              </a>
            ) : (
              entry.title
            )}
          </span>
          {entry.detail && (
            <>
              {" "}
              <span className={classNames.detail}>{entry.detail}</span>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
