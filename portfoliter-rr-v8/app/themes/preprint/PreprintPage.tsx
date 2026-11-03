import { AuthorBio } from "~/components/preprint/AuthorBio";
import { CiteThis } from "~/components/preprint/CiteThis";
import { paperYear } from "~/components/preprint/citation";
import { Figures } from "~/components/preprint/Figures";
import { PaperSection } from "~/components/preprint/PaperSection";
import { OrderedSections } from "~/components/shared/OrderedSections";
import { useReveal } from "~/hooks/useReveal";
import { currentCompany } from "~/lib/experience";
import { certificationLine, customSections, educationLine, experienceLine } from "~/lib/fields";
import { initials, platformName } from "~/lib/format";
import { skillGroupLabel } from "~/lib/labels";
import type { PortfolioView, ProjectType } from "~/lib/portfolio";
import { groupProjects, projectGroupId } from "~/lib/projects";
import type { ThemePageProps } from "../types";

export const FONTS_HREF = "https://fonts.googleapis.com/css2?family=STIX+Two+Text:ital,wght@0,400..700;1,400..700&display=swap";

export const RESULT_GROUPS: Record<ProjectType, string> = {
  WORK: "Results at work",
  PERSONAL: "Independent work",
  UNIVERSITY: "Coursework and thesis",
};

// The identifier printed up the margin of the first page: the GitHub handle (or initials), the paper's
// year and the subject class of software engineering.
export function preprintId(view: PortfolioView): string {
  const github = view.links.find((link) => link.platform.toLowerCase() === "github");
  const handle = github?.url.split("/").filter(Boolean).at(-1) ?? initials(view.profile.fullName);
  return ["Preprint", [handle.toLowerCase(), paperYear(view)].filter(Boolean).join("."), "[cs.SE]"].join(" ");
}

function TitlePage({ view }: { view: PortfolioView }) {
  const { profile } = view;
  const affiliation = [currentCompany(view.experiences), profile.location].filter(Boolean).join(", ");

  return (
    <header className="pp-wrap relative pt-[clamp(72px,10vw,140px)]">
      <p aria-hidden="true" className="pp-identifier pp-small absolute top-[var(--pp-margin)] left-[var(--pp-margin)] hidden lg:block">
        {preprintId(view)}
      </p>
      <div className="mx-auto max-w-[60rem] text-center">
        <h1 className="pp-display">
          <span className="pp-mask">
            <span>{profile.fullName}</span>
          </span>
        </h1>
        <p data-reveal="" className="pp-lead mx-auto mt-8 max-w-[34ch]">
          {profile.headline}
        </p>
        {affiliation && (
          <p data-reveal="" style={{ "--i": 1 } as React.CSSProperties} className="mt-6 italic">
            {affiliation}
          </p>
        )}
        <div data-reveal="" style={{ "--i": 2 } as React.CSSProperties} className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {profile.email && (
            <a href={`mailto:${profile.email}`} className="pp-button">
              Write to the author
            </a>
          )}
          {view.links.length > 0 && (
            <a href={view.links[0].url} className="pp-link">
              Read the source on {platformName(view.links[0].platform)}
            </a>
          )}
        </div>
      </div>
      <div data-reveal="" style={{ "--i": 3 } as React.CSSProperties} className="pp-column mt-16 text-left">
        <h2 className="pp-small font-semibold">Cite this engineer</h2>
        <div className="mt-3">
          <CiteThis view={view} />
        </div>
      </div>
    </header>
  );
}

export function PreprintPage({ portfolio }: ThemePageProps) {
  useReveal();
  const fonts = <link rel="stylesheet" href={FONTS_HREF} precedence="default" />;

  if (!portfolio) {
    return (
      <div className="pp-page">
        {fonts}
        <main className="pp-wrap grid min-h-[80svh] place-content-center gap-6 text-center">
          <h1 className="pp-display">Manuscript in preparation</h1>
          <p className="pp-lead">This paper is typeset once the profile is published.</p>
        </main>
      </div>
    );
  }

  const { profile, experiences, projects, skillGroups, education, certifications, sections } = portfolio;

  return (
    <div className="pp-page">
      {fonts}
      <TitlePage view={portfolio} />
      <main>
        <OrderedSections
          order={portfolio.sectionOrder}
          sections={{
            about: profile.bio && (
              <PaperSection id="abstract-title" title="Abstract">
                <p className="pp-justify">{profile.bio}</p>
              </PaperSection>
            ),
            education: education.length > 0 && (
              <PaperSection id="education-title" title="Education">
                <div className="flex flex-col gap-6">
                  {education.map((school) => {
                    const line = educationLine(school);
                    return (
                      <p key={school.id}>
                        <span className="font-semibold">{line.institution}.</span> {line.qualification && <>{line.qualification}. </>}
                        {line.dates && <>{line.dates}. </>}
                        {line.description && <span className="italic">{line.description}.</span>}
                      </p>
                    );
                  })}
                </div>
              </PaperSection>
            ),
            skills: skillGroups.length > 0 && (
              <PaperSection id="methods-title" title="Methods and tools">
                <div className="flex flex-col gap-4">
                  {skillGroups.map((group) => (
                    <p key={group.key} className="pp-justify">
                      <span className="font-semibold">{skillGroupLabel(group)}.</span> {group.skills.join(", ")}.
                    </p>
                  ))}
                </div>
              </PaperSection>
            ),
            experience: experiences.length > 0 && (
              <PaperSection id="appointments-title" title="Prior appointments">
                <div className="flex flex-col gap-10">
                  {experiences.map((job) => {
                    const line = experienceLine(job);
                    return (
                      <article key={job.id}>
                        <h3 className="pp-lead font-semibold">{line.role}</h3>
                        <p className="mt-1 italic">{[line.company, line.meta].filter(Boolean).join(", ")}</p>
                        {line.description && <p className="pp-justify mt-3">{line.description}</p>}
                        {line.skills.length > 0 && <p className="pp-small mt-3 text-pp-soft">Tools: {line.skills.join(", ")}.</p>}
                      </article>
                    );
                  })}
                </div>
              </PaperSection>
            ),
            projects: groupProjects(projects).map((group) => (
              <PaperSection key={group.type} id={projectGroupId(group.type)} title={RESULT_GROUPS[group.type]} isWide>
                <Figures projects={group.projects} />
              </PaperSection>
            )),
            certifications: certifications.length > 0 && (
              <PaperSection id="certifications-title" title="Certifications">
                <ul className="flex flex-col gap-3">
                  {certifications.map((cert) => {
                    const line = certificationLine(cert);
                    return (
                      <li key={cert.id} className="pl-8 -indent-8">
                        {line.issuer} ({line.date ?? "n.d."}).{" "}
                        {line.credentialUrl ? (
                          <a href={line.credentialUrl} className="pp-link italic">
                            {line.name}
                          </a>
                        ) : (
                          <span className="italic">{line.name}</span>
                        )}
                        .
                      </li>
                    );
                  })}
                </ul>
              </PaperSection>
            ),
            extras: customSections(sections).map((section) => (
              <PaperSection key={section.key} id={`section-${section.key}`} title={`Appendix: ${section.title}`}>
                <ul className="flex flex-col gap-4">
                  {section.entries.map((entry, index) => (
                    <li key={`${entry.title}-${index}`}>
                      <span className="font-semibold">
                        {entry.url ? (
                          <a href={entry.url} className="pp-link">
                            {entry.title}
                          </a>
                        ) : (
                          entry.title
                        )}
                        .
                      </span>{" "}
                      {entry.detail}
                    </li>
                  ))}
                </ul>
              </PaperSection>
            )),
          }}
        />
      </main>
      <AuthorBio profile={profile} links={portfolio.links} />
    </div>
  );
}
