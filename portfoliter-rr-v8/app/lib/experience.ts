import type { Experience } from "./portfolio";

export function companyById(experiences: Experience[]): Record<number, string> {
  return Object.fromEntries(experiences.map((experience) => [experience.id, experience.company]));
}

// The current job is the one without an end date.
export function currentCompany(experiences: Experience[]): string | null {
  return experiences.find((experience) => !experience.endDate)?.company ?? null;
}
