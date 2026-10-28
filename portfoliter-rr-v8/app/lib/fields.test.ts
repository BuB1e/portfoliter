import { describe, expect, it } from "vitest";

import { makeSampleProject, makeSampleView } from "~/test-utils/sampleView";
import { certificationLine, customSections, educationLine, experienceLine, linkedLine, linkedName } from "./fields";
import { employmentTypeLabel, LABELS, skillGroupLabel } from "./labels";

const view = makeSampleView();

describe("experienceLine", () => {
  it("carries every fact of a job, formatted", () => {
    const line = experienceLine(view.experiences[0]);

    expect(line).toEqual({
      role: "Staff Engineer",
      company: "Lumen Freight",
      title: "Staff Engineer at Lumen Freight",
      employmentType: "Full-time",
      location: "Porto, Portugal",
      dates: "Mar 2024 to now",
      meta: "Full-time, Porto, Portugal, Mar 2024 to now",
      description: "Leads the routing platform team.",
      skills: ["Go", "PostgreSQL"],
      isCurrent: true,
    });
  });

  it("leaves unset facts out of meta and returns null for them", () => {
    const line = experienceLine({ ...view.experiences[1], employmentType: null, description: "" });

    expect(line.meta).toBe("Jan 2023 to Feb 2024");
    expect(line.employmentType).toBeNull();
    expect(line.location).toBeNull();
    expect(line.description).toBeNull();
  });
});

describe("employmentTypeLabel", () => {
  it.each([
    ["full-time", "Full-time"],
    ["Full Time", "Full-time"],
    ["part_time", "Part-time"],
    ["contract", "Contract"],
    ["freelance", "Freelance"],
    ["internship", "Internship"],
    ["self-employed", "Self-employed"],
    ["apprenticeship", "Apprenticeship"],
    ["fellowship", "Fellowship"],
  ])("%s reads %s", (type, label) => {
    expect(employmentTypeLabel(type)).toBe(label);
  });

  it.each([null, "", "  "])("%j has no label", (type) => {
    expect(employmentTypeLabel(type)).toBeNull();
  });
});

describe("educationLine", () => {
  it("joins degree and field and keeps the description", () => {
    expect(educationLine(view.education[0])).toEqual({
      institution: "Porto Polytechnic",
      qualification: "B.Sc. Software Engineering",
      title: "B.Sc. Software Engineering",
      label: "B.Sc. Software Engineering, Porto Polytechnic",
      dates: "Jul 2022",
      meta: "Porto Polytechnic, Jul 2022",
      description: "Final grade 17/20",
    });
  });

  it("falls back to the institution and null for empty values", () => {
    const line = educationLine({ ...view.education[1], field: null, startDate: null, endDate: null });

    expect(line.title).toBe("Open Night School");
    expect(line.qualification).toBeNull();
    expect(line.dates).toBeNull();
    expect(line.description).toBeNull();
    expect(line.meta).toBe("Open Night School");
  });
});

describe("certificationLine", () => {
  it("formats the date and keeps the link", () => {
    expect(certificationLine(view.certifications[0])).toMatchObject({ date: "Jun 2024", meta: "Cloud Co, Jun 2024", credentialUrl: "https://certs.example/mira" });
  });

  it("has no date and no link when they are unset", () => {
    expect(certificationLine(view.certifications[1])).toMatchObject({ date: null, meta: "Exam Board", credentialUrl: null });
  });
});

describe("linkedLine", () => {
  it("names the job with its dates", () => {
    expect(linkedLine(makeSampleProject("freight-router"))).toEqual({
      kind: "experience",
      title: "Staff Engineer at Lumen Freight",
      dates: "Mar 2024 to now",
      label: "Staff Engineer at Lumen Freight, Mar 2024 to now",
    });
    expect(linkedName(makeSampleProject("freight-router"))).toBe("Lumen Freight");
  });

  it("names the school with its dates", () => {
    expect(linkedLine(makeSampleProject("tidewatch"))?.label).toBe("B.Sc. Software Engineering, Porto Polytechnic, Jul 2022");
    expect(linkedName(makeSampleProject("tidewatch"))).toBe("Porto Polytechnic");
  });

  it("is null for a project with no published link", () => {
    expect(linkedLine(makeSampleProject("night-notes"))).toBeNull();
    expect(linkedName(makeSampleProject("night-notes"))).toBeNull();
  });
});

describe("customSections", () => {
  it("keeps every section with entries, minus the keys a design renders itself", () => {
    const empty = { key: "empty", title: "Empty", items: [], entries: [] };

    const sections = customSections([...view.sections, empty], ["prompts"]);

    expect(sections.map((section) => section.key)).toEqual(["awards", "talks", "languages"]);
  });
});

describe("skillGroupLabel", () => {
  it("capitalizes categories and names the uncategorized group from LABELS", () => {
    expect(view.skillGroups.map(skillGroupLabel)).toEqual(["Language", "Database", "Infrastructure", LABELS.otherSkills]);
    expect(LABELS.otherSkills).toBe("Other");
  });
});
