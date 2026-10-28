import { Link } from "react-router";

import { BragList } from "~/components/dating/BragList";
import { ExList } from "~/components/dating/ExList";
import { FeedSection } from "~/components/dating/FeedSection";
import { InterestList } from "~/components/dating/InterestList";
import { ProfileCard } from "~/components/dating/ProfileCard";
import { ProjectDeck } from "~/components/dating/ProjectDeck";
import { PromptList } from "~/components/dating/PromptList";
import { VerifiedList } from "~/components/dating/VerifiedList";
import { SectionEntries } from "~/components/shared/SectionEntries";
import { currentCompany } from "~/lib/experience";
import { customSections } from "~/lib/fields";
import { firstName } from "~/lib/format";
import type { ProjectType } from "~/lib/portfolio";
import { groupProjects, projectGroupId } from "~/lib/projects";
import { FEATURED_SECTION_KEYS, getAwards, getPrompts } from "~/lib/sections";
import type { ThemePageProps } from "../types";

export const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,300..800&display=swap";

// One swipe deck per kind of relationship.
export const DECKS: Record<ProjectType, { title: string; lede: string; back: string }> = {
  WORK: {
    title: "Serious relationships",
    lede: "Projects I committed to at work. We went to production together.",
    back: "Back to my serious relationships",
  },
  PERSONAL: {
    title: "Weekend flings",
    lede: "Side projects. Right if you like it, left if you don't. I won't see the left ones. Probably.",
    back: "Back to my weekend flings",
  },
  UNIVERSITY: {
    title: "College sweethearts",
    lede: "Where it all started: coursework and the senior project.",
    back: "Back to my college sweethearts",
  },
};

export function TopBar({ tagline = "Swipe right on me" }: { tagline?: string }) {
  return (
    <header className="mx-auto flex max-w-[1120px] items-center justify-between gap-4 px-4 py-5">
      <Link to="/" aria-label="portfoliter home" className="text-[1.6rem] font-extrabold tracking-tighter no-underline">
        portfoli<span className="text-flame">ter</span>
      </Link>
      <p className="hidden text-[0.95rem] opacity-80 sm:block">{tagline}</p>
    </header>
  );
}

export function DatingPage({ portfolio }: ThemePageProps) {
  // React 19 hoists this into <head>, so each design only loads its own fonts.
  const fonts = <link rel="stylesheet" href={FONTS_HREF} precedence="default" />;

  if (!portfolio) {
    return (
      <>
        {fonts}
        <TopBar />
        <main className="mx-auto grid max-w-[1120px] place-content-center px-4 py-24 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight">No profile yet</h1>
          <p className="mt-3 opacity-80">This engineer hasn't filled in their profile. Check back after their next deploy.</p>
        </main>
      </>
    );
  }

  const { profile, experiences, projects, skillGroups, education, certifications, sections } = portfolio;
  const prompts = getPrompts(sections);
  const awards = getAwards(sections);
  const extras = customSections(sections, FEATURED_SECTION_KEYS);
  const ownerFirstName = firstName(profile.fullName);

  return (
    <>
      {fonts}
      <TopBar />
      <div className="mx-auto grid max-w-[1120px] items-start gap-10 px-4 pt-4 pb-20 md:grid-cols-[minmax(300px,400px)_1fr]">
        <ProfileCard profile={profile} links={portfolio.links} currentCompany={currentCompany(experiences)} />

        <main>
          {(profile.bio || prompts) && (
            <FeedSection id="about-title" title="About me" lede={profile.bio}>
              {prompts && (
                <>
                  <h3 className="mb-3 text-xl font-bold tracking-tight">{prompts.title}</h3>
                  <PromptList prompts={prompts.prompts} />
                </>
              )}
            </FeedSection>
          )}
          {groupProjects(projects).map((group) => (
            <FeedSection key={group.type} id={projectGroupId(group.type)} title={DECKS[group.type].title} lede={DECKS[group.type].lede}>
              <ProjectDeck projects={group.projects} ownerFirstName={ownerFirstName} email={profile.email} />
            </FeedSection>
          ))}
          {experiences.length > 0 && (
            <FeedSection id="exes-title" title="Experiences" lede="We're still on good terms. Their services are still running.">
              <ExList experiences={experiences} />
            </FeedSection>
          )}
          {skillGroups.length > 0 && (
            <FeedSection id="interests-title" title="Interests" lede="Things I will bring up on a first date whether you ask or not.">
              <InterestList groups={skillGroups} />
            </FeedSection>
          )}
          {education.length + certifications.length > 0 && (
            <FeedSection id="verified-title" title="Verified" lede="Not a catfish. These people checked.">
              <VerifiedList education={education} certifications={certifications} />
            </FeedSection>
          )}
          {awards && awards.awards.length > 0 && (
            <FeedSection id="brag-title" title="Humble brags" lede={`${awards.title}, listed modestly.`}>
              <BragList awards={awards.awards} />
            </FeedSection>
          )}
          {extras.map((section) => (
            <FeedSection key={section.key} id={`section-${section.key}`} title={section.title} lede="More things worth knowing before a first date.">
              <SectionEntries
                entries={section.entries}
                classNames={{
                  list: "grid gap-3",
                  item: "rounded-[18px] bg-night-raised px-5 py-4",
                  title: "block text-lg font-bold",
                  detail: "block text-sm opacity-75",
                  link: "text-mint",
                }}
              />
            </FeedSection>
          ))}
        </main>
      </div>
    </>
  );
}
