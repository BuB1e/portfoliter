import type { BoxPhoto } from "~/components/parcel-new/BoxPhotos";
import { Contents } from "~/components/parcel-new/Contents";
import { Customs } from "~/components/parcel-new/Customs";
import { NoteSheet } from "~/components/parcel-new/NoteSheet";
import { Origin } from "~/components/parcel-new/Origin";
import { PackedWall } from "~/components/parcel-new/PackedWall";
import { PackingNote } from "~/components/parcel-new/PackingNote";
import { ReturnToSender } from "~/components/parcel-new/ReturnToSender";
import { type NavItem, ShippingLabel, Stripe } from "~/components/parcel-new/ShippingLabel";
import { TrackingHistory } from "~/components/parcel-new/TrackingHistory";
import { OrderedSections } from "~/components/shared/OrderedSections";
import { useReveal } from "~/hooks/useReveal";
import { customSections } from "~/lib/fields";
import { initials } from "~/lib/format";
import type { PortfolioView, ProjectType } from "~/lib/portfolio";
import { groupProjects, projectGroupId } from "~/lib/projects";
import { inSectionOrder } from "~/lib/sectionOrder";
import type { ThemePageProps } from "../types";

export const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&family=Big+Shoulders+Stencil+Display:wght@700;900&display=swap";

export const PACKING_LISTS: Record<ProjectType, { title: string; note: string }> = {
  WORK: { title: "Packed at work", note: "Built on the job. Someone paid for these, so they shipped with tracking." },
  PERSONAL: { title: "Packed at home", note: "Side projects, boxed after dinner. Nobody paid; they shipped anyway." },
  UNIVERSITY: { title: "Packed on campus", note: "Coursework and the senior project. Graded, not paid." },
};

const IDS = {
  about: "note-title",
  education: "origin-title",
  skills: "contents-title",
  experience: "tracking-title",
  certifications: "customs-title",
};

const MAX_BOX_PHOTOS = 4;

// GitHub handle (or initials) plus the latest job's start year, e.g. JANEDOE-2023. Built from data rather
// than today's date so server and client render the same text.
export function trackingNumber({ profile, links, experiences }: PortfolioView): string {
  const github = links.find((link) => link.platform.toLowerCase() === "github");
  const handle = github?.url.split("/").filter(Boolean).at(-1) ?? initials(profile.fullName);
  const year = experiences[0]?.startDate.slice(0, 4);
  return [handle.toUpperCase(), year].filter(Boolean).join("-");
}

// The sender's photo, then the covers of featured projects: what the box holds.
function boxPhotos({ profile, projects }: PortfolioView): BoxPhoto[] {
  const covers = projects
    .filter((project) => project.isFeatured && project.coverUrl)
    .map((project) => ({ src: project.coverUrl as string, alt: `Cover of ${project.title}` }));
  const sender = profile.avatarUrl ? [{ src: profile.avatarUrl, alt: `Photo of ${profile.fullName}` }] : [];
  return [...sender, ...covers].slice(0, MAX_BOX_PHOTOS);
}

function labelNav(portfolio: PortfolioView): NavItem[] {
  const groups = groupProjects(portfolio.projects);
  return inSectionOrder<NavItem>(portfolio.sectionOrder, {
    about: [{ id: IDS.about, label: "Note" }],
    education: portfolio.education.length > 0 ? [{ id: IDS.education, label: "Origin" }] : [],
    skills: portfolio.skillGroups.length > 0 ? [{ id: IDS.skills, label: "Contents" }] : [],
    experience: portfolio.experiences.length > 0 ? [{ id: IDS.experience, label: "Tracking" }] : [],
    projects: groups.length > 0 ? [{ id: projectGroupId(groups[0].type), label: "Packing lists" }] : [],
    certifications: portfolio.certifications.length > 0 ? [{ id: IDS.certifications, label: "Customs" }] : [],
  });
}

export function ParcelNewPage({ portfolio }: ThemePageProps) {
  useReveal();
  const fonts = <link rel="stylesheet" href={FONTS_HREF} precedence="default" />;

  if (!portfolio) {
    return (
      <div className="pn-page">
        {fonts}
        <Stripe />
        <main className="pn-wrap grid min-h-[70svh] place-content-center gap-6 text-center">
          <h1 className="pn-display">Not shipped yet</h1>
          <p className="pn-lead">This box fills up once the profile is published.</p>
        </main>
      </div>
    );
  }

  const { profile, experiences, projects, skillGroups, education, certifications, sections } = portfolio;
  const groups = groupProjects(projects);

  return (
    <div className="pn-page">
      {fonts}
      <ShippingLabel
        profile={profile}
        links={portfolio.links}
        trackingNumber={trackingNumber(portfolio)}
        nav={labelNav(portfolio)}
        insideHref={groups.length > 0 ? `#${projectGroupId(groups[0].type)}` : null}
        photos={boxPhotos(portfolio)}
      />
      <main>
        <OrderedSections
          order={portfolio.sectionOrder}
          sections={{
            about: <PackingNote profile={profile} id={IDS.about} />,
            education: education.length > 0 && <Origin education={education} id={IDS.education} />,
            skills: skillGroups.length > 0 && <Contents groups={skillGroups} id={IDS.skills} />,
            experience: experiences.length > 0 && <TrackingHistory experiences={experiences} id={IDS.experience} />,
            projects: groups.map((group) => (
              <PackedWall
                key={group.type}
                id={projectGroupId(group.type)}
                title={PACKING_LISTS[group.type].title}
                note={PACKING_LISTS[group.type].note}
                projects={group.projects}
              />
            )),
            certifications: certifications.length > 0 && <Customs certifications={certifications} id={IDS.certifications} />,
            extras: customSections(sections).map((section) => <NoteSheet key={section.key} section={section} />),
          }}
        />
      </main>
      <ReturnToSender profile={profile} links={portfolio.links} />
    </div>
  );
}
