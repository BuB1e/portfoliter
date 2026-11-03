import { describe, expect, it } from "vitest";

import type { PortfolioView } from "~/lib/portfolio";
import { makeSampleView } from "~/test-utils/sampleView";
import { apa, bibtex, paperYear } from "./citation";

function view(overrides: Partial<PortfolioView["profile"]> = {}, rest: Partial<PortfolioView> = {}): PortfolioView {
  const sample = makeSampleView();
  return {
    ...sample,
    links: [{ platform: "github", url: "https://github.example/janedoe" }],
    experiences: [{ ...sample.experiences[0], startDate: "2023-03-01", endDate: null }],
    projects: [],
    education: [],
    ...rest,
    profile: { ...sample.profile, fullName: "Jane Ann Doe", headline: "Builds freight software.", location: "Porto", email: "jane@example.com", ...overrides },
  };
}

describe("preprint citation", () => {
  it("dates the paper by the latest date in the data, never the clock", () => {
    expect(paperYear(view())).toBe("2023");
    expect(paperYear(view({}, { experiences: [] }))).toBeNull();
  });

  it("writes BibTeX with surname first and every field that is set", () => {
    expect(bibtex(view())).toBe(
      [
        "@misc{doe2023,",
        "  author = {Doe, Jane Ann},",
        "  title = {Builds freight software.},",
        "  year = {2023},",
        "  howpublished = {\\url{https://github.example/janedoe}},",
        "  note = {Porto, jane@example.com}",
        "}",
      ].join("\n"),
    );
  });

  it("leaves out empty fields instead of printing null, and escapes LaTeX characters", () => {
    const text = bibtex(view({ headline: "Ships 100% of R&D", location: null, email: null }, { links: [], experiences: [] }));

    expect(text).toBe("@misc{doe,\n  author = {Doe, Jane Ann},\n  title = {Ships 100\\% of R\\&D}\n}");
    expect(text).not.toMatch(/null|undefined/);
  });

  it("writes APA with initials, the year or n.d., and the link", () => {
    expect(apa(view())).toBe("Doe, J. A. (2023). Builds freight software [Portfolio]. https://github.example/janedoe");
    expect(apa(view({ fullName: "Plato" }, { links: [], experiences: [] }))).toBe("Plato (n.d.). Builds freight software [Portfolio].");
  });
});
