export type StatusTone = "up" | "info" | "muted";

const TONES: Record<StatusTone, string> = {
  up: "bg-st-up-soft text-st-up",
  info: "bg-st-info/10 text-st-info",
  muted: "bg-st-bg text-st-muted",
};

export function StatusPill({ tone, label }: { tone: StatusTone; label: string }) {
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-sm font-medium whitespace-nowrap ${TONES[tone]}`}>{label}</span>;
}
