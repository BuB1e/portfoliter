import { capitalize } from "./format";
import type { Skill } from "./portfolio";

export interface SkillGroup {
  category: string;
  names: string[];
}

// Groups skills by category in first-seen order; skills without one go under "Other".
export function groupSkills(skills: Skill[]): SkillGroup[] {
  const groups = new Map<string, string[]>();
  for (const skill of skills) {
    const category = capitalize(skill.category ?? "other");
    groups.set(category, [...(groups.get(category) ?? []), skill.name]);
  }
  return [...groups].map(([category, names]) => ({ category, names }));
}
