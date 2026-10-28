import type { ReactNode } from "react";

// Minimise and maximise boxes are drawn only; these windows are page sections, not draggable apps.
function ChromeBox({ glyph }: { glyph: "min" | "max" }) {
  return (
    <span aria-hidden="true" className="rd-raised grid h-[18px] w-5 place-items-center">
      {glyph === "min" ? (
        <span className="mt-2 block h-[2px] w-2 bg-rd-dark" />
      ) : (
        <span className="block size-2.5 border border-t-2 border-rd-dark" />
      )}
    </span>
  );
}

// The close box, drawn as an X. On a page it is decoration; WindowClose makes it a real link.
export function CloseGlyph() {
  return (
    <span aria-hidden="true" className="relative block size-2.5">
      <span className="absolute top-1/2 left-0 h-[2px] w-full -translate-y-1/2 rotate-45 bg-rd-dark" />
      <span className="absolute top-1/2 left-0 h-[2px] w-full -translate-y-1/2 -rotate-45 bg-rd-dark" />
    </span>
  );
}

interface TitleBarProps {
  icon?: ReactNode;
  children: ReactNode;
  close?: ReactNode;
}

export function TitleBar({ icon, children, close }: TitleBarProps) {
  return (
    <div className="rd-titlebar flex items-center gap-2 px-1.5 py-1">
      {icon}
      <div className="min-w-0 flex-1 truncate font-rd-pixel text-[0.95rem] leading-tight">{children}</div>
      <div className="flex shrink-0 gap-0.5">
        <ChromeBox glyph="min" />
        <ChromeBox glyph="max" />
        {close ?? (
          <span aria-hidden="true" className="rd-raised ml-0.5 grid h-[18px] w-5 place-items-center">
            <CloseGlyph />
          </span>
        )}
      </div>
    </div>
  );
}

// A status bar of sunken cells along the bottom of a window.
export function StatusBar({ cells }: { cells: string[] }) {
  return (
    <div className="flex flex-wrap gap-1 px-1 pt-1 font-rd-pixel text-[0.85rem]">
      {cells.map((cell) => (
        <span key={cell} className="rd-sunken min-w-0 flex-1 truncate px-2 py-0.5">
          {cell}
        </span>
      ))}
    </div>
  );
}

interface WindowProps {
  id: string;
  title: string;
  icon?: ReactNode;
  status?: string[];
  children: ReactNode;
}

// A window as a page section: its title bar is the section heading.
export function Window({ id, title, icon, status, children }: WindowProps) {
  return (
    <section aria-labelledby={id} className="rd-raised scroll-mt-4 p-[3px] pb-1">
      <TitleBar icon={icon}>
        <h2 id={id} className="truncate">
          {title}
        </h2>
      </TitleBar>
      <div className="p-2 sm:p-3">{children}</div>
      {status && <StatusBar cells={status} />}
    </section>
  );
}
