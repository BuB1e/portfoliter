import type { ReactNode } from "react";

import { ProjectGroups } from "~/components/ProjectGroups";
import { Avatar } from "~/components/shared/Avatar";
import { SectionEntries } from "~/components/shared/SectionEntries";
import { certificationLine, customSections, educationLine, experienceLine } from "~/lib/fields";
import { platformName } from "~/lib/format";
import { skillGroupLabel } from "~/lib/labels";
import type { ThemePageProps } from "../types";

// The template's default design and the reference for the shared field layer: every published field,
// in a single column, with no decoration. Copy this page to start a design of your own.

const muted = "text-gray-600 dark:text-gray-400";
const linkClass = "underline underline-offset-2";

function Block({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="space-y-3">
      <h2 id={id} className="text-xl font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function PlainPage({ portfolio }: ThemePageProps) {
  if (!portfolio) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-2xl font-semibold">No portfolio published yet</h1>
        <p className={`mt-2 ${muted}`}>Create a profile through the MCP and this page fills in.</p>
      </main>
    );
  }

  const { profile, links, experiences, projects, skillGroups, education, certifications, sections } = portfolio;
  return (
    <main className="mx-auto max-w-3xl space-y-12 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <Avatar
          url={profile.avatarUrl}
          name={profile.fullName}
          className="size-24 flex-none rounded-full object-cover"
          fallbackClassName="grid size-24 flex-none place-items-center rounded-full bg-gray-200 text-2xl font-semibold dark:bg-gray-800"
        />
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">{profile.fullName}</h1>
          {profile.headline && <p className="text-lg">{profile.headline}</p>}
          {profile.location && <p className={muted}>{profile.location}</p>}
          <ul className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-sm">
            {profile.email && (
              <li>
                <a href={`mailto:${profile.email}`} className={linkClass}>
                  {profile.email}
                </a>
              </li>
            )}
            {links.map((link) => (
              <li key={link.url}>
                <a href={link.url} className={linkClass}>
                  {platformName(link.platform)}
                </a>
              </li>
            ))}
            {profile.resumeUrl && (
              <li>
                <a href={profile.resumeUrl} className={linkClass}>
                  Resume (PDF)
                </a>
              </li>
            )}
          </ul>
        </div>
      </header>

      {profile.bio && (
        <Block id="about-title" title="About">
          <p className="leading-relaxed">{profile.bio}</p>
        </Block>
      )}

      <ProjectGroups projects={projects} />

      {experiences.length > 0 && (
        <Block id="experience-title" title="Experience">
          <ol className="space-y-5">
            {experiences.map((experience) => {
              const line = experienceLine(experience);
              return (
                <li key={experience.id}>
                  <h3 className="font-semibold">{line.title}</h3>
                  <p className={`text-sm ${muted}`}>{line.meta}</p>
                  {line.description && <p className="mt-1">{line.description}</p>}
                  {line.skills.length > 0 && <p className={`mt-1 text-sm ${muted}`}>{line.skills.join(", ")}</p>}
                </li>
              );
            })}
          </ol>
        </Block>
      )}

      {skillGroups.length > 0 && (
        <Block id="skills-title" title="Skills">
          <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[max-content_1fr]">
            {skillGroups.map((group) => (
              <div key={group.key} className="contents">
                <dt className="font-semibold">{skillGroupLabel(group)}</dt>
                <dd>{group.skills.join(", ")}</dd>
              </div>
            ))}
          </dl>
        </Block>
      )}

      {education.length > 0 && (
        <Block id="education-title" title="Education">
          <ul className="space-y-4">
            {education.map((entry) => {
              const line = educationLine(entry);
              return (
                <li key={entry.id}>
                  <h3 className="font-semibold">{line.title}</h3>
                  <p className={`text-sm ${muted}`}>{line.qualification ? line.meta : line.dates}</p>
                  {line.description && <p className="mt-1">{line.description}</p>}
                </li>
              );
            })}
          </ul>
        </Block>
      )}

      {certifications.length > 0 && (
        <Block id="certifications-title" title="Certifications">
          <ul className="space-y-3">
            {certifications.map((cert) => {
              const line = certificationLine(cert);
              return (
                <li key={cert.id}>
                  <h3 className="font-semibold">
                    {line.credentialUrl ? (
                      <a href={line.credentialUrl} className={linkClass}>
                        {line.name}
                      </a>
                    ) : (
                      line.name
                    )}
                  </h3>
                  <p className={`text-sm ${muted}`}>{line.meta}</p>
                </li>
              );
            })}
          </ul>
        </Block>
      )}

      {customSections(sections).map((section) => (
        <Block key={section.key} id={`section-${section.key}`} title={section.title}>
          <SectionEntries
            entries={section.entries}
            classNames={{ list: "space-y-2", title: "font-semibold", detail: muted, link: linkClass }}
          />
        </Block>
      ))}
    </main>
  );
}
