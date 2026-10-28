import { Link } from "react-router";

import { firstName } from "~/lib/format";

// "The Daily Harit": the paper is named after the owner's first name.
export function paperName(fullName: string): string {
  return `The Daily ${firstName(fullName)}`;
}

interface MastheadProps {
  fullName: string;
  location: string | null;
  sinceYear: string | null;
  issue: number;
  sections: { href: string; label: string }[];
}

// Folio line, blackletter nameplate between two ears, and the section index.
export function Masthead({ fullName, location, sinceYear, issue, sections }: MastheadProps) {
  return (
    <header>
      <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 border-b border-bs-ink py-2 text-[0.85rem] text-bs-grey">
        <span>{sinceYear ? `Established ${sinceYear}` : "First edition"}</span>
        <span>{location ? `${location} edition` : "Online edition"}</span>
        <span>No. {issue}, free to read</span>
      </div>

      <div className="grid items-center gap-4 py-5 sm:py-7 md:grid-cols-[10rem_1fr_10rem]">
        <p className="hidden border border-bs-ink p-2 text-center text-[0.8rem] leading-snug md:block">
          All the projects, every job and each skill, in one edition.
        </p>
        <div className="text-center">
          <h1 className="font-bs-nameplate text-[clamp(2.6rem,10vw,6.5rem)] leading-[0.95] font-normal break-words">{paperName(fullName)}</h1>
          <p className="mt-2 text-[0.95rem] text-bs-grey italic">The personal paper of {fullName}</p>
        </div>
        <p className="hidden border border-bs-ink p-2 text-center text-[0.8rem] leading-snug md:block">
          Letters to the editor are answered. See the back page.
        </p>
      </div>

      <nav aria-label="Sections" className="border-y-[3px] border-double border-bs-ink">
        {/* padded so the first and last links' focus outlines are not clipped by the scroll box */}
        <ul className="flex gap-x-6 overflow-x-auto px-2 py-2 text-[0.95rem] whitespace-nowrap lg:justify-center">
          {sections.map((section) => (
            <li key={section.href}>
              <a href={section.href} className="no-underline hover:underline">
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

// The slim masthead on article pages: the nameplate links home, the back link returns to the section.
export function SlimMasthead({ fullName, back }: { fullName: string | null; back: { to: string; label: string } }) {
  return (
    <header className="border-b-[3px] border-double border-bs-ink">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3">
        <Link to={back.to} className="text-[0.95rem]">
          {back.label}
        </Link>
        <Link to="/" className="font-bs-nameplate text-[clamp(1.6rem,5vw,2.4rem)] leading-none no-underline">
          {fullName ? paperName(fullName) : "The front page"}
        </Link>
      </nav>
    </header>
  );
}
