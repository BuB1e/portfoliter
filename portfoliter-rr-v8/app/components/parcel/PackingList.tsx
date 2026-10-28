import { useId } from "react";
import { Link } from "react-router";

import type { Education, Experience, Project } from "~/lib/portfolio";
import { findEducation, findExperience, projectDates, projectPath, shortDescription } from "~/lib/projects";
import { ContentsTags } from "./ContentsTags";

const COVERS = [
  "repeating-linear-gradient(45deg, #e9d3b3 0 14px, #dcbf97 14px 28px)",
  "radial-gradient(circle at 30% 40%, #f4e4c8 0 18%, transparent 19%), radial-gradient(circle at 70% 60%, #f4e4c8 0 12%, transparent 13%), #cfa77a",
  "linear-gradient(90deg, #e2c49c 50%, #d4b085 50%) 0 0/40px 40px",
  "conic-gradient(from 45deg, #e9d3b3, #c69c6d, #e9d3b3)",
];

export function boxCover(project: Project): string {
  return project.coverUrl ? `url(${project.coverUrl}) center/cover` : COVERS[project.id % COVERS.length];
}

// Where the box was packed: the company, home, or the university.
export function parcelOrigin(project: Project, experience: Experience | null, education: Education | null): string {
  if (project.projectType === "WORK") {
    return `Made at ${experience?.company ?? "work"}`;
  }
  if (project.projectType === "UNIVERSITY") {
    return `Made at ${education?.institution ?? "university"}`;
  }
  return "Made at home, after dinner";
}

interface BoxProps {
  project: Project;
  origin: string;
}

function Box({ project, origin }: BoxProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dates = projectDates(project);
  return (
    <Link
      to={projectPath(project.slug)}
      aria-labelledby={titleId}
      aria-describedby={project.summary ? descriptionId : undefined}
      className="group relative block h-full border-2 border-parcel-kraft-dark bg-parcel-box pb-5 no-underline shadow-[0_6px_0_var(--color-parcel-kraft-dark)] transition-transform hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      {project.isFeatured && (
        <span className="absolute -top-3.5 -right-2.5 z-10 rotate-6 bg-parcel-tape px-3 py-2 font-parcel-stencil text-[1.1rem] leading-none font-black text-parcel-label">
          Priority
        </span>
      )}
      <div aria-hidden="true" className="parcel-box-tape relative h-[150px] border-b-2 border-parcel-kraft-dark" style={{ background: boxCover(project) }} />
      <h3 id={titleId} className="mx-5 mt-4 mb-1 font-parcel-stencil text-[2rem] leading-none font-black break-words">
        {project.title}
      </h3>
      <p className="mx-5 mb-2.5 text-[0.9rem] font-semibold font-stretch-80%">
        {origin}
        {dates ? `, ${dates}` : ""}
      </p>
      {project.summary && (
        <p id={descriptionId} className="mx-5 mb-4">
          {shortDescription(project.summary)}
        </p>
      )}
      <ContentsTags label="Built with" items={project.skills} className="mx-5" />
      <span aria-hidden="true" className="mx-5 mt-4 inline-block border-b-2 border-parcel-ink font-bold font-stretch-85% group-hover:border-parcel-tape group-hover:text-parcel-tape">
        Open the box
      </span>
    </Link>
  );
}

interface PackingListProps {
  projects: Project[];
  experiences: Experience[];
  education: Education[];
}

export function PackingList({ projects, experiences, education }: PackingListProps) {
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-x-6 gap-y-8">
      {projects.map((project) => (
        <li key={project.id} className="odd:-rotate-[0.6deg] even:rotate-[0.8deg]">
          <Box
            project={project}
            origin={parcelOrigin(project, findExperience(project, experiences), findEducation(project, education))}
          />
        </li>
      ))}
    </ul>
  );
}
