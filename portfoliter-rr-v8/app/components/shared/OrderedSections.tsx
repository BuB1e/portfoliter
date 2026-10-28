import { Fragment, type ReactNode } from "react";

import { resolveSectionOrder, type SectionKey } from "~/lib/sectionOrder";

interface OrderedSectionsProps {
  // The view's sectionOrder.
  order: readonly string[] | null | undefined;
  // The design's block for each key; null or false for a section with nothing to show. A key the
  // design leaves out (the bio in a design that prints it in its header) is skipped.
  sections: Partial<Record<SectionKey, ReactNode>>;
}

// Renders a design's home page sections in the central order (lib/sectionOrder.ts).
export function OrderedSections({ order, sections }: OrderedSectionsProps) {
  return resolveSectionOrder(order).map((key) => <Fragment key={key}>{sections[key]}</Fragment>);
}
