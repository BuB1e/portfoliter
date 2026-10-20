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
import { companyById } from "~/lib/experience";
import { initials } from "~/lib/format";
import type { Portfolio } from "~/lib/portfolio";
import { getAwards } from "~/lib/sections";
import { groupSkills } from "~/lib/skills";
import type { ThemePageProps } from "../types";

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&family=Big+Shoulders+Stencil+Display:wght@700;900&display=swap";

// GitHub handle (or initials) plus the latest job's start year, e.g. BUB1E-2023-TH.
// Built from data rather than today's date so server and client render the same text.
function trackingNumber({ profile, links, experiences }: Portfolio): string {
  const github = links.find((link) => link.platform.toLowerCase() === "github");
  const handle = github?.url.split("/").filter(Boolean).at(-1) ?? initials(profile.fullName);
  const year = experiences[0]?.startDate.slice(0, 4);
  return [handle.toUpperCase(), year, "TH"].filter(Boolean).join("-");
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

  const { profile, experiences, projects, skills, education, certifications, sections } = portfolio;
  const awards = getAwards(sections);

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
        {projects.length > 0 && (
          <ParcelSection id="packing-title" title="Packing list" note="Everything in this box, sorted by whether someone paid for it.">
            <PackingList projects={projects} companyById={companyById(experiences)} />
          </ParcelSection>
        )}
        {experiences.length > 0 && (
          <ParcelSection id="history-title" title="Tracking history" note="Where this package has been. No dents reported.">
            <TrackingHistory experiences={experiences} />
          </ParcelSection>
        )}
        {skills.length > 0 && (
          <ParcelSection id="skills-title" title="Contents may include" note="Checked at the warehouse. Batteries not included.">
            <ContentsChecklist groups={groupSkills(skills)} />
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
      </main>
      <ReturnToSender profile={profile} links={portfolio.links} />
    </>
  );
}
