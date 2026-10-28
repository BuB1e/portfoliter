import type { ReactNode } from "react";
import { Link } from "react-router";

import { Markdown, markdownBase } from "~/components/Markdown";
import { fileOrigin } from "~/components/retro-desktop/FileTiles";
import { DocIcon, FolderIcon } from "~/components/retro-desktop/Icons";
import { Pane } from "~/components/retro-desktop/Panes";
import { CloseGlyph, StatusBar, TitleBar } from "~/components/retro-desktop/Window";
import { Cover } from "~/components/shared/Cover";
import { linkedLine } from "~/lib/fields";
import { projectDates, projectGroupHref, projectPath } from "~/lib/projects";
import type { ThemeProjectPageProps } from "../types";
import { FONTS_HREF, FOLDERS } from "./RetroDesktopPage";

const markdownClass = `${markdownBase} max-w-[70ch] text-[1.05rem] leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h3]:font-bold [&_a]:text-rd-link [&_code]:bg-rd-face/50 [&_code]:px-1 [&_pre]:bg-rd-face/30 [&_blockquote]:border-rd-shadow`;

// A group box with a caption, as on the property sheets of the period.
function GroupBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border border-rd-shadow p-3 pt-2 shadow-[1px_1px_0_#fff,inset_1px_1px_0_#fff]">
      <h2 className="font-rd-pixel text-[0.95rem]">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[5.5rem_1fr] gap-x-2">
      <dt className="text-rd-muted">{label}:</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  );
}

function ToolbarLink({ href, isInternal = false, children }: { href: string; isInternal?: boolean; children: ReactNode }) {
  const className = "rd-button inline-flex items-center gap-1.5 px-3 py-1";
  return isInternal ? (
    <Link to={href} className={className}>
      {children}
    </Link>
  ) : (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

// A project opened in its own window: toolbar, address field, the document on the left, a property
// sheet on the right and a status bar. The close box is a real link back to the folder.
export function RetroDesktopProjectPage({ portfolio, project }: ThemeProjectPageProps) {
  const fonts = <link rel="stylesheet" href={FONTS_HREF} precedence="default" />;

  if (!project) {
    return (
      <main className="mx-auto grid min-h-screen max-w-lg content-center px-4 py-10">
        {fonts}
        <div className="rd-raised p-[3px] pb-3">
          <TitleBar
            close={
              <Link to="/" aria-label="Close and go back to the desktop" className="rd-button ml-0.5 grid h-[18px] w-5 place-items-center">
                <CloseGlyph />
              </Link>
            }
          >
            Error
          </TitleBar>
          <div className="flex gap-4 px-4 pt-5">
            <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-rd-dark bg-[#c0201a] font-bold text-white">
              X
            </span>
            <div>
              <h1 className="text-xl font-bold">File not found</h1>
              <p className="mt-2 leading-relaxed">
                This project does not exist or is not published yet. Check the address, or open one of the folders on
                the desktop.
              </p>
            </div>
          </div>
          <div className="mt-5 flex justify-center">
            <Link to="/" className="rd-button min-w-24 px-4 py-1.5 text-center">
              OK, back to the desktop
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const folder = FOLDERS[project.projectType];
  const dates = projectDates(project);
  const origin = fileOrigin(project);
  const linked = linkedLine(project);
  const linkedDescription = project.experience?.description || project.education?.description;

  return (
    <div className="mx-auto max-w-[1100px] px-3 py-5 sm:px-6 sm:py-8">
      {fonts}
      <div className="rd-raised p-[3px] pb-1">
        <TitleBar
          icon={<DocIcon size="small" />}
          close={
            <Link
              to={projectGroupHref(project.projectType)}
              aria-label={`Close ${project.title} and go back to ${folder}`}
              className="rd-button ml-0.5 grid h-[18px] w-5 place-items-center"
            >
              <CloseGlyph />
            </Link>
          }
        >
          {project.title}
        </TitleBar>

        <nav aria-label="Toolbar" className="flex flex-wrap gap-1.5 border-b border-rd-shadow px-2 py-2 shadow-[0_1px_0_#fff]">
          <ToolbarLink href={projectGroupHref(project.projectType)} isInternal>
            <FolderIcon size="small" />
            Back to {folder}
          </ToolbarLink>
          <ToolbarLink href="/" isInternal>
            Desktop{portfolio ? `: ${portfolio.profile.fullName}` : ""}
          </ToolbarLink>
          {project.demoUrl && <ToolbarLink href={project.demoUrl}>Open live demo</ToolbarLink>}
          {project.repoUrl && <ToolbarLink href={project.repoUrl}>View source code</ToolbarLink>}
        </nav>

        <div className="flex items-center gap-2 px-2 py-2">
          <span className="font-rd-pixel text-[0.9rem]">Address</span>
          <span className="rd-sunken min-w-0 flex-1 truncate bg-white px-2 py-0.5 font-rd-pixel text-[0.9rem]">{projectPath(project.slug)}</span>
        </div>

        <main className="grid gap-3 px-2 pb-2 lg:grid-cols-[1fr_19rem]">
          <Pane className="min-w-0">
            <article aria-labelledby="file-title">
              <h1 id="file-title" className="text-[clamp(1.7rem,4.5vw,2.6rem)] leading-[1.08] font-bold break-words">
                {project.title}
              </h1>
              {project.isFeatured && <p className="mt-1 font-rd-pixel text-[0.9rem] text-rd-title">Pinned to the desktop</p>}
              {project.summary && <p className="mt-3 max-w-[60ch] text-[1.15rem] leading-snug">{project.summary}</p>}
              <hr className="my-5 border-0 border-t border-rd-shadow shadow-[0_1px_0_#fff]" />
              {project.content ? (
                <Markdown className={markdownClass}>{project.content}</Markdown>
              ) : (
                <p className="max-w-[60ch] leading-relaxed text-rd-muted">
                  This file has no long description yet. The summary above says what it is; dates and skills are in the
                  properties.
                </p>
              )}
            </article>
          </Pane>

          <aside className="grid content-start gap-3">
            <GroupBox title="Preview">
              <Cover
                url={project.coverUrl}
                title={project.title}
                isLazy={false}
                className="rd-sunken block w-full bg-white p-[3px]"
                fallback={
                  <div className="rd-sunken grid aspect-[4/3] place-items-center bg-white text-center">
                    <span className="grid justify-items-center gap-2">
                      <DocIcon />
                      <span className="font-rd-pixel text-[0.85rem] text-rd-muted">No preview available</span>
                    </span>
                  </div>
                }
              />
            </GroupBox>
            <GroupBox title="Properties">
              <dl className="grid gap-1">
                <Field label="Folder">{folder}</Field>
                {dates && <Field label="Dates">{dates}</Field>}
                {origin && <Field label={project.experience ? "Built at" : "Part of"}>{origin}</Field>}
              </dl>
            </GroupBox>
            {project.skills.length > 0 && (
              <GroupBox title="Skills">
                <ul className="rd-sunken grid bg-white p-1">
                  {project.skills.map((skill) => (
                    <li key={skill} className="px-1.5 py-0.5">
                      {skill}
                    </li>
                  ))}
                </ul>
              </GroupBox>
            )}
            {linked && (
              <GroupBox title={linked.kind === "experience" ? "About the job" : "About the course"}>
                <p className="font-bold">{linked.title}</p>
                {linked.dates && <p className="font-rd-pixel text-[0.85rem] text-rd-muted">{linked.dates}</p>}
                {linkedDescription && <p className="mt-1 text-[0.95rem] leading-snug">{linkedDescription}</p>}
              </GroupBox>
            )}
          </aside>
        </main>

        <StatusBar cells={[folder, dates || "No dates", `${project.skills.length} skill(s)`]} />
      </div>
    </div>
  );
}
