import { capitalize, LABELS } from "./labels";

export { capitalize };

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Formats "YYYY-MM-DD" by hand so server and client render identical text (no locale drift on hydration).
// A missing date is the open end of a range: "now".
export function formatMonth(date: string | null): string {
  if (!date) {
    return LABELS.present;
  }
  const [year, month] = date.split("-");
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

export function formatRange(start: string | null, end: string | null): string {
  if (!start) {
    return end ? formatMonth(end) : "";
  }
  return `${formatMonth(start)} to ${formatMonth(end)}`;
}

const PLATFORM_NAMES: Record<string, string> = {
  github: "GitHub",
  gitlab: "GitLab",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  x: "X",
};

// "github" -> "GitHub"; unknown platforms are just capitalized.
export function platformName(platform: string): string {
  return PLATFORM_NAMES[platform.toLowerCase()] ?? capitalize(platform);
}

export function firstName(fullName: string): string {
  return fullName.split(" ")[0] ?? fullName;
}

export function initials(fullName: string): string {
  return fullName
    .split(" ")
    .map((word) => word.charAt(0))
    .join("");
}
