import type { Experience } from "./portfolio";

// Year of the earliest job start, e.g. "2021"; null when there are no experiences.
export function careerStartYear(experiences: Experience[]): string | null {
  const starts = experiences.map((experience) => experience.startDate).sort();
  return starts[0]?.slice(0, 4) ?? null;
}

// The current job is the one without an end date.
export function currentCompany(experiences: Experience[]): string | null {
  return experiences.find((experience) => !experience.endDate)?.company ?? null;
}
