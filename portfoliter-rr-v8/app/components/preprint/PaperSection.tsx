import type { ReactNode } from "react";

interface PaperSectionProps {
  id: string;
  title: string;
  children: ReactNode;
  // Figures run wider than the text block, as a full-width figure does in a two-column paper.
  isWide?: boolean;
}

// One section of the paper: its heading and its text in the paper's single measure.
export function PaperSection({ id, title, children, isWide = false }: PaperSectionProps) {
  return (
    <section aria-labelledby={id} className="pp-section pp-wrap">
      <div className={isWide ? "" : "pp-column"}>
        <h2 id={id} data-reveal="" className={`pp-heading ${isWide ? "pp-column" : ""}`}>
          {title}
        </h2>
        <div data-reveal="" style={{ "--i": 1 } as React.CSSProperties} className="mt-8">
          {children}
        </div>
      </div>
    </section>
  );
}
