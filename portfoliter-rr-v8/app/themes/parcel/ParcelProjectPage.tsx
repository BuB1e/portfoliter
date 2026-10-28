import type { ReactNode } from "react";
import { Link } from "react-router";

import { Markdown, markdownBase } from "~/components/Markdown";
import { ContentsTags } from "~/components/parcel/ContentsTags";
import { boxPattern, FEATURED_LABEL, parcelOrigin } from "~/components/parcel/PackingList";
import { Tape } from "~/components/parcel/Tape";
import { linkedLine } from "~/lib/fields";
import type { ProjectType } from "~/lib/portfolio";
import { projectDates, projectGroupHref } from "~/lib/projects";
import type { ThemeProjectPageProps } from "../types";
import { FONTS_HREF, PACKING_GROUPS } from "./ParcelPage";

// "Priority" is reserved for featured projects (FEATURED_LABEL), so the work stamp says "Insured".
const STAMPS: Record<ProjectType, { word: string; note: string }> = {
  WORK: { word: "Insured", note: "shipped to production" },
  PERSONAL: { word: "Handmade", note: "packed after dinner" },
  UNIVERSITY: { word: "Graded", note: "inspected by a professor" },
};

// markdownBase also pads lists and items ([&_ul]:pl-6, [&_li]:pl-1); with equal specificity the CSS order decides,
// and pl-1 could win over parcel-check's padding, putting the ticked box over each item's first letters. The `!`
// forms make the slip's own spacing win.
const markdownClass = `${markdownBase} max-w-[68ch] text-[1.05rem] leading-relaxed [&_h2]:font-parcel-stencil [&_h2]:text-3xl [&_h2]:font-black [&_h3]:font-bold [&_li]:parcel-check [&_li]:pl-[1.8rem]! [&_li]:list-none [&_ol]:pl-0! [&_ul]:pl-0! [&_code]:bg-parcel-box/50 [&_code]:px-1 [&_pre]:bg-parcel-box/40 [&_a]:font-bold [&_a]:decoration-parcel-tape [&_a]:decoration-2`;

function Field({ name, children, isLeft = false }: { name: string; children: ReactNode; isLeft?: boolean }) {
  return (
    <div className={`border-b-2 border-parcel-ink px-5 py-4 sm:px-6 ${isLeft ? "sm:border-r-2" : ""}`}>
      <div className="text-[0.8rem] font-bold font-stretch-75%">{name}</div>
      <div className="text-[1.05rem]">{children}</div>
    </div>
  );
}

// The ink stamp: under the summary on phones, in the title row's reserved right strip from sm up. It used to sit at
// the label's top right, over the "From" field's text.
function Stamp({ stamp }: { stamp: { word: string; note: string } }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none mt-5 inline-block max-w-52 -rotate-3 border-4 border-parcel-tape px-3.5 pt-1.5 pb-2 text-center font-parcel-stencil text-[1.9rem] leading-none font-black text-parcel-tape opacity-90 mix-blend-multiply sm:absolute sm:top-6 sm:right-6 sm:mt-0 sm:rotate-[9deg]"
    >
      {stamp.word}
      <small className="mt-1 block font-parcel-body text-[0.8rem] leading-tight font-bold">{stamp.note}</small>
    </div>
  );
}

function BackTag({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-block -rotate-2 border-2 border-parcel-ink bg-parcel-label px-4 py-2 font-bold no-underline shadow-[3px_3px_0_var(--color-parcel-kraft-dark)] font-stretch-85% hover:bg-parcel-sticker"
    >
      {children}
    </Link>
  );
}

// A project as one big shipping label, its packing slip (the markdown detail) and a photo of the contents.
export function ParcelProjectPage({ portfolio, project }: ThemeProjectPageProps) {
  const fonts = <link rel="stylesheet" href={FONTS_HREF} precedence="default" />;

  if (!project) {
    return (
      <>
        {fonts}
        <Tape />
        <main className="mx-auto grid max-w-[1080px] justify-items-center gap-6 px-4 py-24 text-center">
          <h1 className="font-parcel-stencil text-[clamp(3rem,10vw,5.5rem)] leading-[0.9] font-black">Return to sender</h1>
          <p className="max-w-[44ch] text-lg">No package with this label. It does not exist or has not shipped yet.</p>
          <BackTag to="/">Back to the packing lists</BackTag>
        </main>
      </>
    );
  }

  const stamp = STAMPS[project.projectType];
  const dates = projectDates(project);
  const origin = parcelOrigin(project);
  const linked = linkedLine(project);

  return (
    <>
      {fonts}
      <Tape />
      <main className="mx-auto max-w-[1080px] px-4 pb-20">
        <nav aria-label="Breadcrumb" className="mt-8 flex flex-wrap items-center gap-4">
          <BackTag to={projectGroupHref(project.projectType)}>Back to {PACKING_GROUPS[project.projectType].title.toLowerCase()}</BackTag>
          {portfolio && (
            <Link to="/" className="font-bold font-stretch-85%">
              {portfolio.profile.fullName}
            </Link>
          )}
        </nav>

        <article
          aria-labelledby="parcel-project-title"
          className="relative mt-10 mr-1.5 grid -rotate-[0.4deg] border-[3px] border-parcel-ink bg-parcel-label shadow-[6px_7px_0_var(--color-parcel-kraft-dark)] sm:mr-0 sm:-rotate-[0.8deg] sm:grid-cols-2 sm:shadow-[10px_12px_0_var(--color-parcel-kraft-dark)]"
        >
          <Field name="Ship to" isLeft>
            You, the person reading
          </Field>
          <Field name="From">{origin}</Field>
          {/* The stamp sits in this row's right side from sm up; the row keeps that strip free (pr-60) so a long title
              or summary wraps before it instead of running under it. */}
          <div className="relative border-b-2 border-parcel-ink px-5 pt-6 pb-5 sm:col-span-2 sm:min-h-44 sm:pr-60 sm:pl-6">
            <h1 id="parcel-project-title" className="font-parcel-stencil text-[clamp(2.8rem,9vw,6rem)] leading-[0.88] font-black break-words">
              {project.title}
            </h1>
            {project.summary && <p className="mt-4 max-w-[52ch] text-xl font-stretch-95%">{project.summary}</p>}
            {project.isFeatured && (
              <p className="mt-4 inline-block rotate-[-2deg] bg-parcel-tape px-3 py-2 font-parcel-stencil text-[1.1rem] leading-none font-black text-parcel-label">
                {FEATURED_LABEL}
              </p>
            )}
            <Stamp stamp={stamp} />
          </div>
          <Field name="Packed" isLeft>
            {dates || "Date not stamped"}
          </Field>
          <Field name={linked?.kind === "education" ? "Course" : "Packed by"}>
            {linked ? (
              <>
                {linked.title}
                {linked.dates && <span className="block text-[0.9rem] font-semibold font-stretch-80%">{linked.dates}</span>}
              </>
            ) : (
              (portfolio?.profile.fullName ?? "The owner")
            )}
          </Field>
          {project.skills.length > 0 && (
            <div className="border-b-2 border-parcel-ink px-5 py-4 sm:col-span-2 sm:px-6">
              <div className="mb-2 text-[0.8rem] font-bold font-stretch-75%">Contents</div>
              <ContentsTags label="Contents" items={project.skills} />
            </div>
          )}
          <div className="flex items-center gap-5 px-5 py-5 sm:col-span-2 sm:px-6">
            <div aria-hidden="true" className="parcel-barcode h-14 flex-1" />
            <div className="max-w-[55%] text-right text-lg font-bold break-all font-stretch-70%">PKG-{project.slug.toUpperCase()}</div>
          </div>
        </article>

        <div className="mt-16 grid items-start gap-12 lg:grid-cols-[1fr_340px]">
          <section aria-labelledby="slip-title" className="min-w-0 border-2 border-dashed border-parcel-ink bg-parcel-label/90 px-5 py-6 sm:px-8">
            <h2 id="slip-title" className="font-parcel-stencil text-[clamp(2.2rem,5vw,3rem)] leading-none font-black">
              Packing slip
            </h2>
            <p className="mb-6 font-stretch-90%">What is inside this box, item by item.</p>
            {project.content ? (
              <Markdown className={markdownClass}>{project.content}</Markdown>
            ) : (
              <p>The slip is blank. The short description on the label says it all.</p>
            )}
          </section>

          <aside className="grid gap-8">
            <figure className="relative rotate-2 border-2 border-parcel-kraft-dark bg-parcel-label p-3 shadow-[0_6px_0_var(--color-parcel-kraft-dark)]">
              <span aria-hidden="true" className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-3 bg-[rgb(240_210_160/0.85)]" />
              {project.coverUrl ? (
                <img src={project.coverUrl} alt={`Photo of ${project.title}`} className="block w-full" />
              ) : (
                <div aria-hidden="true" className="parcel-box-tape relative aspect-[4/3]" style={{ background: boxPattern(project) }} />
              )}
              <figcaption className="mt-2 text-center text-sm font-bold font-stretch-80%">
                {project.coverUrl ? "Photo of the contents" : "No photo. The box is still taped shut."}
              </figcaption>
            </figure>
            {(project.repoUrl || project.demoUrl) && (
              <div className="grid gap-3">
                {project.demoUrl && (
                  <a href={project.demoUrl} className="border-2 border-parcel-ink bg-parcel-sticker px-4 py-3 text-center font-bold no-underline">
                    Try {project.title}
                  </a>
                )}
                {project.repoUrl && (
                  <a href={project.repoUrl} className="border-2 border-parcel-ink bg-parcel-label px-4 py-3 text-center font-bold no-underline">
                    Source code of {project.title}
                  </a>
                )}
              </div>
            )}
          </aside>
        </div>
      </main>
    </>
  );
}
