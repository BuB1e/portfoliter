import type { Education, Experience, PortfolioView, Project } from "~/lib/portfolio";

// A complete portfolio of a fictional person, shaped exactly like the backend's view
// (docs/portfolio-view.md), with every field set somewhere and the awkward cases included:
// every common employment type, a job with no location and one with no skills or description,
// uncategorized skills (the "other" group), a certification with no date or link, an education row
// with no start date and one with no degree, projects with no cover, no content or no dates, and
// custom sections with keys no design knows.

const experiences: Experience[] = [
  {
    id: 11,
    company: "Lumen Freight",
    role: "Staff Engineer",
    employmentType: "full-time",
    location: "Porto, Portugal",
    startDate: "2024-03-01",
    endDate: null,
    description: "Leads the routing platform team.",
    skills: ["Go", "PostgreSQL"],
  },
  {
    id: 12,
    company: "Kitebird Labs",
    role: "Backend Contractor",
    employmentType: "contract",
    location: null,
    startDate: "2023-01-01",
    endDate: "2024-02-29",
    description: "Rebuilt the billing service.",
    skills: ["TypeScript"],
  },
  {
    id: 13,
    company: "Orchard Health",
    role: "Data Engineer",
    employmentType: "part-time",
    location: "Braga, Portugal",
    startDate: "2022-08-01",
    endDate: "2022-12-31",
    description: "Kept the nightly reports on time.",
    skills: ["Python"],
  },
  {
    id: 14,
    company: "Gullpine Studio",
    role: "Web Developer",
    employmentType: "freelance",
    location: "Lisbon, Portugal",
    startDate: "2021-06-01",
    endDate: "2022-07-31",
    description: "Built shop sites for local makers.",
    skills: [],
  },
  {
    id: 15,
    company: "Halcyon Robotics",
    role: "Software Intern",
    employmentType: "internship",
    location: "Vigo, Spain",
    startDate: "2020-06-01",
    endDate: "2020-09-30",
    description: "",
    skills: ["Rust"],
  },
  {
    id: 16,
    company: "Castellanos Tools",
    role: "Founder",
    employmentType: "self-employed",
    location: null,
    startDate: "2019-01-01",
    endDate: "2020-05-31",
    description: "Sold a command-line tool to print shops.",
    skills: ["Go"],
  },
];

const education: Education[] = [
  {
    id: 31,
    institution: "Porto Polytechnic",
    degree: "B.Sc.",
    field: "Software Engineering",
    startDate: null,
    endDate: "2022-07-31",
    description: "Final grade 17/20",
  },
  {
    id: 32,
    institution: "Open Night School",
    degree: null,
    field: "Graphic Design",
    startDate: "2018-09-01",
    endDate: "2019-06-30",
    description: "",
  },
];

function project(fields: Omit<Project, "experience" | "education" | "experienceId" | "educationId"> & { experienceId?: number; educationId?: number }): Project {
  const experience = experiences.find((row) => row.id === fields.experienceId) ?? null;
  const school = education.find((row) => row.id === fields.educationId) ?? null;
  return { ...fields, experienceId: experience?.id ?? null, educationId: school?.id ?? null, experience, education: school };
}

const projects: Project[] = [
  project({
    id: 21,
    slug: "freight-router",
    title: "Freight Router",
    projectType: "WORK",
    experienceId: 11,
    summary: "Plans delivery routes for four hundred vans every night, re-planning live when a road closes.",
    content: "- **Live re-planning** when a road closes\n- **Replayable** decisions for every route",
    repoUrl: "https://github.example/mira/freight-router",
    demoUrl: "https://router.example",
    coverUrl: "https://files.example/cover/freight-router.png",
    startDate: "2024-05-01",
    endDate: null,
    isFeatured: true,
    skills: ["Go", "PostgreSQL"],
  }),
  project({
    id: 22,
    slug: "billing-rebuild",
    title: "Billing Rebuild",
    projectType: "WORK",
    experienceId: 12,
    summary: "Moved invoicing off a nightly batch onto events, so customers see charges within a minute.",
    content: "",
    repoUrl: null,
    demoUrl: null,
    coverUrl: null,
    startDate: "2023-02-01",
    endDate: "2023-11-30",
    isFeatured: false,
    skills: ["TypeScript"],
  }),
  project({
    id: 23,
    slug: "night-notes",
    title: "Night Notes",
    projectType: "PERSONAL",
    summary: "A notes app that works offline and syncs when the phone finds a network.",
    content: "",
    repoUrl: null,
    demoUrl: null,
    coverUrl: null,
    startDate: null,
    endDate: null,
    isFeatured: false,
    skills: [],
  }),
  project({
    id: 24,
    slug: "harbour-lights",
    title: "Harbour Lights",
    projectType: "PERSONAL",
    summary: "Maps every working lighthouse on the coast from open data.",
    content: "Built over one winter.",
    repoUrl: "https://github.example/mira/harbour-lights",
    demoUrl: null,
    coverUrl: "https://files.example/cover/harbour-lights.png",
    startDate: "2022-01-01",
    endDate: "2022-03-31",
    isFeatured: false,
    skills: ["Rust"],
  }),
  // Four personal projects, so designs that deal only a few cards at a time must still show all of them.
  project({
    id: 26,
    slug: "kiln-timer",
    title: "Kiln Timer",
    projectType: "PERSONAL",
    summary: "Tells a potter when the kiln has cooled enough to open.",
    content: "",
    repoUrl: null,
    demoUrl: null,
    coverUrl: null,
    startDate: "2020-11-01",
    endDate: "2020-12-31",
    isFeatured: false,
    skills: ["Go"],
  }),
  project({
    id: 27,
    slug: "tram-board",
    title: "Tram Board",
    projectType: "PERSONAL",
    summary: "A wall display of the next trams at the nearest stop.",
    content: "",
    repoUrl: null,
    demoUrl: null,
    coverUrl: null,
    startDate: "2019-10-01",
    endDate: null,
    isFeatured: false,
    skills: ["TypeScript"],
  }),
  project({
    id: 25,
    slug: "tidewatch",
    title: "Tidewatch",
    projectType: "UNIVERSITY",
    educationId: 31,
    summary: "Final-year project: tide charts and flood warnings for harbour crews.",
    content: "Charts and **warnings**.",
    repoUrl: null,
    demoUrl: null,
    coverUrl: null,
    startDate: "2021-09-01",
    endDate: "2022-06-30",
    isFeatured: false,
    skills: ["Python"],
  }),
];

export function makeSampleView(overrides: Partial<PortfolioView> = {}): PortfolioView {
  return {
    theme: "",
    profile: {
      fullName: "Mira Castellanos",
      headline: "Platform engineer who keeps freight moving.",
      bio: "Builds quiet infrastructure for logistics teams.",
      avatarUrl: "https://files.example/avatar/mira.jpg",
      location: "Porto, Portugal",
      email: "mira@example.com",
      resumeUrl: "https://files.example/resume/mira.pdf",
    },
    links: [
      { platform: "github", url: "https://github.example/mira" },
      { platform: "linkedin", url: "https://linkedin.example/in/mira" },
      { platform: "mastodon", url: "https://social.example/@mira" },
    ],
    experiences,
    projects,
    skills: [
      { name: "Go", category: "language" },
      { name: "PostgreSQL", category: "database" },
      { name: "TypeScript", category: "language" },
      { name: "Python", category: null },
      { name: "Rust", category: null },
      { name: "Terraform", category: "infrastructure" },
      { name: "Figma", category: null },
    ],
    skillGroups: [
      { key: "language", category: "language", skills: ["Go", "TypeScript"] },
      { key: "database", category: "database", skills: ["PostgreSQL"] },
      { key: "infrastructure", category: "infrastructure", skills: ["Terraform"] },
      { key: "other", category: null, skills: ["Python", "Rust", "Figma"] },
    ],
    education,
    certifications: [
      { id: 41, name: "Cloud Architect", issuer: "Cloud Co", issuedDate: "2024-06-15", credentialUrl: "https://certs.example/mira" },
      { id: 42, name: "Language exam C1", issuer: "Exam Board", issuedDate: null, credentialUrl: null },
    ],
    sections: [
      {
        key: "prompts",
        title: "Ask me about",
        items: [
          { question: "A bug I am proud of", answer: "A timezone slip that only fired on leap days." },
          { question: "Best tool", answer: "A good test fixture." },
        ],
        entries: [
          { title: "A bug I am proud of", detail: "A timezone slip that only fired on leap days.", url: null },
          { title: "Best tool", detail: "A good test fixture.", url: null },
        ],
      },
      {
        key: "awards",
        title: "Awards",
        items: [{ name: "Open-source award", note: "Harbour Dev Meetup, 2023" }],
        entries: [{ title: "Open-source award", detail: "Harbour Dev Meetup, 2023", url: null }],
      },
      {
        key: "talks",
        title: "Talks",
        items: [{ event: "PyCon Lisbon", role: "Speaker", url: "https://talks.example/pycon" }, "Lightning talk on tide data"],
        entries: [
          { title: "PyCon Lisbon", detail: "Speaker", url: "https://talks.example/pycon" },
          { title: "Lightning talk on tide data", detail: null, url: null },
        ],
      },
      {
        key: "languages",
        title: "Spoken languages",
        items: [{ label: "Portuguese", level: "Native" }, { label: "English", level: "Professional" }],
        entries: [
          { title: "Portuguese", detail: "Native", url: null },
          { title: "English", detail: "Professional", url: null },
        ],
      },
    ],
    ...overrides,
  };
}

// The project page's data: GET /v1/projects/:slug returns a project in the same shape as the list.
export function makeSampleProject(slug = "freight-router", overrides: Partial<Project> = {}): Project {
  const found = projects.find((candidate) => candidate.slug === slug);
  if (!found) {
    throw new Error(`no sample project ${slug}`);
  }
  return { ...found, ...overrides };
}
