import { Articles } from "~/components/broadsheet/Articles";
import { Appointments, Classifieds, Notices } from "~/components/broadsheet/Columns";
import { LeadStory } from "~/components/broadsheet/LeadStory";
import { Masthead, paperName } from "~/components/broadsheet/Masthead";
import { SectionFlag } from "~/components/broadsheet/SectionFlag";
import { careerStartYear } from "~/lib/experience";
import { platformName } from "~/lib/format";
import type { ProjectType } from "~/lib/portfolio";
import { customSections } from "~/lib/fields";
import { groupProjects, projectGroupId } from "~/lib/projects";
import type { ThemePageProps } from "../types";

export const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400..900;1,8..60,400..700&family=UnifrakturMaguntia&family=Noto+Serif+Thai:wght@400;700&display=swap";

// The paper's sections for the three project groups.
export const DESKS: Record<ProjectType, { title: string; note: string }> = {
  WORK: { title: "Business", note: "Projects built on the job." },
  PERSONAL: { title: "Weekend", note: "Side projects, built in spare time." },
  UNIVERSITY: { title: "Campus", note: "Coursework and the senior project." },
};

export function BroadsheetPage({ portfolio }: ThemePageProps) {
  const fonts = <link rel="stylesheet" href={FONTS_HREF} precedence="default" />;

  if (!portfolio) {
    return (
      <main className="mx-auto max-w-[1180px] px-4 py-24 text-center sm:px-6">
        {fonts}
        <h1 className="font-bs-nameplate text-6xl">Stop the presses</h1>
        <p className="mt-4 text-lg">The first edition goes to print once the profile is published.</p>
      </main>
    );
  }

  const { profile, links, experiences, projects, skills, skillGroups, education, certifications, sections } = portfolio;
  const groups = groupProjects(projects);
  const extras = customSections(sections);
  const hasNotices = education.length + certifications.length + extras.length > 0;

  const index = [
    ...groups.map((group) => ({ href: `#${projectGroupId(group.type)}`, label: DESKS[group.type].title, count: group.projects.length })),
    ...(experiences.length > 0 ? [{ href: "#appointments-title", label: "Appointments", count: experiences.length }] : []),
    ...(skills.length > 0 ? [{ href: "#classifieds-title", label: "Classifieds", count: skills.length }] : []),
    ...(hasNotices ? [{ href: "#notices-title", label: "Notices", count: education.length + certifications.length + extras.length }] : []),
  ];

  return (
    <div className="mx-auto max-w-[1180px] px-4 pb-10 sm:px-6">
      {fonts}
      <Masthead
        fullName={profile.fullName}
        location={profile.location}
        sinceYear={careerStartYear(experiences)}
        issue={projects.length}
        sections={index.map(({ href, label }) => ({ href, label }))}
      />

      <main>
        <LeadStory profile={profile} links={links} index={index} />

        {groups.map((group) => (
          <SectionFlag key={group.type} id={projectGroupId(group.type)} title={DESKS[group.type].title} note={DESKS[group.type].note}>
            <Articles projects={group.projects} />
          </SectionFlag>
        ))}
        {experiences.length > 0 && (
          <SectionFlag id="appointments-title" title="Appointments" note="People on the move: every job so far.">
            <Appointments experiences={experiences} />
          </SectionFlag>
        )}
        {skillGroups.length > 0 && (
          <SectionFlag id="classifieds-title" title="Classifieds" note="Skills, listed by trade.">
            <Classifieds groups={skillGroups} />
          </SectionFlag>
        )}
        {hasNotices && (
          <SectionFlag id="notices-title" title="Notices" note="Degrees, certificates and other public notices.">
            <Notices education={education} certifications={certifications} extras={extras} />
          </SectionFlag>
        )}
      </main>

      <footer className="mt-16 border-t-[3px] border-double border-bs-ink pt-4 text-[0.92rem] text-bs-grey">
        <p>
          {paperName(profile.fullName)} is written, printed and published by {profile.fullName}
          {profile.location ? `, ${profile.location}` : ""}.
        </p>
        <p className="mt-1 flex flex-wrap gap-x-5 gap-y-1">
          {profile.email && <a href={`mailto:${profile.email}`}>Write to the editor</a>}
          {links.map((link) => (
            <a key={link.url} href={link.url}>
              {platformName(link.platform)}
            </a>
          ))}
          {profile.resumeUrl && <a href={profile.resumeUrl}>Resume (PDF)</a>}
        </p>
      </footer>
    </div>
  );
}
