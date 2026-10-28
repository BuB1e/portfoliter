import { formatMonth, formatRange } from "./format";
import { employmentTypeLabel } from "./labels";
import type { Certification, Education, Experience, Project, Section } from "./portfolio";

// Every design reads rows through these lines, so no design can forget a field: each line carries
// every published value of its row, already formatted, with null for the ones that are unset.
// Designs choose the layout and wording around them; `meta` is a ready-made comma-joined summary for
// designs that print facts in one line.

function joinFacts(parts: (string | null | undefined)[]): string {
  return parts.filter(Boolean).join(", ");
}

export interface ExperienceLine {
  role: string;
  company: string;
  // "Staff Engineer at Lumen Freight"
  title: string;
  // "Full-time", or null when unset
  employmentType: string | null;
  location: string | null;
  // "Mar 2024 to now"
  dates: string;
  // "Full-time, Porto, Portugal, Mar 2024 to now": every fact except role, company, description and skills
  meta: string;
  description: string | null;
  skills: string[];
  isCurrent: boolean;
}

export function experienceLine(experience: Experience): ExperienceLine {
  const employmentType = employmentTypeLabel(experience.employmentType);
  const dates = formatRange(experience.startDate, experience.endDate);
  return {
    role: experience.role,
    company: experience.company,
    title: `${experience.role} at ${experience.company}`,
    employmentType,
    location: experience.location,
    dates,
    meta: joinFacts([employmentType, experience.location, dates]),
    description: experience.description || null,
    skills: experience.skills,
    isCurrent: !experience.endDate,
  };
}

export interface EducationLine {
  institution: string;
  // "B.Sc. Software Engineering", or null when neither degree nor field is set
  qualification: string | null;
  // qualification, or the institution when there is none
  title: string;
  // "B.Sc. Software Engineering, Porto Polytechnic"
  label: string;
  // "Sep 2018 to Jul 2022", "Jul 2022" with no start date, or null with no dates
  dates: string | null;
  // "Porto Polytechnic, Jul 2022": institution and dates, for the line under the title
  meta: string;
  // e.g. a grade; null when empty
  description: string | null;
}

export function educationLine(education: Education): EducationLine {
  const qualification = [education.degree, education.field].filter(Boolean).join(" ") || null;
  const dates = formatRange(education.startDate, education.endDate) || null;
  return {
    institution: education.institution,
    qualification,
    title: qualification ?? education.institution,
    label: qualification ? `${qualification}, ${education.institution}` : education.institution,
    dates,
    meta: joinFacts([education.institution, dates]),
    description: education.description || null,
  };
}

export interface CertificationLine {
  name: string;
  issuer: string;
  // "Jun 2024", or null when the certification has no date: render nothing in its place
  date: string | null;
  credentialUrl: string | null;
  // "Cloud Co, Jun 2024" or just "Cloud Co"
  meta: string;
}

export function certificationLine(certification: Certification): CertificationLine {
  const date = certification.issuedDate ? formatMonth(certification.issuedDate) : null;
  return {
    name: certification.name,
    issuer: certification.issuer,
    date,
    credentialUrl: certification.credentialUrl,
    meta: joinFacts([certification.issuer, date]),
  };
}

export interface LinkedLine {
  kind: "experience" | "education";
  // "Staff Engineer at Lumen Freight" or "B.Sc. Software Engineering, Porto Polytechnic"
  title: string;
  // the job's or the school's dates; null for a school with no dates
  dates: string | null;
  // title and dates in one line: "Staff Engineer at Lumen Freight, Mar 2024 to now"
  label: string;
}

// The published job (WORK) or school (UNIVERSITY) a project belongs to, embedded by the backend.
export function linkedLine(project: Pick<Project, "experience" | "education">): LinkedLine | null {
  if (project.experience) {
    const line = experienceLine(project.experience);
    return { kind: "experience", title: line.title, dates: line.dates, label: joinFacts([line.title, line.dates]) };
  }
  if (project.education) {
    const line = educationLine(project.education);
    return { kind: "education", title: line.label, dates: line.dates, label: joinFacts([line.label, line.dates]) };
  }
  return null;
}

// Name of the job or school alone ("Lumen Freight", "Porto Polytechnic"), for tight spots such as a card.
export function linkedName(project: Pick<Project, "experience" | "education">): string | null {
  return project.experience?.company ?? project.education?.institution ?? null;
}

// Free-form sections with at least one entry, in API order. Designs that give some keys a special
// look (prompts, awards) pass those keys in `except` and must render them themselves.
export function customSections(sections: Section[], except: readonly string[] = []): Section[] {
  return sections.filter((section) => section.entries.length > 0 && !except.includes(section.key));
}

export function findSection(sections: Section[], key: string): Section | null {
  return sections.find((section) => section.key === key && section.entries.length > 0) ?? null;
}
