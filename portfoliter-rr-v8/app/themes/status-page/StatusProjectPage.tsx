import type { ReactNode } from "react";
import { Link } from "react-router";

import { Markdown, markdownBase } from "~/components/Markdown";
import { environment, serviceStatus } from "~/components/status-page/ServiceList";
import { StatusCard } from "~/components/status-page/StatusCard";
import { StatusPill } from "~/components/status-page/StatusPill";
import { formatMonth } from "~/lib/format";
import { educationLabel, experienceLabel, projectGroupHref } from "~/lib/projects";
import type { ThemeProjectPageProps } from "../types";
import { FONTS_HREF, SERVICE_GROUPS } from "./StatusPage";

const markdownClass = `${markdownBase} max-w-[65ch] leading-relaxed [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:font-semibold [&_li]:marker:text-st-muted [&_code]:rounded [&_code]:bg-st-bg [&_code]:px-1 [&_pre]:rounded-lg [&_pre]:bg-st-bg [&_a]:text-st-info`;

function TopBar({ ownerName, backHref, backLabel }: { ownerName: string | null; backHref: string; backLabel: string }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center justify-between gap-4 pt-8">
      {ownerName ? (
        <Link to="/" className="text-lg font-semibold">
          {ownerName}
        </Link>
      ) : (
        <span />
      )}
      <Link to={backHref} className="rounded-lg border border-st-line bg-st-card px-4 py-2 text-sm font-medium no-underline hover:border-st-muted">
        {backLabel}
      </Link>
    </nav>
  );
}

function Update({ label, when, children }: { label: string; when?: string; children: ReactNode }) {
  return (
    <li>
      <p className="text-sm">
        <span className="font-semibold">{label}</span>
        {when && <span className="text-st-muted">, {when}</span>}
      </p>
      <div className="mt-0.5">{children}</div>
    </li>
  );
}

// A project as its own status entry: the banner, its components, and an incident-style update log.
export function StatusProjectPage({ portfolio, project }: ThemeProjectPageProps) {
  const fonts = <link rel="stylesheet" href={FONTS_HREF} precedence="default" />;
  const ownerName = portfolio?.profile.fullName ?? null;

  if (!project) {
    return (
      <div className="mx-auto max-w-[860px] px-5 pb-16">
        {fonts}
        <TopBar ownerName={ownerName} backHref="/" backLabel="All services" />
        <main className="mt-10 rounded-xl border border-st-line bg-st-card px-6 py-8">
          <StatusPill tone="muted" label="404" />
          <h1 className="mt-3 text-2xl font-semibold">Service not found</h1>
          <p className="mt-2 max-w-[56ch] text-st-muted">
            No service is registered under this address. It may not exist, or it is not published yet. Every live service is on the status page.
          </p>
        </main>
      </div>
    );
  }

  const status = serviceStatus(project);
  const isUp = status.tone === "up";
  const env = environment(project, project.experience, project.education);
  const group = SERVICE_GROUPS[project.projectType];

  return (
    <div className="mx-auto max-w-[860px] px-5 pb-16">
      {fonts}
      <TopBar ownerName={ownerName} backHref={projectGroupHref(project.projectType)} backLabel={`All ${group.title.toLowerCase()}`} />

      <header className={`mt-10 flex items-start gap-4 rounded-xl px-6 py-5 ${isUp ? "bg-st-up text-white" : "border border-st-line bg-st-card"}`}>
        <span
          aria-hidden="true"
          className={`mt-1 grid size-8 flex-none place-items-center rounded-full text-lg font-bold ${isUp ? "bg-white/25" : "bg-st-bg text-st-muted"}`}
        >
          {isUp ? "✓" : "–"}
        </span>
        <div className="min-w-0">
          <p className={`text-sm font-medium ${isUp ? "text-white/85" : "text-st-muted"}`}>{status.label}</p>
          <h1 className="text-2xl font-semibold break-words sm:text-3xl">{project.title}</h1>
          <p className={isUp ? "text-white/85" : "text-st-muted"}>
            {env}
            {project.startDate ? `. Running since ${formatMonth(project.startDate)}` : ""}
            {project.endDate ? `, until ${formatMonth(project.endDate)}` : ""}.
          </p>
        </div>
      </header>

      <main>
        <StatusCard id="about-title" title="About this service">
          <div className="grid gap-4 px-5 py-5">
            {project.summary && <p className="text-lg font-medium">{project.summary}</p>}
            {project.coverUrl && (
              <img src={project.coverUrl} alt={`Cover image of ${project.title}`} className="w-full rounded-lg border border-st-line" />
            )}
            {(project.demoUrl || project.repoUrl) && (
              <p className="flex flex-wrap gap-4 text-sm font-medium">
                {project.demoUrl && (
                  <a href={project.demoUrl} className="text-st-info">
                    Open {project.title}
                  </a>
                )}
                {project.repoUrl && (
                  <a href={project.repoUrl} className="text-st-info">
                    Source code
                  </a>
                )}
              </p>
            )}
          </div>
        </StatusCard>

        {project.skills.length > 0 && (
          <StatusCard id="components-title" title="Components">
            <ul className="divide-y divide-st-line">
              {project.skills.map((skill) => (
                <li key={skill} className="flex items-center justify-between gap-4 px-5 py-3">
                  <span className="font-medium">{skill}</span>
                  <span className="flex items-center gap-2 text-sm text-st-up">
                    <span aria-hidden="true" className="size-2 rounded-full bg-st-up" />
                    Operational
                  </span>
                </li>
              ))}
            </ul>
          </StatusCard>
        )}

        <StatusCard id="updates-title" title="Updates" aside="Newest first">
          <ol className="mx-5 my-5 grid gap-5 border-l-2 border-st-line pl-4">
            {project.endDate && (
              <Update label={status.label} when={formatMonth(project.endDate)}>
                <p>{project.projectType === "UNIVERSITY" ? "Submitted and graded." : "Service retired. No further updates expected."}</p>
              </Update>
            )}
            <Update label="Details">
              {project.content ? (
                <Markdown className={markdownClass}>{project.content}</Markdown>
              ) : (
                <p className="text-st-muted">No details posted yet.</p>
              )}
            </Update>
            {project.startDate && (
              <Update label="Launched" when={formatMonth(project.startDate)}>
                <p>First deployed.</p>
              </Update>
            )}
          </ol>
        </StatusCard>

        {(project.experience || project.education) && (
          <StatusCard id="hosting-title" title={project.experience ? "Hosted at" : "Part of"}>
            <div className="px-5 py-5">
              {project.experience && (
                <>
                  <p className="font-semibold">{experienceLabel(project.experience)}</p>
                  {project.experience.description && <p className="mt-1 max-w-[65ch] text-st-muted">{project.experience.description}</p>}
                </>
              )}
              {project.education && (
                <>
                  <p className="font-semibold">{educationLabel(project.education)}</p>
                  {project.education.description && <p className="mt-1 text-st-muted">{project.education.description}</p>}
                </>
              )}
            </div>
          </StatusCard>
        )}
      </main>
    </div>
  );
}
