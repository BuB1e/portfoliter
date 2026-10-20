import type { Award } from "~/lib/sections";

interface AnnouncementsProps {
  awards: Award[];
}

// Platform display board: one line per award.
export function Announcements({ awards }: AnnouncementsProps) {
  return (
    <ul className="divide-y divide-white/15 rounded-2xl bg-sky-ink px-5 py-2 text-sky-yellow">
      {awards.map((award) => (
        <li key={award.name} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3">
          <span className="font-sky-sign text-xl font-bold">{award.name}</span>
          {award.note && <span className="text-white/75">{award.note}</span>}
        </li>
      ))}
    </ul>
  );
}
