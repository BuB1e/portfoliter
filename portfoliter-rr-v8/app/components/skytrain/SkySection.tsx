import type { ReactNode } from "react";

interface SkySectionProps {
  id: string;
  title: string;
  note: string;
  children: ReactNode;
}

export function SkySection({ id, title, note, children }: SkySectionProps) {
  return (
    <section aria-labelledby={id} className="mt-20">
      <h2 id={id} className="font-sky-sign text-[clamp(2.2rem,5vw,3.2rem)] leading-none font-bold">
        {title}
      </h2>
      <p className="mt-2 mb-8 max-w-[60ch] text-sky-muted">{note}</p>
      {children}
    </section>
  );
}
