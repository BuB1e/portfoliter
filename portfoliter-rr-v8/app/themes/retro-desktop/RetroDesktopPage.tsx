import { FileTiles } from "~/components/retro-desktop/FileTiles";
import { AppIcon, DesktopIcon, DocIcon, FolderIcon } from "~/components/retro-desktop/Icons";
import { CareerLog, Certificates, Diplomas, ExtraList, InstalledSkills, Pane } from "~/components/retro-desktop/Panes";
import { Taskbar } from "~/components/retro-desktop/Taskbar";
import { Window } from "~/components/retro-desktop/Window";
import { Avatar } from "~/components/shared/Avatar";
import { customSections } from "~/lib/fields";
import { initials, platformName } from "~/lib/format";
import type { ProjectType } from "~/lib/portfolio";
import { groupProjects, projectGroupId } from "~/lib/projects";
import type { ThemePageProps } from "../types";

export const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:ital,wght@0,400..700;1,400&family=DotGothic16&family=Noto+Sans+Thai:wght@400..700&display=swap";

// Folder names for the three project groups.
export const FOLDERS: Record<ProjectType, string> = {
  WORK: "Work projects",
  PERSONAL: "Personal projects",
  UNIVERSITY: "University projects",
};

export function RetroDesktopPage({ portfolio }: ThemePageProps) {
  const fonts = <link rel="stylesheet" href={FONTS_HREF} precedence="default" />;

  if (!portfolio) {
    return (
      <main className="mx-auto grid min-h-screen max-w-md place-content-center px-4">
        {fonts}
        <div className="rd-raised p-6 text-center">
          <h1 className="font-rd-pixel text-2xl">Starting up</h1>
          <p className="mt-2">This desktop fills in once the profile is published.</p>
        </div>
      </main>
    );
  }

  const { profile, links, experiences, projects, skills, skillGroups, education, certifications, sections } = portfolio;
  const groups = groupProjects(projects);
  const extras = customSections(sections);

  const windows = [
    { href: "#about-title", label: "About" },
    ...groups.map((group) => ({ href: `#${projectGroupId(group.type)}`, label: FOLDERS[group.type] })),
    ...(experiences.length > 0 ? [{ href: "#career-title", label: "career.log" }] : []),
    ...(skills.length > 0 ? [{ href: "#skills-title", label: "Installed skills" }] : []),
    ...(education.length > 0 ? [{ href: "#diplomas-title", label: "Diplomas" }] : []),
    ...(certifications.length > 0 ? [{ href: "#certificates-title", label: "Certificates" }] : []),
    ...extras.map((section) => ({ href: `#extra-${section.key}`, label: section.title })),
  ];

  return (
    <div id="top" className="pb-20">
      {fonts}
      <div className="mx-auto grid max-w-[1200px] gap-6 px-3 pt-5 sm:px-6 sm:pt-8 lg:grid-cols-[6.5rem_1fr]">
        <nav aria-label="Desktop shortcuts" className="flex flex-wrap content-start gap-2 lg:flex-col lg:flex-nowrap">
          {groups.map((group) => (
            <DesktopIcon key={group.type} href={`#${projectGroupId(group.type)}`} icon={<FolderIcon />} label={FOLDERS[group.type]} />
          ))}
          {profile.email && <DesktopIcon href={`mailto:${profile.email}`} icon={<AppIcon letter="@" />} label="Email me" />}
          {links.map((link) => (
            <DesktopIcon key={link.url} href={link.url} icon={<AppIcon letter={platformName(link.platform).charAt(0)} />} label={platformName(link.platform)} />
          ))}
          {profile.resumeUrl && <DesktopIcon href={profile.resumeUrl} icon={<DocIcon />} label="resume.pdf" />}
        </nav>

        <main className="grid min-w-0 content-start gap-6">
          <Window id="about-title" title={`About ${profile.fullName}`} icon={<AppIcon letter={initials(profile.fullName).charAt(0)} size="small" />}>
            <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
              <div className="rd-sunken size-32 bg-white p-[3px]">
                <Avatar
                  url={profile.avatarUrl}
                  name={profile.fullName}
                  className="size-full object-cover"
                  fallbackClassName="grid size-full place-items-center bg-rd-title font-rd-pixel text-4xl text-white"
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-[clamp(1.8rem,5vw,2.8rem)] leading-[1.05] font-bold break-words">{profile.fullName}</h1>
                <p className="mt-2 max-w-[52ch] text-[1.1rem] leading-snug">{profile.headline}</p>
                {(profile.location || profile.email) && (
                  <p className="mt-1 text-rd-muted break-words">{[profile.location, profile.email].filter(Boolean).join(". ")}</p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  {profile.email && (
                    <a href={`mailto:${profile.email}`} className="rd-button px-3 py-1.5 font-bold">
                      Send email
                    </a>
                  )}
                  {links.map((link) => (
                    <a key={link.url} href={link.url} className="rd-button px-3 py-1.5">
                      {platformName(link.platform)}
                    </a>
                  ))}
                  {profile.resumeUrl && (
                    <a href={profile.resumeUrl} className="rd-button px-3 py-1.5">
                      Resume (PDF)
                    </a>
                  )}
                </div>
              </div>
            </div>
            {profile.bio && (
              <Pane className="mt-4">
                <p className="max-w-[68ch] text-[1.05rem] leading-relaxed">{profile.bio}</p>
              </Pane>
            )}
          </Window>

          {groups.map((group) => (
            <Window
              key={group.type}
              id={projectGroupId(group.type)}
              title={FOLDERS[group.type]}
              icon={<FolderIcon size="small" />}
              status={[`${group.projects.length} object(s)`, `Projects/${FOLDERS[group.type].split(" ")[0]}`]}
            >
              <FileTiles projects={group.projects} />
            </Window>
          ))}
          {experiences.length > 0 && (
            <Window id="career-title" title="career.log" icon={<DocIcon size="small" />} status={[`${experiences.length} entries`]}>
              <CareerLog experiences={experiences} />
            </Window>
          )}
          {skills.length > 0 && (
            <Window id="skills-title" title="Installed skills" icon={<AppIcon letter="S" size="small" />} status={[`${skills.length} skills installed`]}>
              <InstalledSkills groups={skillGroups} />
            </Window>
          )}
          {education.length > 0 && (
            <Window id="diplomas-title" title="Diplomas" icon={<FolderIcon size="small" />}>
              <Diplomas education={education} />
            </Window>
          )}
          {certifications.length > 0 && (
            <Window id="certificates-title" title="Certificates" icon={<FolderIcon size="small" />}>
              <Certificates certifications={certifications} />
            </Window>
          )}
          {extras.map((section) => (
            <Window key={section.key} id={`extra-${section.key}`} title={section.title} icon={<FolderIcon size="small" />}>
              <ExtraList entries={section.entries} />
            </Window>
          ))}
        </main>
      </div>
      <Taskbar fullName={profile.fullName} location={profile.location} windows={windows} />
    </div>
  );
}
