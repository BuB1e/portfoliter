import { AfterHoursLine } from "~/components/skytrain/AfterHoursLine";
import { Announcements } from "~/components/skytrain/Announcements";
import { LineMap } from "~/components/skytrain/LineMap";
import { PassCards } from "~/components/skytrain/PassCards";
import { SkillLines } from "~/components/skytrain/SkillLines";
import { SkySection } from "~/components/skytrain/SkySection";
import { StationSign } from "~/components/skytrain/StationSign";
import { TopUp } from "~/components/skytrain/TopUp";
import { currentCompany } from "~/lib/experience";
import { getAwards } from "~/lib/sections";
import { groupSkills } from "~/lib/skills";
import type { ThemePageProps } from "../types";

const FONTS_HREF =
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

  const { profile, experiences, projects, skills, education, certifications, sections } = portfolio;
  const personalProjects = projects.filter((project) => project.projectType === "PERSONAL" || !project.experienceId);
  const awards = getAwards(sections);

  return (
    <>
      {fonts}
      <StationSign profile={profile} currentCompany={currentCompany(experiences)} />

      <main className="mx-auto max-w-[1080px] px-5">
        {profile.bio && <p className="mt-12 max-w-[56ch] text-xl leading-relaxed">{profile.bio}</p>}
        {experiences.length > 0 && (
          <SkySection
            id="line-title"
            title="Career line"
            note="Every stop so far, newest first. Projects built at a job are interchanges at that station."
          >
            <LineMap experiences={experiences} projects={projects} />
          </SkySection>
        )}
        {personalProjects.length > 0 && (
          <SkySection id="gold-title" title="Gold line: after hours" note="Personal projects. Runs evenings and weekends.">
            <AfterHoursLine projects={personalProjects} />
          </SkySection>
        )}
        {skills.length > 0 && (
          <SkySection id="network-title" title="Network map" note="Every line this engineer can ride without a transfer.">
            <SkillLines groups={groupSkills(skills)} />
          </SkySection>
        )}
        {education.length + certifications.length > 0 && (
          <SkySection id="passes-title" title="Passes" note="Valid for travel on all lines.">
            <PassCards education={education} certifications={certifications} />
          </SkySection>
        )}
        {awards && awards.awards.length > 0 && (
          <SkySection id="board-title" title="Announcements" note={`${awards.title}, as shown on the platform display.`}>
            <Announcements awards={awards.awards} />
          </SkySection>
        )}
      </main>

      <TopUp profile={profile} links={portfolio.links} />
    </>
  );
}
