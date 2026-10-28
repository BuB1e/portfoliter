// Mirrors the Go API's normalized portfolio view (docs/portfolio-view.md). Dates are "YYYY-MM-DD".
// Optional fields are null when unset (never ""); required text is a string, "" when empty; lists are
// never null. Designs render this shape and do not re-derive grouping or links.

export type ProjectType = "WORK" | "PERSONAL" | "UNIVERSITY";

export interface Profile {
  fullName: string;
  headline: string;
  bio: string;
  avatarUrl: string | null;
  location: string | null;
  email: string | null;
  resumeUrl: string | null;
}

export interface Link {
  platform: string;
  url: string;
}

// employmentType is free text as the owner wrote it ("full-time", "internship", ...); label it with
// employmentTypeLabel() from lib/labels.ts.
export interface Experience {
  id: number;
  company: string;
  role: string;
  employmentType: string | null;
  location: string | null;
  startDate: string;
  endDate: string | null;
  description: string;
  skills: string[];
}

export interface Education {
  id: number;
  institution: string;
  degree: string | null;
  field: string | null;
  startDate: string | null;
  endDate: string | null;
  description: string;
}

// summary is the card's short description; content is markdown for the project page.
// experience (WORK) and education (UNIVERSITY) are the published rows the project links to, embedded
// by the backend; they and their ids are null when unset or when the linked row is a draft.
// GET /v1/projects/:slug returns this same shape.
export interface Project {
  id: number;
  slug: string;
  title: string;
  projectType: ProjectType;
  experienceId: number | null;
  educationId: number | null;
  summary: string;
  content: string;
  repoUrl: string | null;
  demoUrl: string | null;
  coverUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  isFeatured: boolean;
  skills: string[];
  experience: Experience | null;
  education: Education | null;
}

export interface Skill {
  name: string;
  category: string | null;
}

// Skills of one category, in catalog order. Uncategorized skills are the last group, key "other" and
// category null; skillGroupLabel() in lib/labels.ts gives every group its heading.
export interface SkillGroup {
  key: string;
  category: string | null;
  skills: string[];
}

export interface Certification {
  id: number;
  name: string;
  issuer: string;
  issuedDate: string | null;
  credentialUrl: string | null;
}

// One item of a free-form section, read by the backend into a generic shape. url is http(s) only.
export interface SectionEntry {
  title: string;
  detail: string | null;
  url: string | null;
}

// items is the raw JSON as stored; render entries.
export interface Section {
  key: string;
  title: string;
  items: unknown[];
  entries: SectionEntry[];
}

export interface PortfolioView {
  // Active design key from set_theme; "" until one is set. See lib/theme.ts.
  theme: string;
  profile: Profile;
  links: Link[];
  experiences: Experience[];
  projects: Project[];
  skills: Skill[];
  skillGroups: SkillGroup[];
  education: Education[];
  certifications: Certification[];
  sections: Section[];
}
