import { SpecCredentials } from "~/components/spec-sheet/SpecCredentials";
import { SpecExperience } from "~/components/spec-sheet/SpecExperience";
import { SpecHeader } from "~/components/spec-sheet/SpecHeader";
import { SpecProjects } from "~/components/spec-sheet/SpecProjects";
import { SpecRow } from "~/components/spec-sheet/SpecRow";
import { SpecSkills } from "~/components/spec-sheet/SpecSkills";
import { careerStartYear } from "~/lib/experience";
import { firstName } from "~/lib/format";
import type { ProjectType } from "~/lib/portfolio";
import { groupProjects, projectGroupId } from "~/lib/projects";
import { getAwards } from "~/lib/sections";
import { groupSkills } from "~/lib/skills";
import type { ThemePageProps } from "../types";

export const FONTS_HREF = "https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400..800&display=swap";

export const GROUP_LABELS: Record<ProjectType, string> = {
  WORK: "Work projects",
  PERSONAL: "Personal projects",
  UNIVERSITY: "University projects",
};

export function SpecSheetPage({ portfolio }: ThemePageProps) {
  const fonts = <link rel="stylesheet" href={FONTS_HREF} precedence="default" />;

  if (!portfolio) {
    return (
      <main className="mx-auto max-w-[1040px] px-5 py-32">
        {fonts}
        <h1 className="text-5xl font-bold tracking-tight">Nothing here yet</h1>
        <p className="mt-4 text-lg text-ss-muted">This page fills in once the profile is published.</p>
      </main>
    );
  }

  const { profile, experiences, projects, skills, education, certifications, sections } = portfolio;
  const awards = getAwards(sections);

  return (
    <div className="mx-auto max-w-[1040px] px-5">
      {fonts}
      <SpecHeader profile={profile} links={portfolio.links} sinceYear={careerStartYear(experiences)} />

      <main>
        {profile.bio && (
          <SpecRow id="about-title" label="About">
            <p className="max-w-[52ch] text-[clamp(1.2rem,2vw,1.4rem)] leading-normal">{profile.bio}</p>
          </SpecRow>
        )}
        {experiences.length > 0 && (
          <SpecRow id="experience-title" label="Experience">
            <SpecExperience experiences={experiences} />
          </SpecRow>
        )}
        {groupProjects(projects).map((group) => (
          <SpecRow key={group.type} id={projectGroupId(group.type)} label={GROUP_LABELS[group.type]}>
            <SpecProjects projects={group.projects} experiences={experiences} education={education} />
          </SpecRow>
        ))}
        {skills.length > 0 && (
          <SpecRow id="skills-title" label="Skills">
            <SpecSkills groups={groupSkills(skills)} />
          </SpecRow>
        )}
        {education.length + certifications.length > 0 && (
          <SpecRow id="credentials-title" label="Education and certifications">
            <SpecCredentials education={education} certifications={certifications} />
          </SpecRow>
        )}
        {awards && awards.awards.length > 0 && (
          <SpecRow id="awards-title" label={awards.title}>
            <ul className="grid gap-3">
              {awards.awards.map((award) => (
                <li key={award.name}>
                  <span className="font-semibold">{award.name}</span>
                  {award.note && <span className="text-ss-muted">, {award.note}</span>}
                </li>
              ))}
            </ul>
          </SpecRow>
        )}
      </main>

      <footer className="mt-6 border-t border-ss-ink py-14">
        <p className="text-ss-muted">Questions about anything on this sheet are welcome.</p>
        {profile.email && (
          <a
            href={`mailto:${profile.email}`}
            className="mt-2 inline-block text-[clamp(1.6rem,4.5vw,3rem)] leading-tight font-bold tracking-[-0.02em] text-ss-blue"
          >
            Email {firstName(profile.fullName)}
          </a>
        )}
      </footer>
    </div>
  );
}
