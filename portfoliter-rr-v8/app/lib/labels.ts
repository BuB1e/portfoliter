import type { SkillGroup } from "./portfolio";

// Words that name data and must read the same in every design. Designs keep their own tone for
// headings and copy; these are the shared defaults they build on.
export const LABELS = {
  // Heading of the skill group the backend returns with key "other" (skills with no category).
  otherSkills: "Other",
  // Default marker for a featured project; designs may name it their own way ("Staff pick").
  featured: "Featured",
  // End of a date range that is still running: "Mar 2024 to now".
  present: "now",
} as const;

const EMPLOYMENT_TYPES: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  contractor: "Contract",
  freelance: "Freelance",
  freelancer: "Freelance",
  internship: "Internship",
  intern: "Internship",
  "self-employed": "Self-employed",
  apprenticeship: "Apprenticeship",
  temporary: "Temporary",
  seasonal: "Seasonal",
  volunteer: "Volunteer",
  "co-op": "Co-op",
};

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// "full_time", "Full Time" and "full-time" all read "Full-time"; unknown types are capitalized as written.
export function employmentTypeLabel(type: string | null): string | null {
  const trimmed = type?.trim();
  if (!trimmed) {
    return null;
  }
  return EMPLOYMENT_TYPES[trimmed.toLowerCase().replace(/[\s_]+/g, "-")] ?? capitalize(trimmed);
}

// "language" -> "Language"; the uncategorized group -> "Other".
export function skillGroupLabel(group: Pick<SkillGroup, "category">): string {
  return group.category ? capitalize(group.category) : LABELS.otherSkills;
}
