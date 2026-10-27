import type { Portfolio, Project, ProjectDetail } from "~/lib/portfolio";

export function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 1,
    slug: "growthcheck",
    title: "GrowthCheck",
    projectType: "UNIVERSITY",
    experienceId: null,
    educationId: 1,
    summary: "Senior project: growth charts and LSTM risk predictions.",
    content: "- **Charts** for volunteers",
    repoUrl: null,
    demoUrl: null,
    coverUrl: null,
    startDate: "2025-09-01",
    endDate: "2026-04-30",
    isFeatured: true,
    skills: ["LSTM"],
    ...overrides,
  };
}

export function makeProjectDetail(overrides: Partial<ProjectDetail> = {}): ProjectDetail {
  return {
    ...makeProject(),
    experience: null,
    education: {
      id: 1,
      institution: "Kasetsart University",
      degree: "B.Sc.",
      field: "Computer Science",
      startDate: null,
      endDate: "2026-04-30",
      description: "",
    },
    ...overrides,
  };
}

export function makePortfolio(overrides: Partial<Portfolio> = {}): Portfolio {
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
    education: [],
    certifications: [],
    sections: [],
    ...overrides,
  };
}
