import type { ReactNode } from "react";

interface FeedSectionProps {
  id: string;
  title: string;
  lede: string;
  children: ReactNode;
}

export function FeedSection({ id, title, lede, children }: FeedSectionProps) {
  return (
    <section aria-labelledby={id} className="mb-16">
      <h2 id={id} className="mb-2 text-[clamp(2rem,4.2vw,3rem)] leading-none font-extrabold tracking-tighter">
        {title}
      </h2>
      <p className="mb-6 max-w-[56ch] opacity-80">{lede}</p>
      {children}
    </section>
  );
}
