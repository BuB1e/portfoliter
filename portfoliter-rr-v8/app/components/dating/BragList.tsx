import type { SectionEntry } from "~/lib/portfolio";

interface BragListProps {
  awards: SectionEntry[];
}

export function BragList({ awards }: BragListProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
      {awards.map((award, index) => (
        <div key={`${award.title}-${index}`} className="rounded-[22px] bg-lilac p-5 text-ink">
          <strong className="block text-xl leading-tight tracking-tight">
            {award.url ? <a href={award.url}>{award.title}</a> : award.title}
          </strong>
          {award.detail && <span className="text-sm">{award.detail}</span>}
        </div>
      ))}
    </div>
  );
}
