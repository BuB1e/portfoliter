import type { PortfolioView } from "~/lib/portfolio";

export type CitationFormat = "bibtex" | "apa";

export const CITATION_FORMATS: { key: CitationFormat; label: string }[] = [
  { key: "bibtex", label: "BibTeX" },
  { key: "apa", label: "APA" },
];

// The latest year anywhere in the data (jobs, projects, schools), so the paper's date never depends on
// the clock and server and browser render the same citation.
export function paperYear({ experiences, projects, education }: PortfolioView): string | null {
  const dates = [
    ...experiences.flatMap((job) => [job.startDate, job.endDate]),
    ...projects.flatMap((project) => [project.startDate, project.endDate]),
    ...education.flatMap((school) => [school.startDate, school.endDate]),
  ].filter((date): date is string => Boolean(date));
  return dates.length > 0 ? dates.sort().at(-1)!.slice(0, 4) : null;
}

function surname(fullName: string): string {
  return fullName.trim().split(/\s+/).at(-1) ?? fullName;
}

function givenNames(fullName: string): string[] {
  return fullName.trim().split(/\s+/).slice(0, -1);
}

// Where the paper can be found: the first link, else nothing (an email is not a place to read it).
function paperUrl({ links }: PortfolioView): string | null {
  return links[0]?.url ?? null;
}

// LaTeX special characters in a BibTeX field.
function bibEscape(text: string): string {
  return text.replace(/([\\{}%&$#_])/g, "\\$1");
}

export function bibtex(view: PortfolioView): string {
  const { profile } = view;
  const year = paperYear(view);
  const key = `${surname(profile.fullName).toLowerCase().replace(/[^a-z0-9]/g, "")}${year ?? ""}` || "portfolio";
  const given = givenNames(profile.fullName).join(" ");
  const url = paperUrl(view);
  const fields: [string, string | null][] = [
    ["author", given ? `${surname(profile.fullName)}, ${given}` : profile.fullName],
    ["title", profile.headline || null],
    ["year", year],
    ["howpublished", url ? `\\url{${url}}` : null],
    ["note", [profile.location, profile.email].filter(Boolean).join(", ") || null],
  ];
  const body = fields
    .filter(([, value]) => value)
    .map(([name, value]) => `  ${name} = {${name === "howpublished" ? value : bibEscape(value as string)}}`)
    .join(",\n");
  return `@misc{${key},\n${body}\n}`;
}

export function apa(view: PortfolioView): string {
  const { profile } = view;
  const initialsOfGiven = givenNames(profile.fullName)
    .map((name) => `${name.charAt(0)}.`)
    .join(" ");
  const author = initialsOfGiven ? `${surname(profile.fullName)}, ${initialsOfGiven}` : profile.fullName;
  const year = paperYear(view) ?? "n.d.";
  const url = paperUrl(view);
  const title = profile.headline ? `${profile.headline.replace(/\.$/, "")} [Portfolio].` : "[Portfolio].";
  return [`${author} (${year}).`, title, url].filter(Boolean).join(" ");
}

export function citation(view: PortfolioView, format: CitationFormat): string {
  return format === "bibtex" ? bibtex(view) : apa(view);
}
