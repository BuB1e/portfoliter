import { Avatar } from "~/components/shared/Avatar";
import { platformName } from "~/lib/format";
import type { Link, Profile } from "~/lib/portfolio";

const AVATAR_FALLBACK =
  "radial-gradient(circle at 70% 25%, var(--color-flame) 0 18%, transparent 19%), radial-gradient(circle at 25% 75%, var(--color-mint) 0 24%, transparent 25%)";

interface ProfileCardProps {
  profile: Profile;
  links: Link[];
  currentCompany: string | null;
}

export function ProfileCard({ profile, links, currentCompany }: ProfileCardProps) {
  return (
    <aside className="overflow-hidden rounded-[28px] bg-card text-ink md:sticky md:top-5">
      <div className="relative grid aspect-[4/5] place-items-center bg-lilac" style={{ backgroundImage: AVATAR_FALLBACK }}>
        <Avatar
          url={profile.avatarUrl}
          name={profile.fullName}
          className="absolute inset-0 size-full object-cover"
          fallbackClassName="text-[7rem] font-extrabold text-ink mix-blend-multiply [font-stretch:75%]"
        />
        <span className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-ink py-1.5 pr-3 pl-2.5 text-sm text-card">
          <span className="size-2.5 rounded-full bg-mint" />
          Online now, also on call
        </span>
      </div>

      <div className="px-6 pt-5 pb-6">
        <h1 className="text-[2.6rem] leading-none font-extrabold tracking-tight">{profile.fullName}</h1>
        {profile.location && <p className="mt-1.5 mb-4 text-[0.95rem] text-muted">{profile.location}. 0 ms from production.</p>}
        <p className="mb-5 text-lg leading-snug">{profile.headline}</p>

        <ul aria-label="Looking for" className="mb-6 flex flex-wrap gap-2">
          <li className="rounded-full border-[1.5px] border-ink px-3 py-0.5 text-sm">Long-term</li>
          <li className="rounded-full border-[1.5px] border-ink px-3 py-0.5 text-sm">Well-tested</li>
          {currentCompany && <li className="rounded-full border-[1.5px] border-ink px-3 py-0.5 text-sm">Currently at {currentCompany}</li>}
        </ul>

        <div className="flex flex-wrap gap-2.5">
          {profile.email && (
            <a href={`mailto:${profile.email}`} className="rounded-full bg-flame px-4 py-2.5 text-[0.95rem] font-bold text-white no-underline">
              Send a message
            </a>
          )}
          {links.map((link) => (
            <a key={link.url} href={link.url} className="rounded-full border-[1.5px] border-ink px-4 py-2.5 text-[0.95rem] font-bold no-underline">
              {platformName(link.platform)}
            </a>
          ))}
          {profile.resumeUrl && (
            <a href={profile.resumeUrl} className="rounded-full border-[1.5px] border-ink px-4 py-2.5 text-[0.95rem] font-bold no-underline">
              Resume
            </a>
          )}
        </div>
      </div>
    </aside>
  );
}
