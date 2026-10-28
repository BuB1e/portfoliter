import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import type { ThemeKey } from "~/lib/theme";
import { makeLivePortfolio, makeLiveProjectDetail } from "~/test-utils/livePortfolio";
import { themePages, themeProjectPages } from "./registry";

// Designs that render every published field. Each one names its own featured-project marker.
const FEATURED_LABELS: Partial<Record<ThemeKey, string>> = {
  receipt: "Staff pick",
  broadsheet: "Editor's pick",
  "quest-log": "Epic quest",
};

function render(node: React.ReactNode): string {
  return renderToStaticMarkup(<MemoryRouter>{node}</MemoryRouter>);
}

// Text as React escapes it in markup.
function escaped(text: string): string {
  return text.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("'", "&#x27;").replaceAll("<", "&lt;");
}

function expectAll(html: string, texts: string[]) {
  for (const text of texts) {
    expect(html, `missing "${text}"`).toContain(escaped(text));
  }
}

describe.each(Object.entries(FEATURED_LABELS))("%s design shows every published field", (key, featuredLabel) => {
  const portfolio = makeLivePortfolio();
  const Page = themePages[key as ThemeKey];
  const ProjectPage = themeProjectPages[key as ThemeKey];

  it("home: profile, links and resume", () => {
    const html = render(<Page portfolio={portfolio} />);
    const { profile } = portfolio;

    expectAll(html, [profile.fullName, profile.headline, profile.bio, profile.location ?? "", profile.email ?? ""]);
    expect(html).toContain(`src="${profile.avatarUrl}"`);
    expect(html).toContain(`href="${profile.resumeUrl}"`);
    for (const link of portfolio.links) {
      expect(html).toContain(`href="${link.url}"`);
    }
  });

  it("home: hides the resume when there is none", () => {
    const html = render(<Page portfolio={{ ...portfolio, profile: { ...portfolio.profile, resumeUrl: null } }} />);

    expect(html).not.toContain("resume.pdf");
  });

  it("home: every skill, uncategorized ones under Other", () => {
    const html = render(<Page portfolio={portfolio} />);

    expectAll(html, [...portfolio.skills.map((skill) => skill.name), "Other"]);
  });

  it("home: experience, education, certifications and custom sections", () => {
    const html = render(<Page portfolio={portfolio} />);

    for (const job of portfolio.experiences) {
      expectAll(html, [job.role, job.company, job.location ?? "", job.description, ...job.skills]);
    }
    expect(html.toLowerCase()).toContain("internship");
    expect(html.toLowerCase()).toContain("full-time");
    expectAll(html, ["Oct 2025", "Feb 2026"]);
    const [school] = portfolio.education;
    expectAll(html, [school.institution, school.degree ?? "", school.field ?? "", school.description, "Apr 2026"]);
    for (const cert of portfolio.certifications) {
      expectAll(html, [cert.name, cert.issuer]);
    }
    expectAll(html, ["Aug 2025"]);
    expect(html).toContain('href="https://certs.example/intern"');
    expectAll(html, ["Awards", "Hackathon finalist", "Bangkok, 2025", "Spoken languages", "Thai", "English", "Professional"]);
  });

  it("home: project cards carry cover, dates, skills, featured marker and their job or school", () => {
    const html = render(<Page portfolio={portfolio} />);

    for (const project of portfolio.projects) {
      expectAll(html, [project.title, project.summary, ...project.skills]);
    }
    expect(html).toContain('src="https://files.example/iso.png"');
    expectAll(html, ["Sep 2025", featuredLabel]);
    expectAll(html, ["Yuan Ze University (Taiwan)", "Kasetsart University"]);
  });

  it("project page: content, links, cover, dates, skills and the linked job", () => {
    const project = makeLiveProjectDetail();

    const html = render(<ProjectPage portfolio={portfolio} project={project} />);

    expectAll(html, [project.title, project.summary, "Oct 2026", "Software Engineer", "Ngern Turbo", ...project.skills]);
    expect(html).toContain("<strong>Web editor</strong>");
    expect(html).toContain(`href="${project.repoUrl}"`);
    expect(html).toContain(`href="${project.demoUrl}"`);
    expect(html).toContain(`src="${project.coverUrl}"`);
  });

  it("project page: empty content still shows the short description, skills and dates", () => {
    const project = makeLiveProjectDetail({ content: "", coverUrl: null, repoUrl: null, demoUrl: null, experience: null, experienceId: null });

    const html = render(<ProjectPage portfolio={portfolio} project={project} />);

    expectAll(html, [project.summary, ...project.skills, "Oct 2026"]);
  });
});
