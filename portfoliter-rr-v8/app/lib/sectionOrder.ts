// The order of the home page's sections, decided once by the backend (`sectionOrder` in the view,
// docs/portfolio-view.md) instead of in each design. A design maps each key to its own themed block
// and renders them with <OrderedSections> (components/shared/OrderedSections.tsx); in-page navs list
// their entries with inSectionOrder() so they follow the same order. The header and the footer are
// not sections and never move.

// Every key, in the default order: the owner's resume order, with the bio first. Mirrors
// DefaultSectionOrder in portfoliter-go/internal/portfolio/view.go.
export const SECTION_KEYS = ["about", "education", "skills", "experience", "projects", "certifications", "extras"] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

function isSectionKey(key: string): key is SectionKey {
  return (SECTION_KEYS as readonly string[]).includes(key);
}

// The order to render: the given keys first (unknown ones skipped, repeats dropped), then any key the
// list left out, in the default order, so no section can disappear. No list means the default order.
export function resolveSectionOrder(order: readonly string[] | null | undefined): SectionKey[] {
  return [...new Set([...(order ?? []).filter(isSectionKey), ...SECTION_KEYS])];
}

// A design's lists per section (nav entries, ids, ...) joined in section order. Keys the design does
// not map are skipped.
export function inSectionOrder<T>(order: readonly string[] | null | undefined, lists: Partial<Record<SectionKey, readonly T[]>>): T[] {
  return resolveSectionOrder(order).flatMap((key) => lists[key] ?? []);
}
