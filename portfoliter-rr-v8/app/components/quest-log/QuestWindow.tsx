import type { CSSProperties, ReactNode } from "react";

interface QuestWindowProps {
  id: string;
  title: string;
  note?: string;
  children: ReactNode;
}

// One menu window with its title in gold, the way RPG menus label each panel.
export function QuestWindow({ id, title, note, children }: QuestWindowProps) {
  return (
    <section aria-labelledby={id} className="ql-window scroll-mt-6 px-4 py-5 sm:px-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b-2 border-ql-frame/40 pb-3">
        <h2 id={id} className="text-[1.6rem] leading-none font-bold text-ql-gold">
          {title}
        </h2>
        {note && <p className="text-ql-soft">{note}</p>}
      </div>
      <div className="pt-5">{children}</div>
    </section>
  );
}

// The pointing cursor: kept in the layout (no overlap) and shown only while its entry is hovered or focused.
export function Cursor() {
  return <span aria-hidden="true" className="ql-cursor invisible mt-1.5 inline-block size-3.5 shrink-0 group-hover:visible group-focus-visible:visible" />;
}

// A labelled pixel meter; the bar itself is decorative and its value is spoken through the label.
export function Meter({ label, value, max }: { label: string; value: number; max: number }) {
  const fill = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div role="img" aria-label={label} className="ql-meter h-4 w-full" style={{ "--ql-fill": `${fill}%` } as CSSProperties} />
  );
}

// "Cleared" when the project or job has an end date, "In progress" while it runs.
export function QuestStatus({ endDate }: { endDate: string | null }) {
  return endDate ? (
    <span className="text-ql-green">Cleared</span>
  ) : (
    <span className="text-ql-gold">In progress</span>
  );
}
