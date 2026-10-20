import { BragList } from "~/components/dating/BragList";
import { ExList } from "~/components/dating/ExList";
import { FeedSection } from "~/components/dating/FeedSection";
import { InterestList } from "~/components/dating/InterestList";
import { ProfileCard } from "~/components/dating/ProfileCard";
import { ProjectDeck } from "~/components/dating/ProjectDeck";
import { PromptList } from "~/components/dating/PromptList";
import { VerifiedList } from "~/components/dating/VerifiedList";
import { companyById, currentCompany } from "~/lib/experience";
import { firstName } from "~/lib/format";
import { getAwards, getPrompts } from "~/lib/sections";
import type { ThemePageProps } from "../types";

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,300..800&display=swap";

function TopBar() {
  return (
    <header className="mx-auto flex max-w-[1120px] items-center justify-between gap-4 px-4 py-5">
      <span className="text-[1.6rem] font-extrabold tracking-tighter">
        portfoli<span className="text-flame">ter</span>
      </span>
      <p className="hidden text-[0.95rem] opacity-80 sm:block">Swipe right on me</p>
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

  const { profile, experiences, projects, skills, education, certifications, sections } = portfolio;
  const prompts = getPrompts(sections);
  const awards = getAwards(sections);
  const ownerFirstName = firstName(profile.fullName);

  return (
    <>
      {fonts}
      <TopBar />
      <div className="mx-auto grid max-w-[1120px] items-start gap-10 px-4 pt-4 pb-20 md:grid-cols-[minmax(300px,400px)_1fr]">
        <ProfileCard profile={profile} links={portfolio.links} currentCompany={currentCompany(experiences)} />

        <main>
          {(profile.bio || prompts.length > 0) && (
            <FeedSection id="about-title" title="About me" lede={profile.bio}>
              <PromptList prompts={prompts} />
            </FeedSection>
          )}
          {projects.length > 0 && (
            <FeedSection id="projects-title" title="Swipe through my projects" lede="Right if you like it, left if you don't. I won't see the left ones. Probably.">
              <ProjectDeck projects={projects} companyById={companyById(experiences)} ownerFirstName={ownerFirstName} email={profile.email} />
            </FeedSection>
          )}
          {experiences.length > 0 && (
            <FeedSection id="exes-title" title="Experiences" lede="We're still on good terms. Their services are still running.">
              <ExList experiences={experiences} />
            </FeedSection>
          )}
          {skills.length > 0 && (
            <FeedSection id="interests-title" title="Interests" lede="Things I will bring up on a first date whether you ask or not.">
              <InterestList skills={skills} />
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
        </main>
      </div>
    </>
  );
}
