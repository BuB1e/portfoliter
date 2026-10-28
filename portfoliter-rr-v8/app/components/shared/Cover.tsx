import type { ReactNode } from "react";

interface CoverProps {
  url: string | null;
  title: string;
  className?: string;
  // Rendered when the project has no cover; nothing by default.
  fallback?: ReactNode;
  // Covers below the fold load lazily; a project page's main cover should not.
  isLazy?: boolean;
}

// A project's cover image with alt text naming the project, or the design's fallback.
export function Cover({ url, title, className, fallback = null, isLazy = true }: CoverProps) {
  if (!url) {
    return fallback;
  }
  return <img src={url} alt={`Cover of ${title}`} className={className} loading={isLazy ? "lazy" : undefined} />;
}
