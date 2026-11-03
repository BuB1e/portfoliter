import { Link } from "react-router";

import { linkedName } from "~/lib/fields";
import { formatMonth } from "~/lib/format";
import type { Project } from "~/lib/portfolio";
import { projectPath, shortDescription } from "~/lib/projects";

export const FEATURED_LABEL = "Highlighted result";

function projectFacts(project: Project): string {
  const dates = project.startDate ? [formatMonth(project.startDate), project.endDate && formatMonth(project.endDate)].filter(Boolean).join(" to ") : null;
  return [linkedName(project), dates].filter(Boolean).join(", ");
}

// A project with no picture is set the way a paper sets data with no image: as a small table of its facts.
function FactTable({ project }: { project: Project }) {
  const rows = (
    [
      ["Project", project.title],
      ["Built with", project.skills.join(", ")],
      ["From", projectFacts(project)],
    ] satisfies [string, string][]
  ).filter(([, value]) => value);
  return (
    <table className="pp-small w-full bg-pp-desk text-left">
      <tbody>
        {rows.map(([name, value]) => (
          <tr key={name}>
            <th scope="row" className="w-[32%] px-4 py-3 align-top font-semibold">
              {name}
            </th>
            <td className="px-4 py-3">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Projects as the paper's figures: each picture with a caption that is a sentence of the paper, the
// title in bold, then what it is. The whole figure links to the project.
export function Figures({ projects }: { projects: Project[] }) {
  return (
    <ul className="grid gap-x-10 gap-y-16 md:grid-cols-2">
      {projects.map((project, index) => (
        <li key={project.id} data-reveal="" style={{ "--i": index % 2 } as React.CSSProperties}>
          <Link to={projectPath(project.slug)} className="pp-figure">
            <span className="block overflow-hidden">
              {project.coverUrl ? (
                <img src={project.coverUrl} alt={`Cover of ${project.title}`} loading="lazy" className="aspect-[16/10] w-full object-cover object-top" />
              ) : (
                <FactTable project={project} />
              )}
            </span>
            <span className="mt-4 block">
              <span className="pp-figure-title font-semibold">{project.title}.</span> {shortDescription(project.summary)}
            </span>
          </Link>
          <p className="pp-small mt-2 text-pp-soft">
            {[project.isFeatured ? FEATURED_LABEL : null, projectFacts(project), project.skills.join(", ")].filter(Boolean).join(". ")}
          </p>
        </li>
      ))}
    </ul>
  );
}
