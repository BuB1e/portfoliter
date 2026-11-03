import type { ReactNode } from "react";

export interface LineUpRow {
  key: string;
  // Up to four cells, set at one size: the first is the name, the last sits against the right edge.
  cells: ReactNode[];
  // A note under the row at body size: a description, a skill list.
  note?: ReactNode;
}

interface LineUpProps {
  id: string;
  title: string;
  lede: string;
  rows: LineUpRow[];
  // Short rows (interests) run in two columns from md up so the width is used.
  isTwoColumn?: boolean;
  // A short section (one school, two certificates) sits on a full-width blush field so its screen is not
  // left as empty ground.
  isField?: boolean;
}

// A profile section as a line-up: the heading and its one-line joke, then every row at a single type size,
// lined up on fixed column starts instead of being boxed in cards.
export function LineUp({ id, title, lede, rows, isTwoColumn = false, isField = false }: LineUpProps) {
  const section = (
    <section aria-labelledby={id} className={isField ? "dn-wrap py-[clamp(72px,9vw,140px)]" : "dn-section dn-wrap"}>
      <div data-reveal="" className="grid gap-4 md:grid-cols-12 md:items-end">
        <h2 id={id} className="dn-heading md:col-span-7">
          {title}
        </h2>
        <p className="max-w-[40ch] md:col-span-4 md:col-start-9">{lede}</p>
      </div>
      <ul className={`mt-12 grid gap-x-10 gap-y-8 ${isTwoColumn ? "md:grid-cols-2" : ""}`}>
        {rows.map((row, index) => (
          <li key={row.key} data-reveal="" style={{ "--i": Math.min(index, 6) } as React.CSSProperties}>
            <div className="dn-lineup grid gap-x-6 md:grid-cols-[minmax(0,4fr)_minmax(0,4fr)_minmax(0,4fr)]">
              {row.cells.map((cell, cellIndex) => (
                <span key={cellIndex} className={cellIndex === 0 ? "font-semibold" : cellIndex === row.cells.length - 1 && cellIndex > 0 ? "md:text-right tabular-nums" : ""}>
                  {cell}
                </span>
              ))}
            </div>
            {row.note && <div className="mt-2 max-w-[64ch]">{row.note}</div>}
          </li>
        ))}
      </ul>
    </section>
  );
  // A field is its own separation (a change of ground), so it takes no section gap above it.
  return isField ? <div className="mt-[var(--dn-margin)] bg-dn-blush">{section}</div> : section;
}
