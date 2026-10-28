import { describe, expect, it } from "vitest";

import { makeProject } from "~/test-utils/fixtures";
import { groupProjects, projectPath, shortDescription, SUMMARY_MAX_CHARS } from "./projects";

describe("groupProjects", () => {
  it("orders groups Work, Personal, University and keeps API order inside each", () => {
    const projects = [
      makeProject({ id: 1, projectType: "UNIVERSITY" }),
      makeProject({ id: 2, projectType: "PERSONAL" }),
      makeProject({ id: 3, projectType: "WORK" }),
      makeProject({ id: 4, projectType: "PERSONAL" }),
    ];

    const groups = groupProjects(projects);

    expect(groups.map((group) => group.type)).toEqual(["WORK", "PERSONAL", "UNIVERSITY"]);
    expect(groups[1].projects.map((project) => project.id)).toEqual([2, 4]);
  });

  it("leaves out empty groups", () => {
    const groups = groupProjects([makeProject({ projectType: "PERSONAL" })]);

    expect(groups.map((group) => group.type)).toEqual(["PERSONAL"]);
  });

  it("returns no groups for no projects", () => {
    expect(groupProjects([])).toEqual([]);
  });
});

describe("shortDescription", () => {
  it("keeps a summary within the limit as is", () => {
    expect(shortDescription("  Short one.  ")).toBe("Short one.");
  });

  it("cuts a long summary at a word boundary and adds an ellipsis", () => {
    const summary = "word ".repeat(80);

    const result = shortDescription(summary);

    expect(Array.from(result).length).toBeLessThanOrEqual(SUMMARY_MAX_CHARS);
    expect(result.endsWith("word…")).toBe(true);
  });

  it("counts characters, not UTF-16 units", () => {
    const thai = "ก".repeat(SUMMARY_MAX_CHARS);

    expect(shortDescription(thai)).toBe(thai);
  });
});

describe("projectPath", () => {
  it("builds the detail URL and escapes the slug", () => {
    expect(projectPath("tidewatch")).toBe("/projects/tidewatch");
    expect(projectPath("a b/c")).toBe("/projects/a%20b%2Fc");
  });
});
