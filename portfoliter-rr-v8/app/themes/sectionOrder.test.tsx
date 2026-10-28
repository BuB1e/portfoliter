import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { SECTION_KEYS, type SectionKey } from "~/lib/sectionOrder";
import { THEME_KEYS, type ThemeKey } from "~/lib/theme";
import { makeSampleView } from "~/test-utils/sampleView";
import { themePages } from "./registry";

// The order contract: every design renders its home page sections in the view's sectionOrder, the
// owner's resume order by default (about, education, skills, experience, projects, certifications,
// extras), and its in-page navs list them in the same order. Each section is found by the id of its
// heading (the anchor its nav links to), on the complete fictional profile of test-utils/sampleView.ts.
//
// Adding a design: list its section heading ids below; the Record type makes typecheck fail until you
// do. A design that prints the bio in its header has no "about" entry.
const PROJECTS = ["work-projects", "personal-projects", "university-projects"];

const SECTION_IDS: Record<ThemeKey, Partial<Record<SectionKey, string[]>>> = {
  plain: {
    about: ["about-title"],
    education: ["education-title"],
    skills: ["skills-title"],
    experience: ["experience-title"],
    projects: PROJECTS,
    certifications: ["certifications-title"],
    extras: ["section-prompts", "section-awards", "section-talks", "section-languages"],
  },
  dating: {
    about: ["about-title"],
    education: ["verified-title"],
    skills: ["interests-title"],
    experience: ["exes-title"],
    projects: PROJECTS,
    certifications: ["certified-title"],
    extras: ["section-prompts", "brag-title", "section-talks", "section-languages"],
  },
  "field-guide": {
    education: ["fledging-title"],
    skills: ["diet-title"],
    experience: ["migration-title"],
    projects: PROJECTS,
    certifications: ["banding-title"],
    extras: ["sightings-title", "section-prompts", "section-talks", "section-languages"],
  },
  parcel: {
    about: ["wrap-title"],
    education: ["origin-title"],
    skills: ["skills-title"],
    experience: ["history-title"],
    projects: PROJECTS,
    certifications: ["customs-title"],
    extras: ["stickers-title", "section-prompts", "section-talks", "section-languages"],
  },
  "spec-sheet": {
    about: ["about-title"],
    education: ["education-title"],
    skills: ["skills-title"],
    experience: ["experience-title"],
    projects: PROJECTS,
    certifications: ["certifications-title"],
    extras: ["section-prompts", "section-awards", "section-talks", "section-languages"],
  },
  skytrain: {
    about: ["about"],
    education: ["student-title"],
    skills: ["network-title"],
    experience: ["line-title"],
    projects: PROJECTS,
    certifications: ["passes-title"],
    extras: ["board-title", "board-prompts", "board-talks", "board-languages"],
  },
  "status-page": {
    about: ["about-title"],
    education: ["provenance-title"],
    skills: ["components-title"],
    experience: ["incidents-title"],
    projects: PROJECTS,
    certifications: ["compliance-title"],
    extras: ["section-prompts", "section-awards", "section-talks", "section-languages"],
  },
  receipt: {
    about: ["note-title"],
    education: ["member-title"],
    skills: ["bag-title"],
    experience: ["purchases-title"],
    projects: PROJECTS,
    certifications: ["coupons-title"],
    extras: ["extra-prompts", "extra-awards", "extra-talks", "extra-languages"],
  },
  broadsheet: {
    education: ["commencement-title"],
    skills: ["classifieds-title"],
    experience: ["appointments-title"],
    projects: PROJECTS,
    certifications: ["licensing-title"],
    extras: ["notices-title"],
  },
  "quest-log": {
    education: ["training-title"],
    skills: ["stats-title"],
    experience: ["log-title"],
    projects: PROJECTS,
    certifications: ["items-title"],
    extras: ["extra-prompts", "extra-awards", "extra-talks", "extra-languages"],
  },
  "retro-desktop": {
    education: ["diplomas-title"],
    skills: ["skills-title"],
    experience: ["career-title"],
    projects: PROJECTS,
    certifications: ["certificates-title"],
    extras: ["extra-prompts", "extra-awards", "extra-talks", "extra-languages"],
  },
};

// Designs with an in-page nav that must list the sections in page order.
const NAV_DESIGNS: ThemeKey[] = ["broadsheet", "quest-log", "retro-desktop"];

function renderHome(key: ThemeKey, sectionOrder: string[]): string {
  const Page = themePages[key];
  return renderToStaticMarkup(
    <MemoryRouter>
      <Page portfolio={makeSampleView({ sectionOrder })} />
    </MemoryRouter>,
  );
}

function expectedIds(key: ThemeKey, order: readonly SectionKey[]): string[] {
  return order.flatMap((section) => SECTION_IDS[key][section] ?? []);
}

function expectIdsInOrder(html: string, ids: string[]) {
  let previous = -1;
  for (const id of ids) {
    const marker = `id="${id}"`;
    const at = html.indexOf(marker);
    expect(at, `missing section ${id}`).toBeGreaterThan(-1);
    expect(html.indexOf(marker, at + 1), `section ${id} rendered twice`).toBe(-1);
    expect(at, `section ${id} is out of order (expected ${ids.join(", ")})`).toBeGreaterThan(previous);
    previous = at;
  }
}

// Every nav's links to sections, in the order the nav lists them.
function navLinks(html: string, ids: string[]): string[][] {
  const navs = html.match(/<nav[\s\S]*?<\/nav>/g) ?? [];
  return navs.map((nav) => [...nav.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]).filter((id) => ids.includes(id)));
}

const RESUME_ORDER: SectionKey[] = ["about", "education", "skills", "experience", "projects", "certifications", "extras"];
const REVERSED = [...SECTION_KEYS].reverse();
// An order with an unknown key and most keys missing: the missing ones follow in the default order.
const PARTIAL = ["certifications", "talks"];
const PARTIAL_RESOLVED: SectionKey[] = ["certifications", "about", "education", "skills", "experience", "projects", "extras"];

describe.each(THEME_KEYS)("%s design follows the section order", (key) => {
  it("the default order is the resume order", () => {
    expect([...SECTION_KEYS]).toEqual(RESUME_ORDER);

    expectIdsInOrder(renderHome(key, [...SECTION_KEYS]), expectedIds(key, RESUME_ORDER));
  });

  it("follows a different order from the view, so nothing is hand-ordered", () => {
    expectIdsInOrder(renderHome(key, REVERSED), expectedIds(key, REVERSED));
  });

  it("skips unknown keys and appends missing sections, so none disappears", () => {
    expectIdsInOrder(renderHome(key, PARTIAL), expectedIds(key, PARTIAL_RESOLVED));
  });

  it("in-page navs list the sections in page order", () => {
    for (const order of [RESUME_ORDER, REVERSED]) {
      const ids = expectedIds(key, order);
      const navs = navLinks(renderHome(key, order), ids);

      for (const links of navs) {
        const ranks = links.map((id) => ids.indexOf(id));
        expect(ranks, `nav order ${links.join(", ")}`).toEqual([...ranks].sort((a, b) => a - b));
      }
      if (NAV_DESIGNS.includes(key)) {
        expect(Math.max(...navs.map((links) => links.length))).toBeGreaterThanOrEqual(6);
      }
    }
  });
});
