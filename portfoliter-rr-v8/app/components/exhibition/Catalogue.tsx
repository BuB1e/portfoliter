import type { ReactNode } from "react";

export interface CatalogueEntry {
  key: string;
  title: ReactNode;
  // what sits against the right edge: dates, an issuer
  side?: ReactNode;
  detail?: ReactNode;
}

// A page of the show's catalogue: the heading on the left third, the entries in the remaining width, each
// title at lead size with its dates against the right edge and its note under it.
export function Catalogue({ id, title, entries }: { id: string; title: string; entries: CatalogueEntry[] }) {
  return (
    <section aria-labelledby={id} className="ex-section ex-wrap grid gap-10 md:grid-cols-12">
      <h2 id={id} data-reveal="" className="ex-heading md:col-span-4">
        {title}
      </h2>
      <ul className="flex flex-col gap-10 md:col-span-8">
        {entries.map((entry, index) => (
          <li key={entry.key} data-reveal="" style={{ "--i": Math.min(index, 5) } as React.CSSProperties}>
            <div className="ex-lead flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1">
              <span className="font-semibold">{entry.title}</span>
              {entry.side && <span className="text-ex-dim tabular-nums">{entry.side}</span>}
            </div>
            {entry.detail && <div className="mt-2 max-w-[64ch]">{entry.detail}</div>}
          </li>
        ))}
      </ul>
    </section>
  );
}
