import { findSection } from "./fields";
import type { Section, SectionEntry } from "./portfolio";

// Section keys some designs give a look of their own. Every other section is rendered by the design's
// generic renderer (customSections() in lib/fields.ts), so no section is ever dropped.
export const PROMPTS_KEY = "prompts";
export const AWARDS_KEY = "awards";
export const FEATURED_SECTION_KEYS = [PROMPTS_KEY, AWARDS_KEY] as const;

// The prompts section ({question, answer} items) as question and answer pairs, read from its entries.
export function getPrompts(sections: Section[]): { title: string; prompts: { question: string; answer: string }[] } | null {
  const section = findSection(sections, PROMPTS_KEY);
  if (!section) {
    return null;
  }
  return {
    title: section.title,
    prompts: section.entries.map((entry) => ({ question: entry.title, answer: entry.detail ?? "" })),
  };
}

// The awards section ({name, note} items, any extra keys folded into the detail).
export function getAwards(sections: Section[]): { title: string; awards: SectionEntry[] } | null {
  const section = findSection(sections, AWARDS_KEY);
  return section ? { title: section.title, awards: section.entries } : null;
}
