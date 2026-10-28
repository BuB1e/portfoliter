import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import type { Experience } from "~/lib/portfolio";
import { shortDescription } from "~/lib/projects";
import { THEME_KEYS } from "~/lib/theme";
import { makeEducation, makePortfolio, makeProject, makeProjectDetail } from "~/test-utils/fixtures";
import { themePages, themeProjectPages } from "./registry";

// Structure every design shares: grouped sections, card links, project pages. Field coverage is
// checked separately in fields.test.tsx.
const job: Experience = {
  id: 5,
  company: "Acme",
  role: "Engineer",
  employmentType: null,
  location: null,
  startDate: "2024-01-01",
  endDate: null,
  description: "",
  skills: [],
};

const portfolio = makePortfolio({
  experiences: [job],
  education: [makeEducation()],
  projects: [
    makeProject({ id: 1, slug: "tidewatch", title: "Tidewatch", projectType: "UNIVERSITY", educationId: 1, education: makeEducation() }),
    makeProject({ id: 2, slug: "payments", title: "Payments API", projectType: "WORK", experienceId: 5, experience: job, educationId: null, summary: "Moves money." }),
    makeProject({ id: 3, slug: "night-notes", title: "Night Notes", projectType: "PERSONAL", educationId: null, summary: "Keeps notes overnight." }),
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
    for (const slug of ["tidewatch", "payments", "night-notes"]) {
      expect(html).toContain(`href="/projects/${slug}"`);
    }
    expect(html).toContain("Moves money.");
  });

  it("puts each card's short description inside its link, clamping long summaries", () => {
    const Page = themePages[key];
    const long = "Keeps notes overnight and syncs them to every device without a central server in between. ".repeat(4).trim();
    const project = { ...portfolio.projects[2], summary: long };

    const html = render(<Page portfolio={{ ...portfolio, projects: [project] }} />);

    const short = shortDescription(long);
    expect(short.length).toBeLessThan(long.length);
    expect(html).toContain(short);
    expect(html).not.toContain(long);
    const links = html.match(/<a [^>]*href="\/projects\/night-notes"[^>]*>[\s\S]*?<\/a>/g) ?? [];
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
      repoUrl: "https://github.example/x/tidewatch",
      content: "- **Charts** for harbour crews\n\n<script>alert(1)</script>",
    });

    const html = render(<Page portfolio={portfolio} project={project} />);

    expect(html).toContain("Tidewatch");
    expect(html).toContain("<strong>Charts</strong>");
    expect(html).not.toContain("<script>");
    expect(html).toMatch(/<img [^>]*alt="[^"]*Tidewatch[^"]*"/);
    expect(html).toContain('href="/#university-projects"');
    expect(html).toContain("Porto Polytechnic");
    expect(html).toContain('href="https://github.example/x/tidewatch"');
  });

  it("renders its own not-found page for a missing project", () => {
    const Page = themeProjectPages[key];

    const html = render(<Page portfolio={portfolio} project={null} />);

    expect(html).toContain("<h1");
    expect(html).toContain('href="/"');
  });
});
