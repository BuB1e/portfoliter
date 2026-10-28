import type { SectionEntry } from "~/lib/portfolio";

interface StickersProps {
  awards: SectionEntry[];
}

export function Stickers({ awards }: StickersProps) {
  return (
    <div className="flex flex-wrap gap-6">
      {awards.map((award, index) => (
        <div
          key={`${award.title}-${index}`}
          className="grid size-[150px] place-content-center rounded-full border-4 border-dashed border-parcel-ink bg-parcel-sticker p-5 text-center shadow-[0_5px_0_var(--color-parcel-kraft-dark)] odd:rotate-[5deg] even:-rotate-[7deg] even:bg-parcel-sticker-alt sm:size-[190px]"
        >
          <strong className="font-parcel-stencil text-[1.35rem] leading-none font-black">
            {award.url ? <a href={award.url}>{award.title}</a> : award.title}
          </strong>
          {award.detail && <span className="mt-1.5 text-[0.85rem]">{award.detail}</span>}
        </div>
      ))}
    </div>
  );
}
