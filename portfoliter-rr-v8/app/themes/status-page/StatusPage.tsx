import { Compliance } from "~/components/status-page/Compliance";
import { IncidentHistory } from "~/components/status-page/IncidentHistory";
import { ServiceList } from "~/components/status-page/ServiceList";
import { SkillComponents } from "~/components/status-page/SkillComponents";
import { StatusCard } from "~/components/status-page/StatusCard";
import { StatusHeader } from "~/components/status-page/StatusHeader";
import { currentCompany } from "~/lib/experience";
import { capitalize } from "~/lib/format";
import type { ProjectType } from "~/lib/portfolio";
import { groupProjects, projectGroupId } from "~/lib/projects";
import { getAwards } from "~/lib/sections";
import { groupSkills } from "~/lib/skills";
import type { ThemePageProps } from "../types";

export const SERVICE_GROUPS: Record<ProjectType, { title: string; aside: string }> = {
  WORK: { title: "Production services", aside: "Built at work" },
  PERSONAL: { title: "Side services", aside: "Personal projects" },
  UNIVERSITY: { title: "Campus services", aside: "University projects" },
};

export const FONTS_HREF = "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&display=swap";

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

  const { profile, experiences, projects, skills, education, certifications, sections } = portfolio;
  const awards = getAwards(sections);

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
        {skills.length > 0 && (
          <StatusCard id="components-title" title="Components" aside="Uptime over the past 90 days">
            <SkillComponents groups={groupSkills(skills)} />
          </StatusCard>
        )}
        {groupProjects(projects).map((group) => (
          <StatusCard key={group.type} id={projectGroupId(group.type)} title={SERVICE_GROUPS[group.type].title} aside={SERVICE_GROUPS[group.type].aside}>
            <ServiceList projects={group.projects} experiences={experiences} education={education} />
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
        {awards && awards.awards.length > 0 && (
          <StatusCard id="kudos-title" title={awards.title}>
            <ul className="divide-y divide-st-line">
              {awards.awards.map((award) => (
                <li key={award.name} className="flex flex-wrap justify-between gap-x-6 gap-y-1 px-5 py-4">
                  <span className="font-medium">{award.name}</span>
                  {award.note && <span className="text-st-muted">{award.note}</span>}
                </li>
              ))}
            </ul>
          </StatusCard>
        )}
      </main>

      <footer className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-st-line pt-6 text-sm text-st-muted">
        <span>Powered by Go, PostgreSQL and coffee</span>
        <nav aria-label="Contact" className="flex flex-wrap gap-4 font-medium">
          {profile.email && <a href={`mailto:${profile.email}`} className="text-st-info">Report an issue</a>}
          {portfolio.links.map((link) => (
            <a key={link.url} href={link.url} className="text-st-info">
              {capitalize(link.platform)}
            </a>
          ))}
          {profile.resumeUrl && <a href={profile.resumeUrl} className="text-st-info">Runbook (PDF)</a>}
        </nav>
      </footer>
    </div>
  );
}
