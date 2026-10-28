import { useId } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router";

import type { Education, Experience, Project } from "~/lib/portfolio";
import { findEducation, findExperience, projectDates, projectPath, shortDescription } from "~/lib/projects";

const COVERS = [
  "repeating-radial-gradient(circle at 30% 60%, #dde5d3 0 10px, #c9d6bb 10px 20px)",
  "linear-gradient(160deg, #e2a93b 0 35%, #6f8a5e 35% 70%, #1f3a2e 70%)",
  "radial-gradient(ellipse at 50% 100%, #6f8a5e 0 45%, transparent 46%), linear-gradient(#f2d48f, #e2a93b)",
  "repeating-linear-gradient(110deg, #a4462b 0 6px, #dde5d3 6px 22px)",
];

export function specimenCover(project: Project): string {
  return project.coverUrl ? `url(${project.coverUrl}) center/cover` : COVERS[project.id % COVERS.length];
}

export function specimenNumber(project: Project): string {
  return `BKK-${String(project.id).padStart(4, "0")}`;
}

// Where the specimen was raised, in the guide's voice.
export function habitat(project: Project, experience: Experience | null, education: Education | null): string {
  if (project.projectType === "WORK") {
    return `Domesticated, raised at ${experience?.company ?? "a company"}`;
  }
  if (project.projectType === "UNIVERSITY") {
    return `Lab-bred at ${education?.institution ?? "a university"}`;
  }
  return "Wild, found in the evenings";
}

export function LabelRow({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[5.5rem_1fr] gap-2.5 border-t border-dashed border-fg-pine/35 pt-1.5 text-[0.92rem]">
      <span className="font-semibold">{term}</span>
      <span className="min-w-0">{children}</span>
    </div>
  );
}

function Specimen({ project, habitatText }: { project: Project; habitatText: string }) {
  const titleId = useId();
  const descriptionId = useId();
  const dates = projectDates(project);

  return (
    <Link
      to={projectPath(project.slug)}
      aria-labelledby={titleId}
      aria-describedby={project.summary ? descriptionId : undefined}
      className="group flex h-full flex-col border-[1.5px] border-fg-pine bg-fg-paper no-underline transition-shadow hover:shadow-[6px_6px_0_var(--color-fg-pine)]"
    >
      <div aria-hidden="true" className="relative aspect-video border-b-[1.5px] border-fg-pine" style={{ background: specimenCover(project) }}>
        <span className="absolute top-3.5 left-1/2 size-3.5 -translate-x-1/2 rounded-full bg-fg-rust shadow-[0_2px_0_rgb(0_0_0/0.25)]" />
      </div>
      <div className="grid flex-1 content-start gap-1.5 px-5 pt-4 pb-5">
        <span className="text-[0.85rem] font-semibold text-fg-moss">Specimen {specimenNumber(project)}</span>
        {project.isFeatured && <span className="justify-self-start bg-fg-ochre px-2.5 py-0.5 text-[0.8rem] font-semibold">Rare find</span>}
        <h3 id={titleId} className="font-fg-serif text-[1.7rem] leading-[1.1] font-semibold group-hover:underline group-hover:decoration-fg-ochre">
          {project.title}
        </h3>
        <p className="font-fg-serif leading-snug text-fg-moss italic">{habitatText}</p>
        {project.summary && <p id={descriptionId}>{shortDescription(project.summary)}</p>}
        {dates && <LabelRow term="Collected">{dates}</LabelRow>}
        {project.skills.length > 0 && <LabelRow term="Made of">{project.skills.join(", ")}</LabelRow>}
        <span aria-hidden="true" className="mt-2 font-fg-serif text-fg-rust italic">
          Read the full account
        </span>
      </div>
    </Link>
  );
}

interface SpecimenGridProps {
  projects: Project[];
  experiences: Experience[];
  education: Education[];
}

export function SpecimenGrid({ projects, experiences, education }: SpecimenGridProps) {
  return (
    <ul className="grid gap-8 lg:grid-cols-2">
      {projects.map((project) => (
        <li key={project.id}>
          <Specimen
            project={project}
            habitatText={habitat(project, findExperience(project, experiences), findEducation(project, education))}
          />
        </li>
      ))}
    </ul>
  );
}
