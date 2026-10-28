import { Coupons, ExtraLines, InTheBag, MemberCards } from "~/components/receipt/Extras";
import { Purchases } from "~/components/receipt/Purchases";
import { Barcode, Dept, Line, Paper, Rule } from "~/components/receipt/ReceiptParts";
import { ShelfItems } from "~/components/receipt/ShelfItems";
import { StoreHeader } from "~/components/receipt/StoreHeader";
import { careerStartYear } from "~/lib/experience";
import { initials, platformName } from "~/lib/format";
import type { PortfolioView, ProjectType } from "~/lib/portfolio";
import { customSections } from "~/lib/fields";
import { groupProjects, projectGroupId } from "~/lib/projects";
import type { ThemePageProps } from "../types";

export const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Martian+Mono:wdth,wght@75..112.5,400..800&family=Noto+Sans+Thai+Looped:wght@400;700&display=swap";

// The shop's departments: where each kind of project was made.
export const DEPARTMENTS: Record<ProjectType, { title: string; note: string }> = {
  WORK: { title: "Made at work", note: "Built on the job and shipped to real users." },
  PERSONAL: { title: "Homemade", note: "Side projects, made after hours." },
  UNIVERSITY: { title: "School supplies", note: "Coursework and the senior project." },
};

// GitHub handle (or initials) and the first job's year, e.g. JANEDOE-2025. Built from data, not today's
// date, so the server and the browser print the same number.
export function receiptNumber({ profile, links, experiences }: PortfolioView): string {
  const github = links.find((link) => link.platform.toLowerCase() === "github");
  const handle = github?.url.split("/").filter(Boolean).at(-1) ?? initials(profile.fullName);
  return [handle.toUpperCase(), careerStartYear(experiences)].filter(Boolean).join("-");
}

export function ThankYou() {
  return (
    <div className="mt-8 text-center">
      <p className="text-[1.25em] font-extrabold font-stretch-[112.5%]">THANK YOU, COME AGAIN</p>
      <p className="mt-1 text-rc-faded">Please keep this receipt for your records.</p>
    </div>
  );
}

export function ReceiptPage({ portfolio }: ThemePageProps) {
  const fonts = <link rel="stylesheet" href={FONTS_HREF} precedence="default" />;

  if (!portfolio) {
    return (
      <div className="px-3 py-16">
        {fonts}
        <Paper>
          <main className="text-center">
            <h1 className="text-2xl font-extrabold font-stretch-[112.5%]">Shop not open yet</h1>
            <p className="mt-3">This receipt prints once the profile is published.</p>
          </main>
        </Paper>
      </div>
    );
  }

  const { profile, links, experiences, projects, skills, skillGroups, education, certifications, sections } = portfolio;
  const groups = groupProjects(projects);
  const extras = customSections(sections);

  return (
    <div className="px-3 py-10 sm:py-16">
      {fonts}
      <Paper>
        <StoreHeader profile={profile} links={links} sinceYear={careerStartYear(experiences)} />
        <Rule kind="double" />

        <main>
          {profile.bio && (
            <Dept id="note-title" title="Note from the cashier">
              <p>{profile.bio}</p>
            </Dept>
          )}
          {experiences.length > 0 && (
            <Dept id="purchases-title" title="Purchases" note="Every job so far, priced in months.">
              <Purchases experiences={experiences} />
            </Dept>
          )}
          {groups.map((group) => (
            <Dept key={group.type} id={projectGroupId(group.type)} title={DEPARTMENTS[group.type].title} note={DEPARTMENTS[group.type].note}>
              <ShelfItems projects={group.projects} />
            </Dept>
          ))}
          {skillGroups.length > 0 && (
            <Dept id="bag-title" title="In the bag">
              <InTheBag groups={skillGroups} />
            </Dept>
          )}
          {education.length > 0 && (
            <Dept id="member-title" title="Member card">
              <MemberCards education={education} />
            </Dept>
          )}
          {certifications.length > 0 && (
            <Dept id="coupons-title" title="Coupons applied">
              <Coupons certifications={certifications} />
            </Dept>
          )}
          {extras.map((section) => (
            <Dept key={section.key} id={`extra-${section.key}`} title={section.title}>
              <ExtraLines entries={section.entries} />
            </Dept>
          ))}
        </main>

        <Rule kind="double" />
        <footer>
          <div className="grid gap-0.5">
            <Line label="Projects" amount={projects.length} />
            <Line label="Jobs" amount={experiences.length} />
            <Line label="Skills" amount={skills.length} />
          </div>
          <p className="mt-4 text-[1.2em]">
            <Line label="TOTAL" amount="1 engineer" isStrong />
          </p>
          <Rule kind="dashed" />
          <h2 className="font-bold">Pay at the counter</h2>
          <div className="mt-2 grid gap-0.5">
            {profile.email && <Line label="Email" amount={<a href={`mailto:${profile.email}`}>Email {profile.fullName}</a>} />}
            {links.map((link) => (
              <Line key={link.url} label={platformName(link.platform)} amount={<a href={link.url}>{platformName(link.platform)} profile</a>} />
            ))}
            {profile.resumeUrl && <Line label="Resume" amount={<a href={profile.resumeUrl}>Resume (PDF)</a>} />}
          </div>
          <Barcode code={receiptNumber(portfolio)} />
          <ThankYou />
        </footer>
      </Paper>
    </div>
  );
}
