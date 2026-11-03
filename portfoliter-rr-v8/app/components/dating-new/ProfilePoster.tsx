import { Link } from "react-router";

import { firstName, initials } from "~/lib/format";
import type { Profile } from "~/lib/portfolio";

export function likeHref(email: string, subject: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}

export function TopBar({ tagline = "Swipe right on me" }: { tagline?: string }) {
  return (
    <div className="dn-wrap relative z-[2] flex items-center justify-between gap-4 py-5">
      <Link to="/" aria-label="portfoliter home" className="text-[1.0625rem] font-extrabold tracking-tight no-underline">
        portfoliter
      </Link>
      <p className="dn-small font-semibold">{tagline}</p>
    </div>
  );
}

interface ProfilePosterProps {
  profile: Profile;
  currentCompany: string | null;
}

// The first screen: the first name as a poster across the top, the profile photo standing in the middle
// with the name crossing its upper quarter, who this is at the bottom left and the one action at the
// bottom right. The full name is the page's h1; the giant first name is the poster.
export function ProfilePoster({ profile, currentCompany }: ProfilePosterProps) {
  const facts = [currentCompany && `Works at ${currentCompany}`, profile.location && `Lives in ${profile.location}`].filter(Boolean);

  return (
    <header className="relative overflow-hidden md:min-h-[min(100svh,1000px)]">
      <TopBar />
      <p
        aria-hidden="true"
        data-reveal=""
        style={{ "--chars": Math.max(firstName(profile.fullName).length, 4) } as React.CSSProperties}
        className="dn-display relative z-[1] text-center whitespace-nowrap text-dn-wine"
      >
        {firstName(profile.fullName)}
      </p>

      <div className="dn-wrap mt-6 grid gap-6 md:absolute md:inset-x-0 md:bottom-0 md:top-[90px] md:mt-0 md:grid-cols-12 md:items-end md:pb-8">
        <div className="relative z-0 order-3 md:order-none md:col-span-4 md:col-start-5 md:row-start-1 md:h-full md:self-stretch">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={`Photo of ${profile.fullName}`} className="h-[46svh] w-full object-cover md:h-full" />
          ) : (
            <span role="img" aria-label={`Initials of ${profile.fullName}`} className="grid h-[46svh] w-full place-items-center bg-dn-flame text-dn-paper dn-heading md:h-full">
              {initials(profile.fullName)}
            </span>
          )}
        </div>

        <div data-reveal="" style={{ "--i": 2 } as React.CSSProperties} className="md:col-span-4 md:col-start-1 md:row-start-1">
          <h1 className="dn-heading">{profile.fullName}</h1>
          <p className="mt-3 max-w-[30ch] font-semibold">{profile.headline}</p>
          {facts.length > 0 && (
            <ul className="mt-4">
              {facts.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
          )}
        </div>

        <div data-reveal="" style={{ "--i": 3 } as React.CSSProperties} className="order-2 flex flex-wrap items-center gap-4 md:order-none md:col-span-4 md:col-start-9 md:row-start-1 md:justify-end">
          {profile.email ? (
            <a href={likeHref(profile.email, "I swiped right on your portfolio")} className="dn-button">
              <Heart /> Send a like
            </a>
          ) : (
            <a href="#contact-title" className="dn-button">
              <Heart /> Send a like
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

export function Heart({ isFilled = true }: { isFilled?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="dn-heart size-5">
      <path
        d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 5.3 3.1 1.7-1.9 3.2-3.1 5.3-3.1 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z"
        fill={isFilled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}
