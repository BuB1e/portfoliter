import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { certificationLine, educationLine, experienceLine, linkedName } from "~/lib/fields";
import { formatMonth } from "~/lib/format";
import { skillGroupLabel } from "~/lib/labels";
import { shortDescription } from "~/lib/projects";
import { THEME_KEYS, type ThemeKey } from "~/lib/theme";
import { makeSampleProject, makeSampleView } from "~/test-utils/sampleView";
import { themePages, themeProjectPages } from "./registry";

// The coverage contract: every design, on the home page and the project page, shows every published
// field of a complete fictional profile (test-utils/sampleView.ts). A design that drops a field, or
// prints a placeholder for an empty one, fails here. Text is matched case-insensitively, so designs
// may set their own case.
//
// Adding a design: add its featured-project marker below; the Record type makes typecheck fail until
// you do. Then make every test in this file pass.
const FEATURED_LABELS: Record<ThemeKey, string> = {
  plain: "Featured",
  dating: "Featured",
  "field-guide": "Rare find",
  parcel: "Priority",
  "spec-sheet": "Selected work",
  skytrain: "Express service",
  "status-page": "Key service",
  receipt: "Staff pick",
  broadsheet: "Editor's pick",
  "quest-log": "Epic quest",
  "retro-desktop": "Pinned",
};

function render(node: React.ReactNode): string {
  return renderToStaticMarkup(<MemoryRouter>{node}</MemoryRouter>);
}

// Text as React escapes it in markup.
function escaped(text: string): string {
  return text.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("'", "&#x27;").replaceAll("<", "&lt;");
}

function expectText(html: string, texts: (string | null | undefined)[]) {
  const lower = html.toLowerCase();
  for (const text of texts) {
    if (text) {
      expect(lower, `missing "${text}"`).toContain(escaped(text).toLowerCase());
    }
  }
}

function expectHref(html: string, url: string | null) {
  if (url) {
    expect(html, `missing link to ${url}`).toContain(`href="${escaped(url)}"`);
  }
}

// Empty values must render as nothing, never as a placeholder from a bad lookup.
function expectNoBrokenValues(html: string) {
  const text = html.replace(/<[^>]*>/g, " ");
  for (const bad of ["undefined", "NaN", "Invalid Date", "[object Object]"]) {
    expect(text, `renders "${bad}"`).not.toContain(bad);
  }
  expect(text).not.toMatch(/(^|\s)null(\s|$)/);
  expect(html).not.toContain('src=""');
  expect(html).not.toContain('src="null"');
  expect(html).not.toContain('href=""');
}

describe.each(THEME_KEYS)("%s design shows every published field", (key) => {
  const view = makeSampleView();
  const Page = themePages[key];
  const ProjectPage = themeProjectPages[key];
  const home = render(<Page portfolio={view} />);

  it("home: profile, avatar, links, email and resume", () => {
    const { profile } = view;

    expectText(home, [profile.fullName, profile.headline, profile.bio, profile.location]);
    expect(home).toContain(`src="${profile.avatarUrl}"`);
    expectHref(home, `mailto:${profile.email}`);
    expectHref(home, profile.resumeUrl);
    for (const link of view.links) {
      expectHref(home, link.url);
    }
  });

  it("home: no avatar, email, location or resume renders a fallback, not a broken value", () => {
    const html = render(
      <Page portfolio={{ ...view, profile: { ...view.profile, avatarUrl: null, email: null, location: null, resumeUrl: null } }} />,
    );

    expectText(html, [view.profile.fullName]);
    expect(html).not.toContain("resume/mira.pdf");
    expect(html).not.toContain("mailto:");
    expectNoBrokenValues(html);
  });

  it("home: every skill under its group label, uncategorized ones under Other", () => {
    for (const group of view.skillGroups) {
      expectText(home, [skillGroupLabel(group), ...group.skills]);
    }
    expectText(home, ["Other"]);
  });

  it("home: every job with employment type, location, dates, description and skills", () => {
    for (const job of view.experiences) {
      const line = experienceLine(job);
      expectText(home, [line.role, line.company, line.employmentType, line.location, line.description, ...line.skills]);
      expectText(home, [formatMonth(job.startDate), job.endDate && formatMonth(job.endDate)]);
    }
  });

  it("home: education with description and dates", () => {
    for (const school of view.education) {
      const line = educationLine(school);
      expectText(home, [line.institution, school.degree, school.field, line.description, line.dates]);
    }
  });

  it("home: certifications with issuer, and date and link only when set", () => {
    for (const cert of view.certifications) {
      const line = certificationLine(cert);
      expectText(home, [line.name, line.issuer, line.date]);
      expectHref(home, line.credentialUrl);
    }
  });

  it("home: every custom section, including keys no design knows", () => {
    for (const section of view.sections) {
      expectText(home, [section.title]);
      for (const entry of section.entries) {
        expectText(home, [entry.title, entry.detail]);
        expectHref(home, entry.url);
      }
    }
  });

  it("home: project cards carry cover, dates, skills, featured marker and their job or school", () => {
    for (const project of view.projects) {
      expectText(home, [project.title, shortDescription(project.summary), ...project.skills, linkedName(project)]);
      expectText(home, [project.startDate && formatMonth(project.startDate)]);
      if (project.coverUrl) {
        expect(home, `missing cover of ${project.title}`).toContain(`src="${project.coverUrl}"`);
      }
    }
    expectText(home, [FEATURED_LABELS[key]]);
  });

  it("home: renders no broken values", () => {
    expectNoBrokenValues(home);
  });

  it("project page: content, links, cover, dates, skills, featured marker and the linked job with its dates", () => {
    const project = makeSampleProject("freight-router");
    const job = experienceLine(project.experience!);

    const html = render(<ProjectPage portfolio={view} project={project} />);

    expectText(html, [project.title, project.summary, "May 2024", ...project.skills, FEATURED_LABELS[key]]);
    expectText(html, [job.role, job.company, formatMonth(project.experience!.startDate)]);
    expect(html).toContain("<strong>Live re-planning</strong>");
    expectHref(html, project.repoUrl);
    expectHref(html, project.demoUrl);
    expect(html).toContain(`src="${project.coverUrl}"`);
    expectNoBrokenValues(html);
  });

  it("project page: a university project shows its school with qualification and dates", () => {
    const project = makeSampleProject("tidewatch");
    const school = educationLine(project.education!);

    const html = render(<ProjectPage portfolio={view} project={project} />);

    expectText(html, [project.title, school.institution, project.education!.degree, project.education!.field, school.dates]);
    expectText(html, ["Sep 2021", "Jun 2022", ...project.skills]);
    expectNoBrokenValues(html);
  });

  it("project page: no content, cover, links, dates or job still shows the short description and skills", () => {
    const project = makeSampleProject("night-notes", { skills: ["Rust"] });

    const html = render(<ProjectPage portfolio={view} project={project} />);

    expectText(html, [project.title, project.summary, "Rust"]);
    expectNoBrokenValues(html);
  });
});
