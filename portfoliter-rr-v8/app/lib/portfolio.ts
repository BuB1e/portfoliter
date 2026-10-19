// Mirrors the JSON from the Go API's GET /v1/portfolio. Dates are "YYYY-MM-DD".

export type ProjectType = "PERSONAL" | "WORK";

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

export interface Project {
  id: number;
  slug: string;
  title: string;
  projectType: ProjectType;
  experienceId: number | null;
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
  institution: string;
  degree: string | null;
  field: string | null;
  startDate: string | null;
  endDate: string | null;
  description: string;
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
  profile: Profile;
  links: Link[];
  experiences: Experience[];
  projects: Project[];
  skills: Skill[];
  education: Education[];
  certifications: Certification[];
  sections: Section[];
}
