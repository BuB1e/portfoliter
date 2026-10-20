import type { ReactNode } from "react";

import { type ProjectFilter, useProjectFilter } from "~/hooks/useProjectFilter";
import { formatRange } from "~/lib/format";
import type { Project } from "~/lib/portfolio";

const FILTERS: [ProjectFilter, string][] = [
  ["ALL", "All specimens"],
  ["WORK", "Domesticated (work)"],
  ["PERSONAL", "Wild (personal)"],
];

const COVERS = [
  "repeating-radial-gradient(circle at 30% 60%, #dde5d3 0 10px, #c9d6bb 10px 20px)",
  "linear-gradient(160deg, #e2a93b 0 35%, #6f8a5e 35% 70%, #1f3a2e 70%)",
  "radial-gradient(ellipse at 50% 100%, #6f8a5e 0 45%, transparent 46%), linear-gradient(#f2d48f, #e2a93b)",
  "repeating-linear-gradient(110deg, #a4462b 0 6px, #dde5d3 6px 22px)",
];

interface SpecimenGridProps {
  projects: Project[];
  companyById: Record<number, string>;
}

function LabelRow({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[5.5rem_1fr] gap-2.5 border-t border-dashed border-fg-pine/35 pt-1.5 text-[0.92rem]">
      <span className="font-semibold">{term}</span>
      <span>{children}</span>
    </div>
  );
}

function Specimen({ project, company }: { project: Project; company: string | null }) {
  const cover = project.coverUrl ? `url(${project.coverUrl}) center/cover` : COVERS[project.id % COVERS.length];
  const habitat = project.projectType === "WORK" ? `Domesticated, raised at ${company ?? "a company"}` : "Wild, found in the evenings";

  return (
    <article className="flex flex-col border-[1.5px] border-fg-pine bg-fg-paper">
      <div aria-hidden="true" className="relative aspect-video border-b-[1.5px] border-fg-pine" style={{ background: cover }}>
        <span className="absolute top-3.5 left-1/2 size-3.5 -translate-x-1/2 rounded-full bg-fg-rust shadow-[0_2px_0_rgb(0_0_0/0.25)]" />
      </div>
      <div className="grid flex-1 content-start gap-1.5 px-5 pt-4 pb-5">
        <span className="text-[0.85rem] font-semibold text-fg-moss">Specimen BKK-{String(project.id).padStart(4, "0")}</span>
        {project.isFeatured && <span className="justify-self-start bg-fg-ochre px-2.5 py-0.5 text-[0.8rem] font-semibold">Rare find</span>}
        <h3 className="font-fg-serif text-[1.7rem] leading-[1.1] font-semibold">{project.title}</h3>
        <p className="font-fg-serif leading-snug text-fg-moss italic">{habitat}</p>
        <p>{project.summary}</p>
        {project.startDate && <LabelRow term="Collected">{formatRange(project.startDate, project.endDate)}</LabelRow>}
        {project.skills.length > 0 && <LabelRow term="Made of">{project.skills.join(", ")}</LabelRow>}
        {(project.repoUrl || project.demoUrl) && (
          <LabelRow term="Observe">
            {project.repoUrl && <a href={project.repoUrl}>Source code</a>}
            {project.repoUrl && project.demoUrl && ", "}
            {project.demoUrl && <a href={project.demoUrl}>Live demo</a>}
          </LabelRow>
        )}
      </div>
    </article>
  );
}

export function SpecimenGrid({ projects, companyById }: SpecimenGridProps) {
  const { filter, setFilter, visible } = useProjectFilter(projects);

  return (
    <>
      <div role="group" aria-label="Filter specimens" className="mb-7 flex flex-wrap gap-2">
        {FILTERS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
            className="cursor-pointer rounded-full border-[1.5px] border-fg-pine px-4 py-1.5 text-[0.95rem] font-medium aria-pressed:bg-fg-pine aria-pressed:text-fg-paper"
          >
            {label}
          </button>
        ))}
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        {visible.map((project) => (
          <Specimen
            key={project.id}
            project={project}
            company={project.experienceId ? companyById[project.experienceId] ?? null : null}
          />
        ))}
      </div>
    </>
  );
}
