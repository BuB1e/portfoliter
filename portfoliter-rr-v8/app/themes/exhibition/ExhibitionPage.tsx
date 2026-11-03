import { Link } from "react-router";

import { Catalogue, type CatalogueEntry } from "~/components/exhibition/Catalogue";
import { FloorPlan } from "~/components/exhibition/FloorPlan";
import { Room } from "~/components/exhibition/Room";
import { useExhibitWalk } from "~/components/exhibition/walk";
import { OrderedSections } from "~/components/shared/OrderedSections";
import { useReveal } from "~/hooks/useReveal";
import { careerStartYear } from "~/lib/experience";
import { certificationLine, customSections, educationLine, experienceLine } from "~/lib/fields";
import { firstName, initials, platformName } from "~/lib/format";
import { skillGroupLabel } from "~/lib/labels";
import type { Link as ProfileLink, Profile, ProjectType } from "~/lib/portfolio";
import { groupProjects, projectGroupId } from "~/lib/projects";
import type { ThemePageProps } from "../types";

export const FONTS_HREF = "https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..700&display=swap";

export const ROOMS: Record<ProjectType, { name: string; note: string }> = {
  WORK: { name: "Commissions", note: "Work made for employers and clients, hung in the order it was finished." },
  PERSONAL: { name: "Studio work", note: "Made on evenings and weekends, for no one but the maker." },
  UNIVERSITY: { name: "Early works", note: "Coursework and the senior project, from the years of training." },
};

const GUESTBOOK_ID = "guestbook-title";

export function Wordmark() {
  return (
    <Link to="/" className="ex-small font-semibold tracking-wide no-underline">
      portfoliter
    </Link>
  );
}

// The show's title split into lines, one masked line per word group, so each rises on its own.
export function MaskedTitle({ text, className }: { text: string; className: string }) {
  const words = text.split(" ");
  const lines = words.length > 1 ? [words[0], words.slice(1).join(" ")] : words;
  return (
    <h1 className={className}>
      {lines.map((line, index) => (
        <span key={line} className="ex-mask">
          <span style={{ "--line": index } as React.CSSProperties}>{line}</span>
        </span>
      ))}
    </h1>
  );
}

function GuestBook({ profile, links }: { profile: Profile; links: ProfileLink[] }) {
  return (
    <section aria-labelledby={GUESTBOOK_ID} className="ex-section bg-ex-wall py-[clamp(96px,12vw,180px)]">
      <div className="ex-wrap grid gap-10 md:grid-cols-12 md:items-end">
        <div data-reveal="" className="md:col-span-7">
          <h2 id={GUESTBOOK_ID} className="ex-display">
            Guest book
          </h2>
          <p className="ex-lead mt-6 max-w-[36ch]">Leave a note for {firstName(profile.fullName)}: a role, a question, a reaction to the show.</p>
          {profile.email && (
            <a href={`mailto:${profile.email}?subject=${encodeURIComponent("From your guest book")}`} className="ex-button mt-10">
              Sign the guest book
            </a>
          )}
        </div>
        <ul data-reveal="" style={{ "--i": 1 } as React.CSSProperties} className="flex flex-col gap-3 md:col-span-4 md:col-start-9">
          {profile.email && (
            <li>
              <a href={`mailto:${profile.email}`} className="ex-link">
                {profile.email}
              </a>
            </li>
          )}
          {links.map((link) => (
            <li key={link.url}>
              <a href={link.url} className="ex-link">
                {platformName(link.platform)}
              </a>
            </li>
          ))}
          {profile.resumeUrl && (
            <li>
              <a href={profile.resumeUrl} className="ex-link">
                Résumé (PDF)
              </a>
            </li>
          )}
          {profile.location && <li className="text-ex-dim">{profile.location}</li>}
        </ul>
      </div>
    </section>
  );
}

export function ExhibitionPage({ portfolio }: ThemePageProps) {
  useReveal();
  useExhibitWalk();
  const fonts = <link rel="stylesheet" href={FONTS_HREF} precedence="default" />;

  if (!portfolio) {
    return (
      <div className="ex-page">
        {fonts}
        <main className="ex-wrap grid min-h-[80svh] place-content-center gap-6 text-center">
          <h1 className="ex-display">Opening soon</h1>
          <p className="ex-lead text-ex-dim">The works go up once the profile is published.</p>
        </main>
      </div>
    );
  }

  const { profile, experiences, projects, skillGroups, education, certifications, sections } = portfolio;
  const groups = groupProjects(projects);
  const firstRoom = groups[0] ? projectGroupId(groups[0].type) : null;
  const since = careerStartYear(experiences);

  const educationEntries: CatalogueEntry[] = education.map((school) => {
    const line = educationLine(school);
    return {
      key: String(school.id),
      title: line.institution,
      side: line.dates,
      detail: [line.qualification, line.description].filter(Boolean).join(". ") || null,
    };
  });
  const mediaEntries: CatalogueEntry[] = skillGroups.map((group) => ({ key: group.key, title: skillGroupLabel(group), detail: group.skills.join(", ") }));
  const residencyEntries: CatalogueEntry[] = experiences.map((job) => {
    const line = experienceLine(job);
    const facts = [line.company, line.employmentType, line.location].filter(Boolean).join(", ");
    return {
      key: String(job.id),
      title: line.role,
      side: line.dates,
      detail: (
        <>
          <p className="text-ex-dim">{facts}</p>
          {line.description && <p className="mt-2">{line.description}</p>}
          {line.skills.length > 0 && <p className="ex-small mt-2 text-ex-dim">Media: {line.skills.join(", ")}</p>}
        </>
      ),
    };
  });
  const certificateEntries: CatalogueEntry[] = certifications.map((cert) => {
    const line = certificationLine(cert);
    return {
      key: String(cert.id),
      title: line.credentialUrl ? (
        <a href={line.credentialUrl} className="ex-link">
          {line.name}
        </a>
      ) : (
        line.name
      ),
      side: line.date,
      detail: line.issuer,
    };
  });

  return (
    <div id="top" className="ex-page">
      {fonts}
      <header className="grid lg:min-h-[100svh] lg:grid-cols-2">
        <div className="flex flex-col justify-between gap-16 p-[var(--ex-margin)]">
          <Wordmark />
          <div>
            <MaskedTitle text={profile.fullName} className="ex-display" />
            <p data-reveal="" className="ex-lead mt-8 max-w-[34ch] text-ex-dim">
              {profile.headline}
            </p>
            {since && (
              <p data-reveal="" style={{ "--i": 1 } as React.CSSProperties} className="mt-3">
                Selected works, {since} to now
              </p>
            )}
            {firstRoom && (
              <a data-reveal="" style={{ "--i": 2 } as React.CSSProperties} href={`#${firstRoom}`} className="ex-button mt-10">
                Enter the show
              </a>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-10 bg-ex-wall p-[var(--ex-margin)] lg:justify-center">
          <a href={`#${GUESTBOOK_ID}`} className="ex-link ex-small self-end">
            Guest book
          </a>
          {groups.length > 0 && (
            <div className="flex flex-1 items-center justify-center">
              <FloorPlan rooms={groups.map((group) => ({ id: projectGroupId(group.type), name: ROOMS[group.type].name, works: group.projects.length }))} />
            </div>
          )}
        </div>
      </header>

      <main>
        <OrderedSections
          order={portfolio.sectionOrder}
          sections={{
            // Always shown: the artist's portrait opens the show, with the statement when there is one.
            about: (
              <section aria-labelledby="artist-title" className="ex-section ex-wrap grid gap-10 md:grid-cols-12">
                <h2 id="artist-title" data-reveal="" className="ex-heading md:col-span-4">
                  The artist
                </h2>
                <div data-reveal="" style={{ "--i": 1 } as React.CSSProperties} className="md:col-span-8">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt={`Photo of ${profile.fullName}`} className="float-left mr-6 mb-2 aspect-[3/4] w-[clamp(120px,14vw,200px)] object-cover" />
                  ) : (
                    <span role="img" aria-label={`Initials of ${profile.fullName}`} className="ex-heading float-left mr-6 mb-2 grid aspect-[3/4] w-[clamp(120px,14vw,200px)] place-items-center bg-ex-wall">
                      {initials(profile.fullName)}
                    </span>
                  )}
                  <p className="ex-lead max-w-[46ch]">{profile.bio || profile.headline}</p>
                </div>
              </section>
            ),
            education: education.length > 0 && <Catalogue id="training-title" title="Training" entries={educationEntries} />,
            skills: skillGroups.length > 0 && <Catalogue id="media-title" title="Media" entries={mediaEntries} />,
            experience: experiences.length > 0 && <Catalogue id="residencies-title" title="Residencies" entries={residencyEntries} />,
            projects: groups.map((group) => (
              <Room key={group.type} id={projectGroupId(group.type)} name={ROOMS[group.type].name} note={ROOMS[group.type].note} projects={group.projects} />
            )),
            certifications: certifications.length > 0 && <Catalogue id="certificates-title" title="Certificates" entries={certificateEntries} />,
            extras: customSections(sections).map((section) => (
              <Catalogue
                key={section.key}
                id={`section-${section.key}`}
                title={section.title}
                entries={section.entries.map((entry, index) => ({
                  key: `${entry.title}-${index}`,
                  title: entry.url ? (
                    <a href={entry.url} className="ex-link">
                      {entry.title}
                    </a>
                  ) : (
                    entry.title
                  ),
                  detail: entry.detail,
                }))}
              />
            )),
          }}
        />
        <GuestBook profile={profile} links={portfolio.links} />
      </main>
      <footer className="ex-wrap ex-small grid gap-2 py-10 text-ex-dim md:grid-cols-[1fr_auto_1fr]">
        <p>{profile.fullName}: selected works</p>
        <a href="#top" className="ex-link">
          Back to the entrance
        </a>
        <p className="md:text-right">Hung with portfoliter</p>
      </footer>
    </div>
  );
}
