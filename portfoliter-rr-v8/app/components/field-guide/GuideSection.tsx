import type { ReactNode } from "react";

interface GuideSectionProps {
  id: string;
  title: string;
  intro: string;
  children: ReactNode;
}

export function GuideSection({ id, title, intro, children }: GuideSectionProps) {
  return (
    <section aria-labelledby={id} className="pt-16">
      <h2 id={id} className="mb-2 font-fg-serif text-[clamp(2.1rem,4.4vw,3rem)] leading-none font-semibold tracking-[-0.015em]">
        {title}
      </h2>
      <p className="mb-8 max-w-[62ch] font-fg-serif text-[1.1rem] leading-[1.55]">{intro}</p>
      {children}
    </section>
  );
}
