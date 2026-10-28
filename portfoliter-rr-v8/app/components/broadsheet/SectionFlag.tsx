import type { ReactNode } from "react";

interface SectionFlagProps {
  id: string;
  title: string;
  note?: string;
  children: ReactNode;
}

// A newspaper section: a heavy rule, the section name set large, a one-line standfirst.
export function SectionFlag({ id, title, note, children }: SectionFlagProps) {
  return (
    <section aria-labelledby={id} className="mt-14 border-t-4 border-bs-ink pt-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-bs-ink pb-3">
        <h2 id={id} className="text-[clamp(1.9rem,4.5vw,2.8rem)] leading-none font-bold tracking-[-0.01em]">
          {title}
        </h2>
        {note && <p className="text-[0.95rem] text-bs-grey italic">{note}</p>}
      </div>
      <div className="pt-6">{children}</div>
    </section>
  );
}
