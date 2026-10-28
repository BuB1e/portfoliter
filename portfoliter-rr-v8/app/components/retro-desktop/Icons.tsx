import type { ReactNode } from "react";

import type { Project } from "~/lib/portfolio";

export function FolderIcon({ size = "large" }: { size?: "small" | "large" }) {
  return <span aria-hidden="true" className={`rd-folder block shrink-0 ${size === "small" ? "h-3.5 w-4" : "h-9 w-11"}`} />;
}

export function DocIcon({ size = "large" }: { size?: "small" | "large" }) {
  return <span aria-hidden="true" className={`rd-doc block shrink-0 ${size === "small" ? "h-4 w-3.5" : "h-11 w-9"}`} />;
}

// A coloured square with a letter, for links and other "programs" on the desktop.
export function AppIcon({ letter, size = "large" }: { letter: string; size?: "small" | "large" }) {
  return (
    <span
      aria-hidden="true"
      className={`rd-raised grid shrink-0 place-items-center bg-rd-title! font-rd-pixel text-white ${size === "small" ? "size-4 text-[0.6rem]" : "size-10 text-lg"}`}
    >
      {letter}
    </span>
  );
}

// A project file's icon: its cover as a thumbnail, or a blank document when it has none.
export function ProjectIcon({ project }: { project: Project }) {
  if (project.coverUrl) {
    return (
      <span className="rd-sunken block size-16 shrink-0 bg-white p-[3px]">
        <img src={project.coverUrl} alt={`Cover of ${project.title}`} className="size-full object-cover" loading="lazy" />
      </span>
    );
  }
  return (
    <span className="grid size-16 shrink-0 place-items-center">
      <DocIcon />
    </span>
  );
}

interface DesktopIconProps {
  href: string;
  icon: ReactNode;
  label: string;
}

// A desktop shortcut: icon over a label that turns into the navy selection when focused.
export function DesktopIcon({ href, icon, label }: DesktopIconProps) {
  return (
    <a href={href} className="group grid w-24 justify-items-center gap-1.5 p-1 text-center no-underline">
      {icon}
      <span className="px-1 font-rd-pixel text-[0.85rem] leading-tight break-words text-white group-hover:bg-rd-title group-focus-visible:bg-rd-title">
        {label}
      </span>
    </a>
  );
}
