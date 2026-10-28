import type { ReactNode } from "react";

// The till roll: a narrow strip of paper with torn edges, centred on the counter. The drop shadow sits on
// the wrapper because the mask on the paper would clip its own shadow.
export function Paper({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-[40rem] drop-shadow-[0_10px_14px_rgb(0_0_0/0.28)]">
      <div className="rc-tear rc-print bg-rc-paper px-4 pt-10 pb-12 text-[0.9rem] leading-relaxed font-stretch-[87.5%] sm:px-9 sm:pt-14 sm:pb-16 sm:text-[0.95rem]">
        {children}
      </div>
    </div>
  );
}

const RULES = {
  dotted: "border-dotted",
  dashed: "border-dashed",
  double: "border-double border-t-[5px]",
} as const;

export function Rule({ kind = "dashed" }: { kind?: keyof typeof RULES }) {
  return <hr className={`my-6 border-0 border-t-2 border-rc-ink ${RULES[kind]}`} />;
}

interface DeptProps {
  id: string;
  title: string;
  note?: string;
  children: ReactNode;
}

// One block of the receipt under a centred department header, the way tills print "** DAIRY **".
export function Dept({ id, title, note, children }: DeptProps) {
  return (
    <section aria-labelledby={id} className="mt-8 first:mt-0">
      <h2 id={id} className="text-center text-[1.05em] font-bold font-stretch-[112.5%]">
        <span aria-hidden="true">** </span>
        {title}
        <span aria-hidden="true"> **</span>
      </h2>
      {note && <p className="mt-1 text-center text-rc-faded">{note}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

interface LineProps {
  label: ReactNode;
  amount?: ReactNode;
  isStrong?: boolean;
}

// "Label ........ amount": the dotted leader stretches between them and the label wraps when long.
// A span (shown as flex) so it can also sit inside a heading.
export function Line({ label, amount, isStrong = false }: LineProps) {
  return (
    <span className={`flex items-baseline gap-2 ${isStrong ? "font-bold" : ""}`}>
      <span className="min-w-0 [overflow-wrap:anywhere]">{label}</span>
      {amount !== undefined && amount !== "" && (
        <>
          <span aria-hidden="true" className="min-w-6 flex-1 translate-y-[-0.3em] border-b-2 border-dotted border-rc-faded/60" />
          <span className="min-w-0 text-right tabular-nums [overflow-wrap:anywhere]">{amount}</span>
        </>
      )}
    </span>
  );
}

// Detail lines printed under an item, indented like a till's modifier lines.
export function Sub({ children, isFaded = true }: { children: ReactNode; isFaded?: boolean }) {
  return <p className={`pl-4 break-words ${isFaded ? "text-rc-faded" : ""}`}>{children}</p>;
}

// Reverse-video tag, the way two-colour thermal printers mark promotions.
export function Tag({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <span id={id} className="mr-2 inline-block bg-rc-red px-1.5 text-[0.85em] font-bold text-rc-paper">
      {children}
    </span>
  );
}

function hash(text: string): number {
  let value = 2166136261;
  for (let i = 0; i < text.length; i++) {
    value = Math.imul(value ^ text.charCodeAt(i), 16777619);
  }
  return value >>> 0;
}

// Bars drawn from the code itself, so the server and the browser print the same barcode. Decorative only:
// the code is printed in plain text underneath.
export function Barcode({ code }: { code: string }) {
  const bars: { x: number; width: number }[] = [];
  let x = 0;
  for (const char of `*${code}*`) {
    const seed = hash(char + code.length);
    for (let i = 0; i < 4; i++) {
      const bar = 1 + ((seed >>> (i * 4)) % 3);
      const gap = 1 + ((seed >>> (i * 4 + 2)) % 2);
      bars.push({ x, width: bar });
      x += bar + gap;
    }
  }
  return (
    <div className="mt-8 text-center">
      <svg aria-hidden="true" viewBox={`0 0 ${x} 40`} preserveAspectRatio="none" className="mx-auto h-16 w-full max-w-[22rem]">
        {bars.map((bar) => (
          <rect key={bar.x} x={bar.x} y="0" width={bar.width} height="40" fill="currentColor" />
        ))}
      </svg>
      <p className="mt-1 tracking-[0.3em] break-all">{code}</p>
    </div>
  );
}

// Whole months a job lasted, counting both the first and the last month ("Oct 2025 to Feb 2026" is 5).
export function monthsBetween(start: string, end: string): number {
  const [startYear, startMonth] = start.split("-").map(Number);
  const [endYear, endMonth] = end.split("-").map(Number);
  return Math.max(1, (endYear - startYear) * 12 + (endMonth - startMonth) + 1);
}

// The price column of a project line: the year it finished, "Now" while it runs, nothing without dates.
export function yearTag(startDate: string | null, endDate: string | null): string {
  if (endDate) {
    return endDate.slice(0, 4);
  }
  return startDate ? "Now" : "";
}
