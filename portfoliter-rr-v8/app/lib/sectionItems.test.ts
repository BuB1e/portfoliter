import { describe, expect, it } from "vitest";

import { customSections, sectionItems } from "./sectionItems";

describe("sectionItems", () => {
  it("reads awards, prompts, plain strings and unknown shapes", () => {
    const items = sectionItems({
      key: "mixed",
      title: "Mixed",
      items: [
        { name: "Hackathon finalist", note: "Bangkok, 2025", url: "https://awards.example/1" },
        { question: "Best bug?", answer: "A timezone one" },
        "Thai",
        { label: "English", level: "Professional" },
        { colour: "blue", size: 3 },
      ],
    });

    expect(items).toEqual([
      { title: "Hackathon finalist", detail: "Bangkok, 2025", url: "https://awards.example/1" },
      { title: "Best bug?", detail: "A timezone one", url: null },
      { title: "Thai", detail: "", url: null },
      { title: "English", detail: "Professional", url: null },
      { title: "blue", detail: "3", url: null },
    ]);
  });

  it("drops empty items and unsafe links", () => {
    const items = sectionItems({ key: "x", title: "X", items: [null, {}, "  ", { name: "Talk", url: "javascript:alert(1)" }] });

    expect(items).toEqual([{ title: "Talk", detail: "", url: null }]);
  });

  it("leaves out sections with nothing readable", () => {
    const sections = customSections([
      { key: "empty", title: "Empty", items: [] },
      { key: "awards", title: "Awards", items: [{ name: "Finalist" }] },
    ]);

    expect(sections.map((section) => section.key)).toEqual(["awards"]);
  });
});
