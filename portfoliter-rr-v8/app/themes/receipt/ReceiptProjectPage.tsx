import type { ReactNode } from "react";
import { Link } from "react-router";

import { Markdown, markdownBase } from "~/components/Markdown";
import { Barcode, Dept, Line, Paper, Rule, Tag } from "~/components/receipt/ReceiptParts";
import { ItemPhoto, STAFF_PICK } from "~/components/receipt/ShelfItems";
import { linkedLine } from "~/lib/fields";
import { projectDates, projectGroupHref } from "~/lib/projects";
import type { ThemeProjectPageProps } from "../types";
import { DEPARTMENTS, FONTS_HREF, ThankYou } from "./ReceiptPage";

const markdownClass = `${markdownBase} leading-relaxed [&_h2]:font-bold [&_h2]:font-stretch-[112.5%] [&_h3]:font-bold [&_li]:marker:text-rc-faded [&_code]:bg-rc-ink/10 [&_code]:px-1 [&_pre]:bg-rc-ink/5 [&_blockquote]:border-rc-faded [&_a]:font-bold`;

function TopLinks({ ownerName, back }: { ownerName: string | null; back: { to: string; label: ReactNode } }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <Link to={back.to} className="font-bold">
        {back.label}
      </Link>
      {ownerName && (
        <Link to="/" className="text-rc-faded">
          {ownerName}
        </Link>
      )}
    </nav>
  );
}

// A project as its own itemised receipt: the item, where it was made, what went into it, and the long
// description printed on the back.
export function ReceiptProjectPage({ portfolio, project }: ThemeProjectPageProps) {
  const fonts = <link rel="stylesheet" href={FONTS_HREF} precedence="default" />;
  const ownerName = portfolio?.profile.fullName ?? null;

  if (!project) {
    return (
      <div className="px-3 py-10 sm:py-16">
        {fonts}
        <Paper>
          <TopLinks ownerName={ownerName} back={{ to: "/", label: "Back to the shop" }} />
          <main className="mt-10 text-center">
            <p aria-hidden="true" className="text-[clamp(3rem,16vw,5.5rem)] leading-none font-extrabold text-rc-red font-stretch-[112.5%]">
              VOID
            </p>
            <h1 className="mt-4 text-[1.4em] font-extrabold">Item not found</h1>
            <p className="mx-auto mt-3 max-w-[36ch]">
              This barcode does not scan. The item does not exist or is not on the shelf yet.
            </p>
            <Rule />
            <Link to="/" className="font-bold">
              See everything on the shelf
            </Link>
          </main>
        </Paper>
      </div>
    );
  }

  const department = DEPARTMENTS[project.projectType];
  const dates = projectDates(project);
  const linked = linkedLine(project);

  return (
    <div className="px-3 py-10 sm:py-16">
      {fonts}
      <Paper>
        <TopLinks ownerName={ownerName} back={{ to: projectGroupHref(project.projectType), label: `Back to ${department.title.toLowerCase()}` }} />

        <header className="mt-8 text-center">
          <p className="text-rc-faded">Item receipt</p>
          {project.isFeatured && (
            <p className="mt-2">
              <Tag>{STAFF_PICK}</Tag>
            </p>
          )}
          <h1 className="mt-2 text-[clamp(1.45rem,5.6vw,2.2rem)] leading-[1.15] font-extrabold break-words font-stretch-[112.5%]">
            {project.title}
          </h1>
          {project.summary && <p className="mx-auto mt-3 max-w-[40ch] text-[1.05em]">{project.summary}</p>}
        </header>

        <figure className="mt-6">
          <ItemPhoto project={project} size="large" />
          {!project.coverUrl && <figcaption className="sr-only">No photo of {project.title} on file</figcaption>}
        </figure>

        <Rule kind="double" />
        <main>
          <div className="grid gap-0.5">
            <Line label="Department" amount={department.title} />
            {dates && <Line label="Dates" amount={dates} />}
            {linked && <Line label={linked.kind === "experience" ? "Made at" : "Made for"} amount={linked.title} />}
            {linked?.dates && <Line label={linked.kind === "experience" ? "On shift" : "Enrolled"} amount={linked.dates} />}
            <Line label="SKU" amount={project.slug} />
          </div>
          {project.experience?.description && <p className="mt-3 pl-4 text-rc-faded">{project.experience.description}</p>}
          {project.education?.description && <p className="mt-3 pl-4 text-rc-faded">{project.education.description}</p>}

          <Rule />
          <Dept id="details-title" title="Printed on the back">
            {project.content ? (
              <Markdown className={markdownClass}>{project.content}</Markdown>
            ) : (
              <p className="text-rc-faded">Nothing printed on the back. The item line above is the whole story.</p>
            )}
          </Dept>

          {project.skills.length > 0 && (
            <Dept id="ingredients-title" title="Ingredients">
              <p>{project.skills.join(", ")}</p>
            </Dept>
          )}

          {(project.demoUrl || project.repoUrl) && (
            <Dept id="links-title" title="Take it home">
              <div className="grid gap-0.5">
                {project.demoUrl && <Line label="Try it" amount={<a href={project.demoUrl}>Live demo of {project.title}</a>} />}
                {project.repoUrl && <Line label="Recipe" amount={<a href={project.repoUrl}>Source code of {project.title}</a>} />}
              </div>
            </Dept>
          )}
        </main>

        <Rule kind="double" />
        <footer>
          <p className="text-[1.2em]">
            <Line label="TOTAL" amount="1 item" isStrong />
          </p>
          <Barcode code={project.slug.toUpperCase()} />
          <ThankYou />
        </footer>
      </Paper>
    </div>
  );
}
