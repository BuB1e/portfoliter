import { formatRange } from "./format";
import type { Project, ProjectType } from "./portfolio";

// A project's linked job or school is embedded by the backend (project.experience / project.education);
// read it through linkedLine() in lib/fields.ts.

// Home page order of the project groups. Each design words the headings its own way.
export const PROJECT_GROUP_ORDER = ["WORK", "PERSONAL", "UNIVERSITY"] as const satisfies readonly ProjectType[];

export const PROJECT_GROUP_LABELS: Record<ProjectType, string> = {
  WORK: "Work",
  PERSONAL: "Personal",
  UNIVERSITY: "University",
};

export interface ProjectGroup {
  type: ProjectType;
  projects: Project[];
}

// Splits projects into Work, Personal and University, keeping API order inside each group.
// Groups with no projects are left out so designs never render an empty heading.
export function groupProjects(projects: readonly Project[]): ProjectGroup[] {
  return PROJECT_GROUP_ORDER.map((type) => ({
    type,
    projects: projects.filter((project) => project.projectType === type),
  })).filter((group) => group.projects.length > 0);
}

export function projectPath(slug: string): string {
  return `/projects/${encodeURIComponent(slug)}`;
}

// id of a group's heading on the home page, e.g. "university-projects".
export function projectGroupId(type: ProjectType): string {
  return `${type.toLowerCase()}-projects`;
}

// Where a detail page's back link goes: the home page, scrolled to the project's group.
export function projectGroupHref(type: ProjectType): string {
  return `/#${projectGroupId(type)}`;
}

// 1-based position of a project inside its group, for designs that number cards (station codes etc.).
export function positionInGroup(project: Project, projects: readonly Project[]): number {
  const group = projects.filter((candidate) => candidate.projectType === project.projectType);
  return group.findIndex((candidate) => candidate.id === project.id) + 1;
}

// The backend limits new summaries to this many characters; older ones can be longer.
export const SUMMARY_MAX_CHARS = 200;

// The card's short description: the summary, cut at a word boundary when it is over the limit.
export function shortDescription(summary: string): string {
  const chars = Array.from(summary.trim());
  if (chars.length <= SUMMARY_MAX_CHARS) {
    return chars.join("");
  }
  const cut = chars.slice(0, SUMMARY_MAX_CHARS - 1).join("");
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > SUMMARY_MAX_CHARS / 2 ? cut.slice(0, lastSpace) : cut;
  return `${base.replace(/[\s,;:.]+$/, "")}…`;
}

// "Sep 2025 to Apr 2026", "Sep 2025 to now", or "" when the project has no dates.
export function projectDates(project: Pick<Project, "startDate" | "endDate">): string {
  return formatRange(project.startDate, project.endDate);
}
