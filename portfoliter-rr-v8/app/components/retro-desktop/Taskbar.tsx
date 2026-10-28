import { firstName, initials } from "~/lib/format";

interface TaskbarProps {
  fullName: string;
  location: string | null;
  windows: { href: string; label: string }[];
}

// The bar along the bottom of the screen: a home button with the owner's initials, one button per open
// window (each jumps to it), and a tray. The window buttons scroll sideways inside the bar on phones.
export function Taskbar({ fullName, location, windows }: TaskbarProps) {
  return (
    <nav aria-label="Windows" className="rd-raised fixed inset-x-0 bottom-0 z-20 flex items-center gap-1.5 px-1.5 py-1 font-rd-pixel text-[0.9rem]">
      <a href="#top" className="rd-button flex shrink-0 items-center gap-1.5 px-2 py-1 font-bold">
        <span aria-hidden="true" className="grid size-5 place-items-center bg-rd-title text-[0.65rem] text-white">
          {initials(fullName).slice(0, 2)}
        </span>
        {firstName(fullName)}
      </a>
      <span aria-hidden="true" className="h-6 w-[2px] shrink-0 border-l border-rd-shadow bg-white" />
      {/* padded so focus outlines are not clipped by the scroll box */}
      <ul className="flex min-w-0 flex-1 gap-1 overflow-x-auto p-1.5">
        {windows.map((window) => (
          <li key={window.href} className="shrink-0">
            <a href={window.href} className="rd-button block max-w-44 truncate px-2 py-1">
              {window.label}
            </a>
          </li>
        ))}
      </ul>
      {location && <span className="rd-sunken hidden shrink-0 px-2 py-1 md:block">{location}</span>}
    </nav>
  );
}
