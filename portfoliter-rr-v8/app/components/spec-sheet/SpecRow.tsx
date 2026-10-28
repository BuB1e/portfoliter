import type { ReactNode } from "react";

interface SpecRowProps {
  id: string;
  label: string;
  children: ReactNode;
}

// One labelled row of the sheet: section name on the left, content on the right.
export function SpecRow({ id, label, children }: SpecRowProps) {
  return (
    <section aria-labelledby={id} className="grid gap-3 border-t border-ss-rule py-10 md:grid-cols-[200px_1fr] md:gap-10">
      <h2 id={id} className="text-[0.95rem] font-medium text-ss-muted">
        {label}
      </h2>
      <div className="min-w-0">{children}</div>
    </section>
  );
}
