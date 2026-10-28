import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { shortDescription } from "~/lib/projects";
import { THEME_KEYS } from "~/lib/theme";
import { makePortfolio, makeProject, makeProjectDetail } from "~/test-utils/fixtures";
import { themePages, themeProjectPages } from "./registry";

const portfolio = makePortfolio({
  experiences: [
    {
      id: 5,
      company: "Acme",
      role: "Engineer",
      employmentType: null,
      location: null,
      startDate: "2024-01-01",
      endDate: null,
      description: "",
      skills: [],
    },
  ],
  education: [makeProjectDetail().education!],
  projects: [
    makeProject({ id: 1, slug: "growthcheck", title: "GrowthCheck", projectType: "UNIVERSITY", educationId: 1 }),
    makeProject({ id: 2, slug: "payments", title: "Payments API", projectType: "WORK", experienceId: 5, educationId: null, summary: "Moves money." }),
    makeProject({ id: 3, slug: "rememo", title: "Rememo", projectType: "PERSONAL", educationId: null, summary: "Reads bank emails." }),
  ],
});

function render(node: React.ReactNode): string {
  return renderToStaticMarkup(<MemoryRouter>{node}</MemoryRouter>);
}

describe.each(THEME_KEYS)("%s design", (key) => {
  it("shows Work, Personal and University sections in that order, each card linking to its project", () => {
    const Page = themePages[key];

    const html = render(<Page portfolio={portfolio} />);

    const work = html.indexOf('id="work-projects"');
    const personal = html.indexOf('id="personal-projects"');
    const university = html.indexOf('id="university-projects"');
    expect(work).toBeGreaterThan(-1);
    expect(personal).toBeGreaterThan(work);
    expect(university).toBeGreaterThan(personal);
    for (const slug of ["growthcheck", "payments", "rememo"]) {
      expect(html).toContain(`href="/projects/${slug}"`);
    }
    expect(html).toContain("Moves money.");
  });

  it("puts each card's short description inside its link, clamping long summaries", () => {
    const Page = themePages[key];
    const long = "Reads bank emails and statements to track spending without an open-banking API. ".repeat(4).trim();
    const project = { ...portfolio.projects[2], summary: long };

    const html = render(<Page portfolio={{ ...portfolio, projects: [project] }} />);

    const short = shortDescription(long);
    expect(short.length).toBeLessThan(long.length);
    expect(html).toContain(short);
    expect(html).not.toContain(long);
    const links = html.match(/<a [^>]*href="\/projects\/rememo"[^>]*>[\s\S]*?<\/a>/g) ?? [];
    expect(links.some((link) => link.includes(short))).toBe(true);
  });

  it("hides groups that have no projects", () => {
    const Page = themePages[key];

    const html = render(<Page portfolio={{ ...portfolio, projects: [portfolio.projects[2]] }} />);

    expect(html).toContain('id="personal-projects"');
    expect(html).not.toContain('id="work-projects"');
    expect(html).not.toContain('id="university-projects"');
  });

  it("renders a project page with markdown, cover alt text and a back link to its group", () => {
    const Page = themeProjectPages[key];
    const project = makeProjectDetail({
      coverUrl: "https://files.example/c.jpg",
      repoUrl: "https://github.com/x/growthcheck",
      content: "- **Charts** for volunteers\n\n<script>alert(1)</script>",
    });

    const html = render(<Page portfolio={portfolio} project={project} />);

    expect(html).toContain("GrowthCheck");
    expect(html).toContain("<strong>Charts</strong>");
    expect(html).not.toContain("<script>");
    expect(html).toMatch(/<img [^>]*alt="[^"]*GrowthCheck[^"]*"/);
    expect(html).toContain('href="/#university-projects"');
    expect(html).toContain("Kasetsart University");
    expect(html).toContain('href="https://github.com/x/growthcheck"');
  });

  it("renders its own not-found page for a missing project", () => {
    const Page = themeProjectPages[key];

    const html = render(<Page portfolio={portfolio} project={null} />);

    expect(html).toContain("<h1");
    expect(html).toContain('href="/"');
  });
});
