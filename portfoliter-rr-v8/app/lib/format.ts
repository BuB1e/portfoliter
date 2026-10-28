const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Formats "YYYY-MM-DD" by hand so server and client render identical text (no locale drift on hydration).
export function formatMonth(date: string | null): string {
  if (!date) {
    return "now";
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

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
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
