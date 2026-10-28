import { firstName, initials, platformName } from "~/lib/format";
import type { Link, Profile } from "~/lib/portfolio";
import { Line } from "./ReceiptParts";

interface StoreHeaderProps {
  profile: Profile;
  links: Link[];
  sinceYear: string | null;
}

// The top of the receipt: the shop's printed logo, its name in double-width type, and the branch details.
export function StoreHeader({ profile, links, sinceYear }: StoreHeaderProps) {
  return (
    <header className="text-center">
      {profile.avatarUrl ? (
        <img
          src={profile.avatarUrl}
          alt={`Photo of ${profile.fullName}`}
          className="rc-thermal mx-auto size-24 border-2 border-rc-ink object-cover"
        />
      ) : (
        <div aria-hidden="true" className="mx-auto grid size-24 place-items-center border-2 border-rc-ink text-3xl font-extrabold font-stretch-[112.5%]">
          {initials(profile.fullName)}
        </div>
      )}
      <h1 className="mt-5 text-[clamp(1.55rem,6.4vw,2.5rem)] leading-[1.1] font-extrabold break-words uppercase font-stretch-[112.5%]">
        {profile.fullName}
      </h1>
      <p className="mt-2">Software mini-mart{sinceYear ? `, open since ${sinceYear}` : ""}</p>
      <p className="mx-auto mt-3 max-w-[34ch] text-[1.05em] font-semibold">{profile.headline}</p>

      <div className="mt-6 grid gap-0.5 text-left">
        {profile.location && <Line label="Branch" amount={profile.location} />}
        {profile.email && <Line label="Email" amount={<a href={`mailto:${profile.email}`}>{profile.email}</a>} />}
        {links.map((link) => (
          <Line key={link.url} label={platformName(link.platform)} amount={<a href={link.url}>{link.url.replace(/^https?:\/\/(www\.)?/, "")}</a>} />
        ))}
        {profile.resumeUrl && <Line label="Resume" amount={<a href={profile.resumeUrl}>Download (PDF)</a>} />}
        <Line label="Cashier" amount={firstName(profile.fullName)} />
        <Line label="Customer" amount="You" />
      </div>
    </header>
  );
}
