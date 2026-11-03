import { firstName, initials, platformName } from "~/lib/format";
import type { Link, Profile } from "~/lib/portfolio";

// The back of the box: a postcard with a scalloped top edge, a short message on the left and the return
// address on the right, the sender's photo as the stamp.
export function ReturnToSender({ profile, links }: { profile: Profile; links: Link[] }) {
  return (
    <footer className="pn-wrap mt-[var(--pn-gap)] pb-[var(--pn-margin)]">
      <div data-reveal="" className="pn-scallop-top bg-pn-paper px-6 pt-20 pb-8 sm:px-14">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="pn-heading">Return to sender</h2>
            <p className="mt-5 max-w-[40ch]">
              Questions about this package, or a role it would fit? Write to {firstName(profile.fullName)}. Replies ship faster than the box did.
            </p>
          </div>
          <div className="flex items-start justify-between gap-8">
            <ul className="flex flex-col gap-3">
              {profile.email && (
                <li>
                  <a href={`mailto:${profile.email}`} className="pn-link">
                    {profile.email}
                  </a>
                </li>
              )}
              {links.map((link) => (
                <li key={link.url}>
                  <a href={link.url} className="pn-link">
                    {platformName(link.platform)}
                  </a>
                </li>
              ))}
              {profile.resumeUrl && (
                <li>
                  <a href={profile.resumeUrl} className="pn-link">
                    Résumé (PDF)
                  </a>
                </li>
              )}
              {profile.location && <li>{profile.location}</li>}
            </ul>
            <span aria-hidden="true" className="w-[88px] flex-none bg-pn-kraft p-1.5">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="" className="aspect-[3/4] w-full object-cover" loading="lazy" />
              ) : (
                <span className="grid aspect-[3/4] place-items-center pn-heading text-pn-paper">{initials(profile.fullName)}</span>
              )}
            </span>
          </div>
        </div>
        <p className="pn-small mt-16 text-center text-pn-ink-soft">Packed by {profile.fullName}. Handle with care.</p>
      </div>
    </footer>
  );
}
