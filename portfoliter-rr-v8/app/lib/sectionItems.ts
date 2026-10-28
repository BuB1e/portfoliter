import type { Section } from "./portfolio";

// Free-form sections can hold any JSON items. Designs that render every section, whatever its key,
// read them through here: a title line, an optional detail line and an optional link.
export interface SectionItem {
  title: string;
  detail: string;
  url: string | null;
}

const TITLE_KEYS = ["name", "title", "question", "label", "heading"];
const DETAIL_KEYS = ["note", "answer", "description", "detail", "text", "issuer", "value", "date", "year"];
const URL_KEYS = ["url", "link", "href"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }
  return typeof value === "number" ? String(value) : "";
}

function pick(record: Record<string, unknown>, keys: string[]): string[] {
  return keys.map((key) => text(record[key])).filter(Boolean);
}

function safeUrl(record: Record<string, unknown>): string | null {
  const url = pick(record, URL_KEYS)[0];
  return url && /^https?:\/\//i.test(url) ? url : null;
}

function readItem(item: unknown): SectionItem | null {
  const plain = text(item);
  if (plain) {
    return { title: plain, detail: "", url: null };
  }
  if (!isRecord(item)) {
    return null;
  }
  const titles = pick(item, TITLE_KEYS);
  const details = pick(item, DETAIL_KEYS);
  // Unknown shapes: the first text value is the title, the rest the detail.
  const known = new Set([...TITLE_KEYS, ...DETAIL_KEYS, ...URL_KEYS]);
  const others = Object.entries(item)
    .filter(([key]) => !known.has(key))
    .map(([, value]) => text(value))
    .filter(Boolean);
  const [title, ...rest] = titles.length > 0 ? [...titles, ...details] : [...details, ...others];
  if (!title) {
    return null;
  }
  const detail = (titles.length > 0 ? [...rest, ...others] : rest).join(", ");
  return { title, detail, url: safeUrl(item) };
}

export function sectionItems(section: Section): SectionItem[] {
  return section.items.flatMap((item) => {
    const read = readItem(item);
    return read ? [read] : [];
  });
}

// Every section with at least one readable item, in API order.
export function customSections(sections: Section[]): { key: string; title: string; items: SectionItem[] }[] {
  return sections
    .map((section) => ({ key: section.key, title: section.title, items: sectionItems(section) }))
    .filter((section) => section.items.length > 0);
}
