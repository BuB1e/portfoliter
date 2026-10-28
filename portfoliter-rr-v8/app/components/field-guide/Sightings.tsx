import type { SectionEntry } from "~/lib/portfolio";

interface SightingsProps {
  entries: SectionEntry[];
}

// Awards, and any other free-form section, as observer reports.
export function Sightings({ entries }: SightingsProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
      {entries.map((entry, index) => (
        <div key={`${entry.title}-${index}`} className="border-l-4 border-fg-ochre py-1 pl-4">
          <strong className="block font-fg-serif text-[1.25rem] leading-tight font-semibold">
            {entry.url ? <a href={entry.url}>{entry.title}</a> : entry.title}
          </strong>
          {entry.detail && <span className="text-[0.92rem] text-fg-moss">{entry.detail}</span>}
        </div>
      ))}
    </div>
  );
}
