import { firstName, initials, platformName } from "~/lib/format";
import type { Link, Profile } from "~/lib/portfolio";
import { Heart, likeHref } from "./ProfilePoster";

// The close: the profile photo full-bleed with one solid card on it, the way a match screen ends a swipe.
// Everything needed to get in touch is on the card.
export function MatchCard({ profile, links, id }: { profile: Profile; links: Link[]; id: string }) {
  const name = firstName(profile.fullName);
  return (
    <section aria-labelledby={id} className="dn-section relative min-h-[70svh] overflow-hidden bg-dn-wine md:min-h-[100svh]">
      {profile.avatarUrl ? (
        <img src={profile.avatarUrl} alt={`Photo of ${profile.fullName}`} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <span aria-hidden="true" className="absolute inset-0 grid place-items-center dn-display text-dn-blush">
          {initials(profile.fullName)}
        </span>
      )}
      <div data-reveal="" className="relative mx-[var(--dn-margin)] mt-[52svh] mb-[var(--dn-margin)] bg-dn-paper p-8 md:absolute md:top-[60px] md:right-[60px] md:m-0 md:w-[400px]">
        <h2 id={id} className="dn-heading">
          It's a match?
        </h2>
        <p className="mt-4">If any of this made you swipe right, {name} would like to hear from you.</p>
        <ul className="mt-6 flex flex-col gap-2">
          {profile.location && <li>{profile.location}</li>}
          {links.map((link) => (
            <li key={link.url}>
              <a href={link.url} className="dn-link">
                {platformName(link.platform)}
              </a>
            </li>
          ))}
          {profile.resumeUrl && (
            <li>
              <a href={profile.resumeUrl} className="dn-link">
                Résumé (PDF)
              </a>
            </li>
          )}
          {profile.email && (
            <li>
              <a href={`mailto:${profile.email}`} className="dn-link">
                {profile.email}
              </a>
            </li>
          )}
        </ul>
        {profile.email && (
          <a href={likeHref(profile.email, "I swiped right on your portfolio")} className="dn-button mt-8 w-full">
            <Heart /> Message {name}
          </a>
        )}
      </div>
    </section>
  );
}

export function QuietFooter({ fullName, links }: { fullName: string; links: Link[] }) {
  return (
    <footer className="dn-wrap dn-small mt-[20svh] grid gap-2 pb-8 md:grid-cols-[1fr_auto_1fr] md:items-baseline">
      <p>The dating profile of {fullName}</p>
      <ul className="flex flex-wrap gap-6">
        <li>
          <a href="#top" className="dn-link">
            Back to the top
          </a>
        </li>
        {links.map((link) => (
          <li key={link.url}>
            <a href={link.url} className="dn-link">
              {platformName(link.platform)}
            </a>
          </li>
        ))}
      </ul>
      <p className="md:text-right">Made with portfoliter</p>
    </footer>
  );
}
