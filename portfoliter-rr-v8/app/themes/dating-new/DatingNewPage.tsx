import { LineUp, type LineUpRow } from "~/components/dating-new/LineUp";
import { MatchCard, QuietFooter } from "~/components/dating-new/MatchCard";
import { ProfilePoster, TopBar } from "~/components/dating-new/ProfilePoster";
import { ProjectPlates } from "~/components/dating-new/ProjectPlates";
import { OrderedSections } from "~/components/shared/OrderedSections";
import { useReveal } from "~/hooks/useReveal";
import { currentCompany } from "~/lib/experience";
import { certificationLine, customSections, educationLine, experienceLine } from "~/lib/fields";
import { firstName } from "~/lib/format";
import { skillGroupLabel } from "~/lib/labels";
import type { Certification, Education, Experience, ProjectType, Section, SkillGroup } from "~/lib/portfolio";
import { groupProjects, projectGroupId } from "~/lib/projects";
import { AWARDS_KEY, PROMPTS_KEY } from "~/lib/sections";
import type { ThemePageProps } from "../types";

export const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,300..800&display=swap";

export const DECKS: Record<ProjectType, { title: string; lede: string }> = {
  WORK: { title: "Serious relationships", lede: "Projects I committed to at work. We went to production together." },
  PERSONAL: { title: "Weekend flings", lede: "Side projects. Like the ones you like; pass on the rest. I won't see the passes." },
  UNIVERSITY: { title: "College sweethearts", lede: "Where it all started: coursework and the senior project." },
};

const CONTACT_ID = "contact-title";

// The joke each free-form section gets as its lede; unknown keys get the general one.
const SECTION_LEDES: Record<string, string> = {
  [PROMPTS_KEY]: "Prompts, answered honestly.",
  [AWARDS_KEY]: "Humble brags, listed modestly.",
};

function educationRows(education: Education[]): LineUpRow[] {
  return education.map((school) => {
    const line = educationLine(school);
    return { key: String(school.id), cells: [line.institution, line.qualification, line.dates].filter(Boolean), note: line.description };
  });
}

function experienceRows(experiences: Experience[]): LineUpRow[] {
  return experiences.map((job) => {
    const line = experienceLine(job);
    const facts = [line.employmentType, line.location].filter(Boolean).join(", ");
    return {
      key: String(job.id),
      cells: [line.role, line.company, line.dates],
      note: (
        <>
          {facts && <p className="font-semibold">{facts}</p>}
          {line.description && <p className="mt-1">{line.description}</p>}
          {line.skills.length > 0 && <p className="dn-small mt-2">Into: {line.skills.join(", ")}</p>}
        </>
      ),
    };
  });
}

function interestRows(groups: SkillGroup[]): LineUpRow[] {
  return groups.map((group) => ({ key: group.key, cells: [skillGroupLabel(group)], note: <p className="dn-lineup">{group.skills.join(", ")}</p> }));
}

function certificationRows(certifications: Certification[]): LineUpRow[] {
  return certifications.map((cert) => {
    const line = certificationLine(cert);
    const name = line.credentialUrl ? (
      <a href={line.credentialUrl} className="dn-link">
        {line.name}
      </a>
    ) : (
      line.name
    );
    return { key: String(cert.id), cells: [name, line.issuer, line.date].filter(Boolean) };
  });
}

function sectionRows(section: Section): LineUpRow[] {
  return section.entries.map((entry, index) => ({
    key: `${entry.title}-${index}`,
    cells: [
      entry.url ? (
        <a href={entry.url} className="dn-link">
          {entry.title}
        </a>
      ) : (
        entry.title
      ),
    ],
    note: entry.detail,
  }));
}

export function DatingNewPage({ portfolio }: ThemePageProps) {
  useReveal();
  const fonts = <link rel="stylesheet" href={FONTS_HREF} precedence="default" />;

  if (!portfolio) {
    return (
      <div className="dn-page">
        {fonts}
        <TopBar />
        <main className="dn-wrap grid min-h-[70svh] place-content-center gap-4 text-center">
          <h1 className="dn-heading">No profile yet</h1>
          <p>This engineer hasn't filled in their profile. Check back after their next deploy.</p>
        </main>
      </div>
    );
  }

  const { profile, experiences, projects, skillGroups, education, certifications, sections } = portfolio;
  const ownerFirstName = firstName(profile.fullName);

  return (
    <div id="top" className="dn-page">
      {fonts}
      <ProfilePoster profile={profile} currentCompany={currentCompany(experiences)} />
      <main>
        <OrderedSections
          order={portfolio.sectionOrder}
          sections={{
            about: profile.bio && (
              <div className="mt-[var(--dn-margin)] bg-dn-wine text-dn-paper">
                <section aria-labelledby="about-title" className="dn-wrap grid gap-6 py-[clamp(72px,9vw,140px)] md:grid-cols-12">
                  <h2 id="about-title" data-reveal="" className="dn-heading md:col-span-4">
                    About me
                  </h2>
                  <p data-reveal="" style={{ "--i": 1 } as React.CSSProperties} className="dn-lineup max-w-[46ch] md:col-span-8 md:col-start-5">
                    {profile.bio}
                  </p>
                </section>
              </div>
            ),
            education: education.length > 0 && (
              <LineUp id="verified-title" title="Verified" lede="Not a catfish. These schools checked." rows={educationRows(education)} isField />
            ),
            skills: skillGroups.length > 0 && (
              <LineUp id="interests-title" title="Interests" lede="Things I will bring up on a first date whether you ask or not." rows={interestRows(skillGroups)} isTwoColumn />
            ),
            experience: experiences.length > 0 && (
              <LineUp id="exes-title" title="Exes" lede="We're still on good terms. Their services are still running." rows={experienceRows(experiences)} />
            ),
            projects: groupProjects(projects).map((group) => (
              <ProjectPlates
                key={group.type}
                id={projectGroupId(group.type)}
                title={DECKS[group.type].title}
                lede={DECKS[group.type].lede}
                projects={group.projects}
                afterId={CONTACT_ID}
                email={profile.email}
                ownerFirstName={ownerFirstName}
              />
            )),
            certifications: certifications.length > 0 && (
              <LineUp id="certified-title" title="Certified" lede="Exams passed, paperwork attached. Ask to see the originals." rows={certificationRows(certifications)} isField />
            ),
            extras: customSections(sections).map((section) => (
              <LineUp
                key={section.key}
                id={`section-${section.key}`}
                title={section.title}
                lede={SECTION_LEDES[section.key] ?? "More things worth knowing before a first date."}
                rows={sectionRows(section)}
              />
            )),
          }}
        />
        <MatchCard profile={profile} links={portfolio.links} id={CONTACT_ID} />
      </main>
      <QuietFooter fullName={profile.fullName} links={portfolio.links} />
    </div>
  );
}
