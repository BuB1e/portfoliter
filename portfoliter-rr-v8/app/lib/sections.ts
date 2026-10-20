import type { Section } from "./portfolio";

// Free-form sections store items as JSON; these readers keep only well-formed items.
// Expected item shapes: prompts {question, answer}; awards {name, note}.

export interface Prompt {
  question: string;
  answer: string;
}

export interface Award {
  name: string;
  note: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function findSection(sections: Section[], key: string): Section | undefined {
  return sections.find((section) => section.key === key);
}

export function getPrompts(sections: Section[]): Prompt[] {
  const items = findSection(sections, "prompts")?.items ?? [];
  return items.flatMap((item) =>
    isRecord(item) && typeof item.question === "string" && typeof item.answer === "string"
      ? [{ question: item.question, answer: item.answer }]
      : [],
  );
}

export function getAwards(sections: Section[]): { title: string; awards: Award[] } | null {
  const section = findSection(sections, "awards");
  if (!section) {
    return null;
  }
  const awards = section.items.flatMap((item) =>
    isRecord(item) && typeof item.name === "string"
      ? [{ name: item.name, note: typeof item.note === "string" ? item.note : "" }]
      : [],
  );
  return { title: section.title, awards };
}
