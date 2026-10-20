import { type ProjectFilter, useProjectFilter } from "~/hooks/useProjectFilter";
import { formatRange } from "~/lib/format";
import type { Project } from "~/lib/portfolio";
import { ContentsTags } from "./ContentsTags";

const FILTERS: [ProjectFilter, string][] = [
  ["ALL", "Everything"],
  ["WORK", "Work stuff"],
  ["PERSONAL", "Personal stuff"],
];

const COVERS = [
  "repeating-linear-gradient(45deg, #e9d3b3 0 14px, #dcbf97 14px 28px)",
  "radial-gradient(circle at 30% 40%, #f4e4c8 0 18%, transparent 19%), radial-gradient(circle at 70% 60%, #f4e4c8 0 12%, transparent 13%), #cfa77a",
  "linear-gradient(90deg, #e2c49c 50%, #d4b085 50%) 0 0/40px 40px",
  "conic-gradient(from 45deg, #e9d3b3, #c69c6d, #e9d3b3)",
];

interface PackingListProps {
  projects: Project[];
  companyById: Record<number, string>;
}

function Box({ project, company }: { project: Project; company: string | null }) {
  const cover = project.coverUrl ? `url(${project.coverUrl}) center/cover` : COVERS[project.id % COVERS.length];
  const origin = project.projectType === "WORK" ? `Made at ${company ?? "work"}` : "Made at home, after dinner";

  return (
    <article className="relative border-2 border-parcel-kraft-dark bg-parcel-box pb-5 shadow-[0_6px_0_var(--color-parcel-kraft-dark)] odd:-rotate-[0.6deg] even:rotate-[0.8deg]">
      {project.isFeatured && (
        <span className="absolute -top-3.5 -right-2.5 z-10 rotate-6 bg-parcel-tape px-3 py-2 font-parcel-stencil text-[1.1rem] leading-none font-black text-parcel-label">
          Priority
        </span>
      )}
      <div aria-hidden="true" className="parcel-box-tape relative h-[150px] border-b-2 border-parcel-kraft-dark" style={{ background: cover }} />
      <h3 className="mx-5 mt-4 mb-1 font-parcel-stencil text-[2rem] leading-none font-black">{project.title}</h3>
      <p className="mx-5 mb-2.5 text-[0.9rem] font-semibold font-stretch-80%">
        {origin}
        {project.startDate ? `, ${formatRange(project.startDate, project.endDate)}` : ""}
      </p>
      <p className="mx-5 mb-4">{project.summary}</p>
      <ContentsTags label="Built with" items={project.skills} className="mx-5" />
      {(project.repoUrl || project.demoUrl) && (
        <div className="mx-5 mt-4 flex gap-4 font-bold">
          {project.repoUrl && <a href={project.repoUrl}>Source code</a>}
          {project.demoUrl && <a href={project.demoUrl}>Try it</a>}
        </div>
      )}
    </article>
  );
}

export function PackingList({ projects, companyById }: PackingListProps) {
  const { filter, setFilter, visible } = useProjectFilter(projects);

  return (
    <>
      <div role="group" aria-label="Filter projects" className="mb-6 flex flex-wrap gap-2.5">
        {FILTERS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
            className="cursor-pointer border-2 border-parcel-ink bg-parcel-label px-4 py-2 font-bold font-stretch-85% aria-pressed:bg-parcel-ink aria-pressed:text-parcel-label"
          >
            {label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-x-6 gap-y-8">
        {visible.map((project) => (
          <Box
            key={project.id}
            project={project}
            company={project.experienceId ? companyById[project.experienceId] ?? null : null}
          />
        ))}
      </div>
    </>
  );
}
