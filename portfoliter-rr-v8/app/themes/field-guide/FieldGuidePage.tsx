import { BandingRecords } from "~/components/field-guide/BandingRecords";
import { Diet } from "~/components/field-guide/Diet";
import { GuideSection } from "~/components/field-guide/GuideSection";
import { MigrationRecord } from "~/components/field-guide/MigrationRecord";
import { ReportSighting } from "~/components/field-guide/ReportSighting";
import { SpecimenGrid } from "~/components/field-guide/SpecimenGrid";
import { SpecimenPlate } from "~/components/field-guide/SpecimenPlate";
import { Sightings } from "~/components/field-guide/Sightings";
import { companyById, currentCompany } from "~/lib/experience";
import { getAwards } from "~/lib/sections";
import { groupSkills } from "~/lib/skills";
import type { ThemePageProps } from "../types";

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400..700;1,6..72,400..600&family=Work+Sans:wght@400;500;600&display=swap";

function GuideBar() {
  return (
    <div className="flex flex-wrap justify-between gap-4 border-b-[1.5px] border-fg-pine pt-4 pb-3 font-fg-serif">
      <span>
        A field guide to the <em>backend engineers</em> of Bangkok
      </span>
      <span>Plate 1 of 1</span>
    </div>
  );
}

export function FieldGuidePage({ portfolio }: ThemePageProps) {
  const fonts = <link rel="stylesheet" href={FONTS_HREF} precedence="default" />;

  if (!portfolio) {
    return (
      <div className="mx-auto max-w-[1120px] px-5 pb-16">
        {fonts}
        <GuideBar />
        <main className="grid place-content-center py-24 text-center">
          <h1 className="font-fg-serif text-5xl font-semibold">No specimen recorded yet</h1>
          <p className="mt-3 font-fg-serif text-lg">This page fills in once the profile is published.</p>
        </main>
      </div>
    );
  }

  const { profile, experiences, projects, skills, education, certifications, sections } = portfolio;
  const awards = getAwards(sections);

  return (
    <div className="mx-auto max-w-[1120px] px-5 pb-16">
      {fonts}
      <GuideBar />
      <SpecimenPlate profile={profile} currentCompany={currentCompany(experiences)} />

      <main>
        {projects.length > 0 && (
          <GuideSection
            id="specimens-title"
            title="Specimens collected"
            intro="Every project this engineer has built, pinned and labelled. Domesticated specimens were raised at a company; wild ones were found in the evenings."
          >
            <SpecimenGrid projects={projects} companyById={companyById(experiences)} />
          </GuideSection>
        )}
        {experiences.length > 0 && (
          <GuideSection id="migration-title" title="Migration record" intro="Where this engineer has been seen feeding, most recent first.">
            <MigrationRecord experiences={experiences} />
          </GuideSection>
        )}
        {skills.length > 0 && (
          <GuideSection id="diet-title" title="Diet" intro="Feeds mostly on statically typed languages. Will eat YAML when nothing else is available.">
            <Diet groups={groupSkills(skills)} />
          </GuideSection>
        )}
        {education.length + certifications.length > 0 && (
          <GuideSection id="banding-title" title="Banding records" intro="Official tags fitted by recognised institutions. The engineer did not resist.">
            <BandingRecords education={education} certifications={certifications} />
          </GuideSection>
        )}
        {awards && awards.awards.length > 0 && (
          <GuideSection id="sightings-title" title="Notable sightings" intro={`${awards.title} reported by reliable observers, and one by the engineer.`}>
            <Sightings awards={awards.awards} />
          </GuideSection>
        )}
      </main>

      <ReportSighting profile={profile} links={portfolio.links} />
    </div>
  );
}
