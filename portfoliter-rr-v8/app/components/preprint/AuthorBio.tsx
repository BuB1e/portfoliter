import { initials, platformName } from "~/lib/format";
import type { Link, Profile } from "~/lib/portfolio";

// The paper ends the way a journal article does: the author's biography with their photograph, then
// where to write to them.
export function AuthorBio({ profile, links }: { profile: Profile; links: Link[] }) {
  return (
    <footer className="pp-section pp-wrap pb-[var(--pp-margin)]">
      <div data-reveal="" className="pp-column grid gap-6 bg-pp-desk p-6 sm:grid-cols-[120px_1fr] sm:p-10">
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt={`Photo of ${profile.fullName}`} loading="lazy" className="aspect-[3/4] w-[120px] object-cover grayscale" />
        ) : (
          <span role="img" aria-label={`Initials of ${profile.fullName}`} className="grid aspect-[3/4] w-[120px] place-items-center bg-pp-paper pp-heading">
            {initials(profile.fullName)}
          </span>
        )}
        <div>
          <h2 className="pp-heading">About the author</h2>
          <p className="mt-3">
            <span className="font-semibold">{profile.fullName}.</span>
            {profile.headline && <> {profile.headline}</>}
            {profile.location && <> Based in {profile.location}.</>}
          </p>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            {profile.email && (
              <li>
                <a href={`mailto:${profile.email}`} className="pp-link">
                  {profile.email}
                </a>
              </li>
            )}
            {links.map((link) => (
              <li key={link.url}>
                <a href={link.url} className="pp-link">
                  {platformName(link.platform)}
                </a>
              </li>
            ))}
            {profile.resumeUrl && (
              <li>
                <a href={profile.resumeUrl} className="pp-link">
                  Résumé (PDF)
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <p className="pp-small pp-column mt-10 text-center text-pp-soft">Preprint. Not peer reviewed yet; reviews are welcome by email.</p>
    </footer>
  );
}
