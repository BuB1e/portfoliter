import type { ReactNode } from "react";

interface ParcelSectionProps {
  id: string;
  title: string;
  note?: string;
  children: ReactNode;
}

export function ParcelSection({ id, title, note, children }: ParcelSectionProps) {
  return (
    <section aria-labelledby={id} className="mt-20">
      <h2 id={id} className={`font-parcel-stencil text-[clamp(2.4rem,6vw,3.6rem)] leading-[0.95] font-black ${note ? "mb-1.5" : "mb-7"}`}>
        {title}
      </h2>
      {note && <p className="mb-7 max-w-[60ch] font-stretch-90%">{note}</p>}
      {children}
    </section>
  );
}
