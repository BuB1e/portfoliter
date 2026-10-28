import { BubbleWrap } from "~/components/parcel/BubbleWrap";
import { ContentsChecklist } from "~/components/parcel/ContentsChecklist";
import { CustomsDeclaration } from "~/components/parcel/CustomsDeclaration";
import { PackingList } from "~/components/parcel/PackingList";
import { ParcelSection } from "~/components/parcel/ParcelSection";
import { ReturnToSender } from "~/components/parcel/ReturnToSender";
import { ShippingLabel } from "~/components/parcel/ShippingLabel";
import { Stickers } from "~/components/parcel/Stickers";
import { Tape } from "~/components/parcel/Tape";
import { TrackingHistory } from "~/components/parcel/TrackingHistory";
import { SectionEntries } from "~/components/shared/SectionEntries";
import { customSections } from "~/lib/fields";
import { initials } from "~/lib/format";
import type { PortfolioView, ProjectType } from "~/lib/portfolio";
import { groupProjects, projectGroupId } from "~/lib/projects";
import { AWARDS_KEY, getAwards } from "~/lib/sections";
import type { ThemePageProps } from "../types";

export const PACKING_GROUPS: Record<ProjectType, { title: string; note: string }> = {
  WORK: { title: "Packed at work", note: "Built on the job. Someone paid for these, so they shipped with tracking." },
  PERSONAL: { title: "Packed at home", note: "Side projects, boxed after dinner. Nobody paid; they shipped anyway." },
  UNIVERSITY: { title: "Packed on campus", note: "Coursework and the senior project. Graded, not paid." },
};

export const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&family=Big+Shoulders+Stencil+Display:wght@700;900&display=swap";

// GitHub handle (or initials) plus the latest job's start year, e.g. JANEDOE-2023.
// Built from data rather than today's date so server and client render the same text.
function trackingNumber({ profile, links, experiences }: PortfolioView): string {
  const github = links.find((link) => link.platform.toLowerCase() === "github");
  const handle = github?.url.split("/").filter(Boolean).at(-1) ?? initials(profile.fullName);
  const year = experiences[0]?.startDate.slice(0, 4);
  return [handle.toUpperCase(), year].filter(Boolean).join("-");
}

export function ParcelPage({ portfolio }: ThemePageProps) {
  const fonts = <link rel="stylesheet" href={FONTS_HREF} precedence="default" />;

  if (!portfolio) {
    return (
      <>
        {fonts}
        <Tape />
        <main className="mx-auto grid max-w-[1080px] place-content-center px-4 py-24 text-center">
          <h1 className="font-parcel-stencil text-6xl font-black">Package not shipped yet</h1>
          <p className="mt-3">This page fills in once the profile is published.</p>
        </main>
      </>
    );
  }

  const { profile, experiences, projects, skillGroups, education, certifications, sections } = portfolio;
  const awards = getAwards(sections);
  // Awards are stickers; every other section, prompts included, is a note taped to the box.
  const notes = customSections(sections, [AWARDS_KEY]);

  return (
    <>
      {fonts}
      <Tape />
      <main className="mx-auto max-w-[1080px] px-4">
        <ShippingLabel profile={profile} trackingNumber={trackingNumber(portfolio)} />

        <ParcelSection
          id="wrap-title"
          title="Free bubble wrap"
          note={[profile.bio, "Pop a few while you read. Nobody is watching."].filter(Boolean).join(" ")}
        >
          <BubbleWrap />
        </ParcelSection>
        {groupProjects(projects).map((group) => (
          <ParcelSection key={group.type} id={projectGroupId(group.type)} title={PACKING_GROUPS[group.type].title} note={PACKING_GROUPS[group.type].note}>
            <PackingList projects={group.projects} />
          </ParcelSection>
        ))}
        {experiences.length > 0 && (
          <ParcelSection id="history-title" title="Tracking history" note="Where this package has been. No dents reported.">
            <TrackingHistory experiences={experiences} />
          </ParcelSection>
        )}
        {skillGroups.length > 0 && (
          <ParcelSection id="skills-title" title="Contents may include" note="Checked at the warehouse. Batteries not included.">
            <ContentsChecklist groups={skillGroups} />
          </ParcelSection>
        )}
        {education.length + certifications.length > 0 && (
          <ParcelSection id="customs-title" title="Customs declaration" note="Paperwork, so this engineer clears the border.">
            <CustomsDeclaration education={education} certifications={certifications} />
          </ParcelSection>
        )}
        {awards && awards.awards.length > 0 && (
          <ParcelSection id="stickers-title" title="Stickers on the box" note={`${awards.title}, each one peeled and applied by hand.`}>
            <Stickers awards={awards.awards} />
          </ParcelSection>
        )}
        {notes.map((section) => (
          <ParcelSection key={section.key} id={`section-${section.key}`} title={section.title}>
            <SectionEntries
              entries={section.entries}
              classNames={{
                list: "max-w-[720px] rotate-[0.4deg] border-2 border-dashed border-parcel-ink bg-parcel-label px-6 py-5 shadow-[0_6px_0_var(--color-parcel-kraft-dark)]",
                item: "border-b border-dashed border-parcel-ink/50 py-3 first:pt-0 last:border-b-0 last:pb-0",
                title: "block text-[1.1rem] font-extrabold",
                detail: "block font-stretch-90%",
                link: "decoration-parcel-tape decoration-2",
              }}
            />
          </ParcelSection>
        ))}
      </main>
      <ReturnToSender profile={profile} links={portfolio.links} />
    </>
  );
}
