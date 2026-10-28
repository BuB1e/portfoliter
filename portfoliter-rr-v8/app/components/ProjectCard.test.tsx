import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { makeProject } from "~/test-utils/fixtures";
import { ProjectCard } from "./ProjectCard";
import { ProjectGroups } from "./ProjectGroups";

describe("ProjectCard", () => {
  it("is one real link to the project page showing the short description", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ProjectCard project={makeProject({ coverUrl: "https://files.example/c.jpg" })} />
      </MemoryRouter>,
    );

    expect(html.match(/<a /g)).toHaveLength(1);
    expect(html).toMatch(/^<a [^>]*href="\/projects\/tidewatch"/);
    expect(html).toContain("Final-year project: tide charts and flood warnings for harbour crews.");
    expect(html).toContain('alt="Cover of Tidewatch"');
    expect(html).toContain("Sep 2021 to Jun 2022");
  });
});

describe("ProjectGroups", () => {
  it("renders only the groups that have projects", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ProjectGroups
          projects={[makeProject({ id: 1, projectType: "WORK" }), makeProject({ id: 2, slug: "x", projectType: "UNIVERSITY" })]}
        />
      </MemoryRouter>,
    );

    expect(html).toContain("Work projects");
    expect(html).toContain("University projects");
    expect(html).not.toContain("Personal projects");
  });
});
