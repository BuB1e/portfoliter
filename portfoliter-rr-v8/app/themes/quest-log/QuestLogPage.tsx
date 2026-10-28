import { CharacterSheet, QuestMenu } from "~/components/quest-log/CharacterSheet";
import { Entries, KeyItems, QuestLog, Stats, Training } from "~/components/quest-log/Ledger";
import { QuestBoard } from "~/components/quest-log/QuestBoard";
import { QuestWindow } from "~/components/quest-log/QuestWindow";
import { customSections } from "~/lib/fields";
import { firstName, platformName } from "~/lib/format";
import type { ProjectType } from "~/lib/portfolio";
import { groupProjects, projectGroupId } from "~/lib/projects";
import type { ThemePageProps } from "../types";

export const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400..700&family=Alegreya:ital,wght@0,400..800;1,400..800&family=Noto+Sans+Thai:wght@400..700&family=Noto+Serif+Thai:wght@400..700&display=swap";

export const QUEST_TYPES: Record<ProjectType, { title: string; note: string }> = {
  WORK: { title: "Main quests", note: "Taken on for an employer." },
  PERSONAL: { title: "Side quests", note: "Taken on for fun, off the clock." },
  UNIVERSITY: { title: "Academy quests", note: "Set by the university." },
};

export function QuestLogPage({ portfolio }: ThemePageProps) {
  const fonts = <link rel="stylesheet" href={FONTS_HREF} precedence="default" />;

  if (!portfolio) {
    return (
      <main className="mx-auto max-w-xl px-4 py-24">
        {fonts}
        <div className="ql-window px-6 py-8 text-center">
          <h1 className="text-4xl font-bold text-ql-gold">New game</h1>
          <p className="mt-3 text-lg">The adventure starts once the profile is published.</p>
        </div>
      </main>
    );
  }

  const { profile, links, experiences, projects, skillGroups, education, certifications, sections } = portfolio;
  const groups = groupProjects(projects);
  const extras = customSections(sections);
  const quests = [...projects, ...experiences];
  const cleared = quests.filter((quest) => quest.endDate).length;

  const menu = [
    ...groups.map((group) => ({ href: `#${projectGroupId(group.type)}`, label: QUEST_TYPES[group.type].title })),
    ...(experiences.length > 0 ? [{ href: "#log-title", label: "Quest log" }] : []),
    ...(skillGroups.length > 0 ? [{ href: "#stats-title", label: "Stats" }] : []),
    ...(education.length > 0 ? [{ href: "#training-title", label: "Training" }] : []),
    ...(certifications.length > 0 ? [{ href: "#items-title", label: "Key items" }] : []),
    ...extras.map((section) => ({ href: `#extra-${section.key}`, label: section.title })),
    { href: "#party-title", label: "Party invite" },
  ];

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-8 sm:px-6 sm:py-12">
      {fonts}
      <div className="grid items-start gap-8 lg:grid-cols-[1fr_15rem]">
        <CharacterSheet profile={profile} cleared={cleared} total={quests.length} />
        <div className="lg:sticky lg:top-6 lg:row-span-2">
          <QuestMenu entries={menu} />
        </div>

        <main className="grid min-w-0 gap-8">
          {groups.map((group) => (
            <QuestWindow key={group.type} id={projectGroupId(group.type)} title={QUEST_TYPES[group.type].title} note={QUEST_TYPES[group.type].note}>
              <QuestBoard projects={group.projects} />
            </QuestWindow>
          ))}
          {experiences.length > 0 && (
            <QuestWindow id="log-title" title="Quest log" note="Every job, newest first.">
              <QuestLog experiences={experiences} />
            </QuestWindow>
          )}
          {skillGroups.length > 0 && (
            <QuestWindow id="stats-title" title="Stats" note="Skills per category.">
              <Stats groups={skillGroups} />
            </QuestWindow>
          )}
          {education.length > 0 && (
            <QuestWindow id="training-title" title="Training">
              <Training education={education} />
            </QuestWindow>
          )}
          {certifications.length > 0 && (
            <QuestWindow id="items-title" title="Key items">
              <KeyItems certifications={certifications} />
            </QuestWindow>
          )}
          {extras.map((section) => (
            <QuestWindow key={section.key} id={`extra-${section.key}`} title={section.title}>
              <Entries entries={section.entries} />
            </QuestWindow>
          ))}

          <footer>
            <QuestWindow id="party-title" title="Party invite" note="Recruiting? Send word.">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[1.1rem]">
                {profile.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className="border-[3px] border-ql-frame bg-ql-gold px-4 py-2 font-bold text-ql-edge no-underline shadow-[0_0_0_3px_var(--color-ql-edge)] hover:bg-white"
                  >
                    Invite {firstName(profile.fullName)} to your party
                  </a>
                )}
                {profile.email && <span className="text-ql-soft break-all">{profile.email}</span>}
                {links.map((link) => (
                  <a key={link.url} href={link.url}>
                    {platformName(link.platform)}
                  </a>
                ))}
                {profile.resumeUrl && <a href={profile.resumeUrl}>Character sheet (resume PDF)</a>}
              </div>
            </QuestWindow>
          </footer>
        </main>
      </div>
    </div>
  );
}
