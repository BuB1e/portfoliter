import { initials, platformName } from "~/lib/format";
import type { Link, Profile } from "~/lib/portfolio";
import { Barcode } from "./Barcode";
import { BoxPhotos, type BoxPhoto } from "./BoxPhotos";

export interface NavItem {
  id: string;
  label: string;
}

interface ShippingLabelProps {
  profile: Profile;
  links: Link[];
  trackingNumber: string;
  nav: NavItem[];
  // Where "See what's inside" goes: the first packing list, or null when there are no projects.
  insideHref: string | null;
  photos: BoxPhoto[];
}

const STRIPE_BARS = 64;

export function Stripe({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pn-stripe ${className}`}>
      {Array.from({ length: STRIPE_BARS }, (_, i) => (
        <span key={i} />
      ))}
    </div>
  );
}

function Fact({ name, value }: { name: string; value: string }) {
  return (
    <div>
      <dt className="pn-small text-pn-ink-soft">{name}</dt>
      <dd className="pn-lead font-semibold">{value}</dd>
    </div>
  );
}

// The first screen: the shipping label as a paper panel beside the principal photograph. Everything a
// visitor needs first is printed on the label: who, what, where from, and how to reach them.
export function ShippingLabel({ profile, links, trackingNumber, nav, insideHref, photos }: ShippingLabelProps) {
  return (
    <header className="pn-wrap grid gap-3 pt-[var(--pn-margin)] lg:min-h-[min(100svh,980px)] lg:grid-cols-[7fr_5fr]">
      <BoxPhotos
        photos={photos}
        className="h-[36svh] sm:h-[48svh] lg:order-2 lg:h-auto"
        fallback={
          <span role="img" aria-label={`Initials of ${profile.fullName}`} data-active="" className="grid place-items-center pn-display text-pn-paper">
            {initials(profile.fullName)}
          </span>
        }
      />

      <div className="relative z-[1] -mt-6 flex min-w-0 flex-col bg-pn-paper lg:order-1 lg:mt-0">
        <Stripe />
        <div className="flex flex-1 flex-col gap-10 p-6 sm:p-10">
          {nav.length > 0 && (
            <nav aria-label="On this label" className="hidden flex-wrap gap-x-6 gap-y-2 sm:flex">
              {nav.map((item) => (
                <a key={item.id} href={`#${item.id}`} className="pn-link pn-small">
                  {item.label}
                </a>
              ))}
            </nav>
          )}

          <div data-reveal="" className="flex-1">
            <h1 className="pn-display">{profile.fullName}</h1>
            <p className="pn-lead mt-6 max-w-[34ch]">{profile.headline}</p>
          </div>

          <div data-reveal="" style={{ "--i": 2 } as React.CSSProperties} className="flex flex-wrap items-center gap-x-6 gap-y-4">
            {insideHref && (
              <a href={insideHref} className="pn-button">
                See what's inside
              </a>
            )}
            {profile.email && (
              <a href={`mailto:${profile.email}`} className="pn-link">
                {profile.email}
              </a>
            )}
            {links.map((link) => (
              <a key={link.url} href={link.url} className="pn-link">
                {platformName(link.platform)}
              </a>
            ))}
            {profile.resumeUrl && (
              <a href={profile.resumeUrl} className="pn-link">
                Résumé (PDF)
              </a>
            )}
          </div>

          <dl data-reveal="" style={{ "--i": 3 } as React.CSSProperties} className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            <Fact name="Ship to" value="You, the person hiring" />
            {profile.location && <Fact name="From" value={profile.location} />}
            <Fact name="Contents" value="1 engineer, fully assembled" />
            <Fact name="Tracking number" value={trackingNumber} />
          </dl>

          <Barcode code={trackingNumber} className="h-14 w-full text-pn-ink" />
        </div>
      </div>
    </header>
  );
}
