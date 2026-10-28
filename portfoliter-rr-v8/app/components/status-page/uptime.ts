export const UPTIME_DAYS = 90;

const INCIDENTS = ["YAML indentation", "DNS, again", "a Friday deploy", "cache invalidation", "a timezone bug", "an expired certificate"];

export interface UptimeDay {
  isDegraded: boolean;
  reason: string;
}

// Small string hash so every skill gets the same bars on the server and in the browser.
function hash(text: string): number {
  let value = 2166136261;
  for (let i = 0; i < text.length; i++) {
    value = Math.imul(value ^ text.charCodeAt(i), 16777619);
  }
  return value >>> 0;
}

// Mostly green, with one or two degraded days per skill. Purely decorative and deterministic.
export function uptimeDays(name: string): UptimeDay[] {
  const seed = hash(name);
  const degradedDays = new Set([seed % UPTIME_DAYS, (seed >>> 8) % 3 === 0 ? (seed >>> 16) % UPTIME_DAYS : -1]);
  return Array.from({ length: UPTIME_DAYS }, (_, day) => ({
    isDegraded: degradedDays.has(day),
    reason: degradedDays.has(day) ? INCIDENTS[(seed + day) % INCIDENTS.length] : "",
  }));
}

export function uptimePercent(days: UptimeDay[]): string {
  const up = days.filter((day) => !day.isDegraded).length;
  // A degraded day counts as roughly an hour down, not a full day.
  const ratio = 1 - (days.length - up) / (days.length * 24);
  return `${(ratio * 100).toFixed(2)}%`;
}
