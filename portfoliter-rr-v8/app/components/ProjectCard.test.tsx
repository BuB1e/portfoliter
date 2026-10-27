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
    expect(html).toMatch(/^<a [^>]*href="\/projects\/growthcheck"/);
    expect(html).toContain("Senior project: growth charts and LSTM risk predictions.");
    expect(html).toContain('alt="Cover of GrowthCheck"');
    expect(html).toContain("Sep 2025 to Apr 2026");
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
