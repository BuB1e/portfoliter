import type { Award } from "~/lib/sections";

interface BragListProps {
  awards: Award[];
}

export function BragList({ awards }: BragListProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
      {awards.map((award) => (
        <div key={award.name} className="rounded-[22px] bg-lilac p-5 text-ink">
          <strong className="block text-xl leading-tight tracking-tight">{award.name}</strong>
          {award.note && <span className="text-sm">{award.note}</span>}
        </div>
      ))}
    </div>
  );
}
