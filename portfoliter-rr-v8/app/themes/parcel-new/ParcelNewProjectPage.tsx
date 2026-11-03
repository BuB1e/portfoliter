import { Link } from "react-router";

import { Markdown, markdownBase } from "~/components/Markdown";
import { BoxPhotos } from "~/components/parcel-new/BoxPhotos";
import { DrawnCover, FEATURED_LABEL, PackedWall } from "~/components/parcel-new/PackedWall";
import { ReturnToSender } from "~/components/parcel-new/ReturnToSender";
import { Stripe } from "~/components/parcel-new/ShippingLabel";
import { useReveal } from "~/hooks/useReveal";
import { linkedLine } from "~/lib/fields";
import { projectDates, projectGroupHref } from "~/lib/projects";
import type { ThemeProjectPageProps } from "../types";
import { FONTS_HREF, PACKING_LISTS } from "./ParcelNewPage";

const markdownClass = `${markdownBase} pn-prose max-w-[68ch]`;

const MAX_NEIGHBOURS = 3;
const SHORT_TITLE_CHARS = 16;

function Fact({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="pn-small text-pn-ink-soft">{name}</dt>
      <dd className="font-semibold">{children}</dd>
    </div>
  );
}

// One project as its own parcel: a label with what it is and where it came from, a photo of the contents,
// then the packing slip (the project's write-up) on a long scalloped sheet.
export function ParcelNewProjectPage({ portfolio, project }: ThemeProjectPageProps) {
  useReveal();
  const fonts = <link rel="stylesheet" href={FONTS_HREF} precedence="default" />;

  if (!project) {
    return (
      <div className="pn-page">
        {fonts}
        <Stripe />
        <main className="pn-wrap grid min-h-[70svh] place-content-center justify-items-center gap-6 text-center">
          <h1 className="pn-display">Return to sender</h1>
          <p className="pn-lead max-w-[36ch]">No package with this label. It does not exist or has not shipped yet.</p>
          <Link to="/" className="pn-button">
            Back to the packing lists
          </Link>
        </main>
      </div>
    );
  }

  const list = PACKING_LISTS[project.projectType];
  const linked = linkedLine(project);
  const dates = projectDates(project);
  const photos = project.coverUrl ? [{ src: project.coverUrl, alt: `Cover of ${project.title}` }] : [];
  const neighbours = (portfolio?.projects ?? [])
    .filter((other) => other.projectType === project.projectType && other.id !== project.id)
    .slice(0, MAX_NEIGHBOURS);
  // The one solid action: the live demo, else the source, else a note to the sender about this project.
  const email = portfolio?.profile.email;
  const primary = project.demoUrl
    ? { href: project.demoUrl, label: "Open the live demo" }
    : project.repoUrl
      ? { href: project.repoUrl, label: "Read the source" }
      : email
        ? { href: `mailto:${email}?subject=${encodeURIComponent(`About ${project.title}`)}`, label: "Ask about this project" }
        : null;

  return (
    <div className="pn-page">
      {fonts}
      <header className="pn-wrap grid gap-3 pt-[var(--pn-margin)] lg:min-h-[min(92svh,900px)] lg:grid-cols-[7fr_5fr]">
        <BoxPhotos
          photos={photos}
          className="h-[36svh] sm:h-[44svh] lg:order-2 lg:h-auto"
          fallback={
            <span aria-hidden="true" data-active="">
              <DrawnCover slug={project.slug} />
            </span>
          }
        />
        <div className="relative z-[1] -mt-6 flex min-w-0 flex-col bg-pn-paper lg:order-1 lg:mt-0">
          <Stripe />
          <div className="flex flex-1 flex-col gap-10 p-6 sm:p-10">
            <div data-reveal="" className="flex-1">
              {/* A short title is set as large as the owner's name on the home label; a long one at heading size, so
                  it never runs past two lines. */}
              <h1 className={project.title.length <= SHORT_TITLE_CHARS ? "pn-display" : "pn-heading"}>{project.title}</h1>
              <p className="pn-lead mt-6 max-w-[44ch]">{project.summary}</p>
            </div>
            <div data-reveal="" style={{ "--i": 1 } as React.CSSProperties} className="flex flex-wrap items-center gap-x-6 gap-y-4">
              {primary && (
                <a href={primary.href} className="pn-button">
                  {primary.label}
                </a>
              )}
              {project.demoUrl && project.repoUrl && (
                <a href={project.repoUrl} className="pn-link">
                  Read the source
                </a>
              )}
              <Link to={projectGroupHref(project.projectType)} className="pn-link">
                Back to {list.title.toLowerCase()}
              </Link>
            </div>
            <dl data-reveal="" style={{ "--i": 2 } as React.CSSProperties} className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              <Fact name="Packing list">{list.title}</Fact>
              {project.isFeatured && (
                <Fact name="Service">
                  <span className="text-pn-tape">{FEATURED_LABEL}</span>
                </Fact>
              )}
              {linked && <Fact name={linked.kind === "experience" ? "Packed during" : "Packed while studying"}>{linked.label}</Fact>}
              {dates && <Fact name="Shipped">{dates}</Fact>}
              {project.skills.length > 0 && <Fact name="Contents">{project.skills.join(", ")}</Fact>}
            </dl>
          </div>
        </div>
      </header>

      <main>
        {project.content && (
          <section className="pn-section pn-wrap">
            <article data-reveal="" className="pn-scallop-y mx-auto max-w-[920px] bg-pn-paper px-6 py-16 sm:px-16 sm:py-20">
              <h2 data-reveal="" style={{ "--i": 1 } as React.CSSProperties} className="pn-heading">
                Packing slip
              </h2>
              <div data-reveal="" style={{ "--i": 2 } as React.CSSProperties}>
                <Markdown className={`${markdownClass} mt-8`}>{project.content}</Markdown>
              </div>
            </article>
          </section>
        )}
        {neighbours.length > 0 && <PackedWall id="more-title" title="Also in this box" note={list.note} projects={neighbours} />}
      </main>

      {portfolio && <ReturnToSender profile={portfolio.profile} links={portfolio.links} />}
    </div>
  );
}
