import { capitalize, firstName } from "~/lib/format";
import type { Link, Profile } from "~/lib/portfolio";

interface TopUpProps {
  profile: Profile;
  links: Link[];
}

const SECONDARY = "rounded-full border-2 border-white/80 px-4 py-2 font-semibold text-white no-underline";

export function TopUp({ profile, links }: TopUpProps) {
  return (
    <footer className="mt-24 bg-sky-silom text-white">
      <div aria-hidden="true" className="h-3 bg-sky-sukhumvit" />
      <div className="mx-auto flex max-w-[1080px] flex-wrap items-end justify-between gap-8 px-5 py-14">
        <div>
          <h2 className="font-sky-sign text-[clamp(2.4rem,6vw,3.6rem)] leading-none font-bold">End of the line</h2>
          <p className="mt-2 max-w-[42ch] text-white/80">This train terminates here. Passengers looking for a backend engineer, please alight.</p>
        </div>
        <nav aria-label="Contact" className="flex flex-wrap gap-3">
          {profile.email && (
            <a href={`mailto:${profile.email}`} className="rounded-full bg-sky-yellow px-5 py-2 font-semibold text-sky-ink no-underline">
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
              Timetable (PDF)
            </a>
          )}
        </nav>
      </div>
    </footer>
  );
}
