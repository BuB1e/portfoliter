import { capitalize, firstName } from "~/lib/format";
import type { Link, Profile } from "~/lib/portfolio";

interface ReportSightingProps {
  profile: Profile;
  links: Link[];
}

const SECONDARY = "rounded-full border-[1.5px] border-fg-pine px-5 py-3 font-medium no-underline";

export function ReportSighting({ profile, links }: ReportSightingProps) {
  return (
    <footer className="mt-20 flex flex-wrap justify-between gap-8 border-t-[1.5px] border-fg-pine pt-8">
      <div>
        <h2 className="font-fg-serif text-[2.2rem] leading-none font-semibold tracking-[-0.015em]">Report a sighting</h2>
        <p className="mt-1.5 max-w-[46ch]">Seen this engineer near your team? Send details. Approach slowly, with a clear job description.</p>
      </div>
      <nav aria-label="Contact" className="flex flex-wrap items-center gap-3">
        {profile.email && (
          <a href={`mailto:${profile.email}`} className="rounded-full bg-fg-pine px-5 py-3 font-medium text-fg-paper no-underline">
            Email {firstName(profile.fullName)}
          </a>
        )}
        {links.map((link) => (
          <a key={link.url} href={link.url} className={SECONDARY}>
            {capitalize(link.platform)}
          </a>
        ))}
        {profile.resumeUrl && (
          <a href={profile.resumeUrl} className={SECONDARY}>
            Full field notes (PDF)
          </a>
        )}
      </nav>
    </footer>
  );
}
