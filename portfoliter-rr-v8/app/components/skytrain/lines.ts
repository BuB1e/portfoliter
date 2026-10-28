// Line colours (Tailwind token names) handed out in order to skill categories and cards.
export const LINE_COLORS = [
  { bg: "bg-sky-sukhumvit", border: "border-sky-sukhumvit", text: "text-sky-sukhumvit" },
  { bg: "bg-sky-silom", border: "border-sky-silom", text: "text-sky-silom" },
  { bg: "bg-sky-blue", border: "border-sky-blue", text: "text-sky-blue" },
  { bg: "bg-sky-pink", border: "border-sky-pink", text: "text-sky-pink" },
  { bg: "bg-sky-gold", border: "border-sky-gold", text: "text-sky-gold" },
] as const;

export function lineColor(index: number) {
  return LINE_COLORS[index % LINE_COLORS.length];
}
