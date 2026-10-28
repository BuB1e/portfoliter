import { Announcements } from "~/components/skytrain/Announcements";
import { LineMap } from "~/components/skytrain/LineMap";
import { PassCards } from "~/components/skytrain/PassCards";
import { PROJECT_LINES, ProjectLine } from "~/components/skytrain/ProjectLine";
import { SkillLines } from "~/components/skytrain/SkillLines";
import { SkySection } from "~/components/skytrain/SkySection";
import { StationSign } from "~/components/skytrain/StationSign";
import { TopUp } from "~/components/skytrain/TopUp";
import { currentCompany } from "~/lib/experience";
import { customSections } from "~/lib/fields";
import { groupProjects, projectGroupId } from "~/lib/projects";
import { AWARDS_KEY, getAwards } from "~/lib/sections";
import type { ThemePageProps } from "../types";

export const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@600;700&display=swap";

export function SkytrainPage({ portfolio }: ThemePageProps) {
  const fonts = <link rel="stylesheet" href={FONTS_HREF} precedence="default" />;

  if (!portfolio) {
    return (
      <main className="mx-auto grid max-w-[1080px] place-content-center px-5 py-32 text-center">
        {fonts}
        <h1 className="font-sky-sign text-6xl font-bold">Service not started</h1>
        <p className="mt-3 text-sky-muted">This page fills in once the profile is published.</p>
      </main>
    );
  }

  const { profile, experiences, projects, skillGroups, education, certifications, sections } = portfolio;
  const awards = getAwards(sections);
  // Awards keep their platform-display wording; every other section gets its own board.
  const boards = customSections(sections, [AWARDS_KEY]);

  return (
    <>
      {fonts}
      <StationSign profile={profile} currentCompany={currentCompany(experiences)} />

      <main className="mx-auto max-w-[1080px] px-5">
        {profile.bio && <p className="mt-12 max-w-[56ch] text-xl leading-relaxed">{profile.bio}</p>}
        {experiences.length > 0 && (
          <SkySection id="line-title" title="Career line" note="Every stop so far, newest first. Projects built at a job change here for the Sukhumvit line.">
            <LineMap experiences={experiences} projects={projects} />
          </SkySection>
        )}
        {groupProjects(projects).map((group) => (
          <SkySection key={group.type} id={projectGroupId(group.type)} title={PROJECT_LINES[group.type].title} note={PROJECT_LINES[group.type].note}>
            <ProjectLine projects={group.projects} />
          </SkySection>
        ))}
        {skillGroups.length > 0 && (
          <SkySection id="network-title" title="Network map" note="Every line this engineer can ride without a transfer.">
            <SkillLines groups={skillGroups} />
          </SkySection>
        )}
        {education.length + certifications.length > 0 && (
          <SkySection id="passes-title" title="Passes" note="Valid for travel on all lines.">
            <PassCards education={education} certifications={certifications} />
          </SkySection>
        )}
        {awards && (
          <SkySection id="board-title" title="Announcements" note={`${awards.title}, as shown on the platform display.`}>
            <Announcements entries={awards.awards} />
          </SkySection>
        )}
        {boards.map((section) => (
          <SkySection key={section.key} id={`board-${section.key}`} title={section.title} note="As shown on the platform display.">
            <Announcements entries={section.entries} />
          </SkySection>
        ))}
      </main>

      <TopUp profile={profile} links={portfolio.links} />
    </>
  );
}
