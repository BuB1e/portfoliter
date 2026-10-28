import type { SectionEntry } from "~/lib/portfolio";

interface AnnouncementsProps {
  entries: SectionEntry[];
}

// Platform display board: one line per entry of a free-form section (awards, talks, anything else).
export function Announcements({ entries }: AnnouncementsProps) {
  return (
    <ul className="divide-y divide-white/15 rounded-2xl bg-sky-ink px-5 py-2 text-sky-yellow">
      {entries.map((entry, index) => (
        <li key={`${entry.title}-${index}`} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3">
          <span className="font-sky-sign text-xl font-bold">
            {entry.url ? (
              <a href={entry.url} className="text-sky-yellow">
                {entry.title}
              </a>
            ) : (
              entry.title
            )}
          </span>
          {entry.detail && <span className="text-white/75">{entry.detail}</span>}
        </li>
      ))}
    </ul>
  );
}
