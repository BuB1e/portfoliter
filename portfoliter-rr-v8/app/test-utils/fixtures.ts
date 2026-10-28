import type { Education, PortfolioView, Project } from "~/lib/portfolio";

// Small fixtures for focused tests. All content is fictional. For a complete profile with every field
// set, use makeSampleView() in ./sampleView.ts.

export function makeEducation(overrides: Partial<Education> = {}): Education {
  return {
    id: 1,
    institution: "Porto Polytechnic",
    degree: "B.Sc.",
    field: "Software Engineering",
    startDate: null,
    endDate: "2022-07-31",
    description: "",
    ...overrides,
  };
}

export function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 1,
    slug: "tidewatch",
    title: "Tidewatch",
    projectType: "UNIVERSITY",
    experienceId: null,
    educationId: 1,
    summary: "Final-year project: tide charts and flood warnings for harbour crews.",
    content: "- **Charts** for harbour crews",
    repoUrl: null,
    demoUrl: null,
    coverUrl: null,
    startDate: "2021-09-01",
    endDate: "2022-06-30",
    isFeatured: true,
    skills: ["Python"],
    experience: null,
    education: null,
    ...overrides,
  };
}

// A project as GET /v1/projects/:slug returns it: the same shape, with its school embedded.
export function makeProjectDetail(overrides: Partial<Project> = {}): Project {
  return makeProject({ education: makeEducation(), ...overrides });
}

export function makePortfolio(overrides: Partial<PortfolioView> = {}): PortfolioView {
  return {
    theme: "",
    profile: {
      fullName: "Jane Doe",
      headline: "Engineer",
      bio: "",
      avatarUrl: null,
      location: null,
      email: null,
      resumeUrl: null,
    },
    links: [],
    experiences: [],
    projects: [makeProject()],
    skills: [],
    skillGroups: [],
    education: [],
    certifications: [],
    sections: [],
    ...overrides,
  };
}
