import { Compliance } from "~/components/status-page/Compliance";
import { IncidentHistory } from "~/components/status-page/IncidentHistory";
import { ServiceList } from "~/components/status-page/ServiceList";
import { SkillComponents } from "~/components/status-page/SkillComponents";
import { StatusCard } from "~/components/status-page/StatusCard";
import { StatusHeader } from "~/components/status-page/StatusHeader";
import { SectionEntries } from "~/components/shared/SectionEntries";
import { currentCompany } from "~/lib/experience";
import { customSections } from "~/lib/fields";
import { platformName } from "~/lib/format";
import type { ProjectType, Skill } from "~/lib/portfolio";
import { groupProjects, projectGroupId } from "~/lib/projects";
import type { ThemePageProps } from "../types";

export const SERVICE_GROUPS: Record<ProjectType, { title: string; aside: string }> = {
  WORK: { title: "Production services", aside: "Built at work" },
  PERSONAL: { title: "Side services", aside: "Personal projects" },
  UNIVERSITY: { title: "Campus services", aside: "University projects" },
};

export const FONTS_HREF = "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&display=swap";

// "Powered by Go, PostgreSQL and coffee": the owner's first two skills, from the data.
function poweredBy(skills: Skill[]): string {
  const names = skills.slice(0, 2).map((skill) => skill.name);
  return names.length > 0 ? `Powered by ${names.join(", ")} and coffee` : "Powered by coffee";
}

export function StatusPage({ portfolio }: ThemePageProps) {
  const fonts = <link rel="stylesheet" href={FONTS_HREF} precedence="default" />;

  if (!portfolio) {
    return (
      <main className="mx-auto max-w-[860px] px-5 py-32">
        {fonts}
        <h1 className="text-3xl font-semibold">No status yet</h1>
        <p className="mt-2 text-st-muted">This page fills in once the profile is published.</p>
      </main>
    );
  }

  const { profile, experiences, projects, skills, skillGroups, education, certifications, sections } = portfolio;

  return (
    <div className="mx-auto max-w-[860px] px-5 pb-16">
      {fonts}
      <StatusHeader profile={profile} currentCompany={currentCompany(experiences)} />

      <main>
        {(profile.headline || profile.bio) && (
          <StatusCard id="about-title" title="About this service">
            <div className="px-5 py-5">
              <p className="text-lg font-medium">{profile.headline}</p>
              {profile.bio && <p className="mt-2 max-w-[65ch] text-st-muted">{profile.bio}</p>}
            </div>
          </StatusCard>
        )}
        {skillGroups.length > 0 && (
          <StatusCard id="components-title" title="Components" aside="Uptime over the past 90 days">
            <SkillComponents groups={skillGroups} />
          </StatusCard>
        )}
        {groupProjects(projects).map((group) => (
          <StatusCard key={group.type} id={projectGroupId(group.type)} title={SERVICE_GROUPS[group.type].title} aside={SERVICE_GROUPS[group.type].aside}>
            <ServiceList projects={group.projects} />
          </StatusCard>
        ))}
        {experiences.length > 0 && (
          <StatusCard id="incidents-title" title="Incident history" aside="Newest first">
            <IncidentHistory experiences={experiences} />
          </StatusCard>
        )}
        {education.length + certifications.length > 0 && (
          <StatusCard id="compliance-title" title="Compliance">
            <Compliance education={education} certifications={certifications} />
          </StatusCard>
        )}
        {/* Every free-form section (prompts, awards, talks, ...) as a plain list card. */}
        {customSections(sections).map((section) => (
          <StatusCard key={section.key} id={`section-${section.key}`} title={section.title}>
            <SectionEntries
              entries={section.entries}
              classNames={{
                list: "divide-y divide-st-line",
                item: "flex flex-wrap justify-between gap-x-6 gap-y-1 px-5 py-4",
                title: "font-medium",
                detail: "text-st-muted",
                link: "text-st-info",
              }}
            />
          </StatusCard>
        ))}
      </main>

      <footer className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-st-line pt-6 text-sm text-st-muted">
        <span>{poweredBy(skills)}</span>
        <nav aria-label="Contact" className="flex flex-wrap gap-4 font-medium">
          {profile.email && <a href={`mailto:${profile.email}`} className="text-st-info">Report an issue</a>}
          {portfolio.links.map((link) => (
            <a key={link.url} href={link.url} className="text-st-info">
              {platformName(link.platform)}
            </a>
          ))}
          {profile.resumeUrl && <a href={profile.resumeUrl} className="text-st-info">Runbook (PDF)</a>}
        </nav>
      </footer>
    </div>
  );
}
