import { describe, expect, it } from "vitest";

import { inSectionOrder, resolveSectionOrder, SECTION_KEYS } from "./sectionOrder";

describe("resolveSectionOrder", () => {
  it("defaults to the resume order", () => {
    expect(SECTION_KEYS).toEqual(["about", "education", "skills", "experience", "projects", "certifications", "extras"]);
    expect(resolveSectionOrder(undefined)).toEqual([...SECTION_KEYS]);
    expect(resolveSectionOrder(null)).toEqual([...SECTION_KEYS]);
    expect(resolveSectionOrder([])).toEqual([...SECTION_KEYS]);
  });

  it("keeps the given order", () => {
    const reversed = [...SECTION_KEYS].reverse();

    expect(resolveSectionOrder(reversed)).toEqual(reversed);
  });

  it("skips unknown keys and repeats, and appends missing keys in the default order", () => {
    expect(resolveSectionOrder(["projects", "talks", "projects", "about"])).toEqual([
      "projects",
      "about",
      "education",
      "skills",
      "experience",
      "certifications",
      "extras",
    ]);
  });
});

describe("inSectionOrder", () => {
  it("joins each section's list in order and skips sections the design does not map", () => {
    const lists = { projects: ["work", "personal"], about: ["bio"], extras: [], certifications: ["certs"] };

    expect(inSectionOrder(undefined, lists)).toEqual(["bio", "work", "personal", "certs"]);
    expect(inSectionOrder(["certifications", "projects"], lists)).toEqual(["certs", "work", "personal", "bio"]);
  });
});
