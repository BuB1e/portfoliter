// Mirrors the JSON from the Go API's GET /v1/portfolio. Dates are "YYYY-MM-DD".

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

// summary is the card's short description; content is markdown for the project page.
// experienceId (WORK) and educationId (UNIVERSITY) are null when unset or when the linked row is a draft.
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
}

export interface Skill {
  name: string;
  category: string | null;
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

// GET /v1/projects/:slug: one published project with the published rows it links to.
export interface ProjectDetail extends Project {
  experience: Experience | null;
  education: Education | null;
}

export interface Certification {
  name: string;
  issuer: string;
  issuedDate: string | null;
  credentialUrl: string | null;
}

export interface Section {
  key: string;
  title: string;
  items: unknown[];
}

export interface Portfolio {
  // Active design key from set_theme; "" until one is set. See lib/theme.ts.
  theme: string;
  profile: Profile;
  links: Link[];
  experiences: Experience[];
  projects: Project[];
  skills: Skill[];
  education: Education[];
  certifications: Certification[];
  sections: Section[];
}
