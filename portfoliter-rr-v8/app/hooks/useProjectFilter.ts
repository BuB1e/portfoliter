import { useState } from "react";

import type { Project, ProjectType } from "~/lib/portfolio";

export type ProjectFilter = "ALL" | ProjectType;

// Work/personal filter shared by the field-guide and parcel project lists.
export function useProjectFilter(projects: Project[]) {
  const [filter, setFilter] = useState<ProjectFilter>("ALL");
  const visible = filter === "ALL" ? projects : projects.filter((project) => project.projectType === filter);
  return { filter, setFilter, visible };
}
