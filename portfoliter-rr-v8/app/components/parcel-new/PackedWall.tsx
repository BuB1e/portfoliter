import { Link } from "react-router";

import { Cover } from "~/components/shared/Cover";
import { linkedName } from "~/lib/fields";
import { formatMonth } from "~/lib/format";
import type { Project } from "~/lib/portfolio";
import { projectPath, shortDescription } from "~/lib/projects";
import { barcodeBars, barcodeWidth } from "./Barcode";

export const FEATURED_LABEL = "Priority";

// Rows of the wall cycle through these heights, so tile edges never line up from row to row.
const ROW_HEIGHTS = [340, 240, 300, 260];

// A project with no cover gets a drawn box, seen from above: two flaps, a strip of tape down the seam and
// a label whose barcode comes from the project's slug, so each drawn box is a little different.
export function DrawnCover({ slug }: { slug: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="pn-tile-drawn block h-full w-full">
      <rect width="400" height="300" fill="var(--color-pn-kraft-deep)" />
      <rect width="140" height="300" fill="var(--color-pn-kraft-light)" opacity="0.18" />
      <rect x="116" width="48" height="300" fill="var(--color-pn-kraft-light)" />
      <rect x="184" y="150" width="120" height="96" fill="var(--color-pn-paper)" />
      <g transform={`translate(198 166) scale(${92 / barcodeWidth(slug)} 1)`} fill="var(--color-pn-ink)">
        {barcodeBars(slug).map((bar) => (
          <rect key={bar.x} x={bar.x} width={bar.width} height="48" />
        ))}
      </g>
      <rect x="198" y="226" width="56" height="8" fill="var(--color-pn-ink)" />
    </svg>
  );
}

function Tile({ project, height, step }: { project: Project; height: number; step: number }) {
  const from = linkedName(project);
  const dates = project.startDate ? [formatMonth(project.startDate), project.endDate && formatMonth(project.endDate)].filter(Boolean).join(" to ") : null;
  const facts = [from, dates].filter(Boolean).join(", ");

  return (
    <li
      data-reveal=""
      className="min-w-[min(100%,280px)] flex-[1_1_auto] lg:max-w-[640px]"
      style={{ flexBasis: project.coverUrl ? `${height * 1.45}px` : "300px", "--i": step } as React.CSSProperties}
    >
      <Link to={projectPath(project.slug)} className="pn-tile">
        <span className="block overflow-hidden bg-pn-kraft-deep" style={{ height }}>
          <Cover url={project.coverUrl} title={project.title} className="h-full w-full object-cover" fallback={<DrawnCover slug={project.slug} />} />
        </span>
        <span className="mt-4 block">
          {project.isFeatured && <span className="pn-small mr-2 bg-pn-tape px-2 py-0.5 align-middle font-bold text-pn-paper">{FEATURED_LABEL}</span>}
          <span className="pn-tile-title text-[1.375rem] leading-tight font-bold">{project.title}</span>
        </span>
        {facts && <span className="pn-small mt-1 block font-semibold">{facts}</span>}
        <span className="mt-2 block max-w-[52ch]">{shortDescription(project.summary)}</span>
        {project.skills.length > 0 && <span className="pn-small mt-2 block">{project.skills.join(", ")}</span>}
      </Link>
    </li>
  );
}

// A packing list: the group's name set huge, then its projects packed into an uneven wall of pictures.
export function PackedWall({ id, title, note, projects }: { id: string; title: string; note: string; projects: Project[] }) {
  return (
    <section aria-labelledby={id} className="pn-section pn-wrap">
      <div data-reveal="" className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
        <h2 id={id} className="pn-display">
          {title}
        </h2>
        <p className="max-w-[34ch]">{note}</p>
      </div>
      <ul className="mt-12 flex flex-wrap gap-x-4 gap-y-14">
        {projects.map((project, index) => (
          <Tile key={project.id} project={project} height={ROW_HEIGHTS[Math.floor(index / 3) % ROW_HEIGHTS.length]} step={index % 3} />
        ))}
      </ul>
    </section>
  );
}
