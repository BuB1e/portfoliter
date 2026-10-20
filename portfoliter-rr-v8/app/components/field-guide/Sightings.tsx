import type { Award } from "~/lib/sections";

interface SightingsProps {
  awards: Award[];
}

export function Sightings({ awards }: SightingsProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
      {awards.map((award) => (
        <div key={award.name} className="border-l-4 border-fg-ochre py-1 pl-4">
          <strong className="block font-fg-serif text-[1.25rem] leading-tight font-semibold">{award.name}</strong>
          {award.note && <span className="text-[0.92rem] text-fg-moss">{award.note}</span>}
        </div>
      ))}
    </div>
  );
}
