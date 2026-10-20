import type { ReactNode } from "react";

interface StatusCardProps {
  id: string;
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}

export function StatusCard({ id, title, aside, children }: StatusCardProps) {
  return (
    <section aria-labelledby={id} className="mt-10">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2 id={id} className="text-xl font-semibold">
          {title}
        </h2>
        {aside && <span className="text-sm text-st-muted">{aside}</span>}
      </div>
      <div className="rounded-xl border border-st-line bg-st-card">{children}</div>
    </section>
  );
}
