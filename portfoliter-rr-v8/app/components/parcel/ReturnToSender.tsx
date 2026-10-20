import { capitalize, firstName } from "~/lib/format";
import type { Link, Profile } from "~/lib/portfolio";

interface ReturnToSenderProps {
  profile: Profile;
  links: Link[];
}

const LINK = "border-2 border-parcel-label px-4 py-2 font-bold text-parcel-label no-underline hover:bg-parcel-label hover:text-parcel-ink";

export function ReturnToSender({ profile, links }: ReturnToSenderProps) {
  return (
    <footer className="mt-20 bg-parcel-ink px-4 py-12 text-parcel-label">
      <div className="mx-auto flex max-w-[1080px] flex-wrap items-end justify-between gap-8">
        <div>
          <h2 className="mb-1.5 font-parcel-stencil text-[clamp(2.4rem,6vw,3.6rem)] leading-[0.95] font-black">Return to sender</h2>
          <p>Questions about this package? Write to the sender.</p>
        </div>
        <nav aria-label="Contact" className="flex flex-wrap gap-4">
          {profile.email && (
            <a href={`mailto:${profile.email}`} className={LINK}>
              Email {firstName(profile.fullName)}
            </a>
          )}
          {links.map((link) => (
            <a key={link.url} href={link.url} className={LINK}>
              {capitalize(link.platform)}
            </a>
          ))}
          {profile.resumeUrl && (
            <a href={profile.resumeUrl} className={LINK}>
              Download the manual (PDF)
            </a>
          )}
        </nav>
      </div>
    </footer>
  );
}
