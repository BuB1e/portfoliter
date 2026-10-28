import { Avatar } from "~/components/shared/Avatar";
import { platformName } from "~/lib/format";
import type { Link, Profile } from "~/lib/portfolio";

interface SpecHeaderProps {
  profile: Profile;
  links: Link[];
  sinceYear: string | null;
}

export function SpecHeader({ profile, links, sinceYear }: SpecHeaderProps) {
  return (
    <header className="grid gap-8 pt-16 pb-14 md:grid-cols-[1fr_auto] md:pt-24 md:pb-20">
      <div>
        {sinceYear && (
          <p className="mb-6 flex items-center gap-2.5 text-[0.95rem] text-ss-muted">
            <span aria-hidden="true" className="size-2 rounded-full bg-ss-blue" />
            In production since {sinceYear}
          </p>
        )}
        <h1 className="max-w-[14ch] text-[clamp(3rem,9vw,6.5rem)] leading-[0.92] font-bold tracking-[-0.035em]">
          {profile.fullName}
        </h1>
        <p className="mt-6 max-w-[38ch] text-[clamp(1.25rem,2.4vw,1.6rem)] leading-snug text-ss-muted">{profile.headline}</p>
        {profile.location && <p className="mt-3 text-[1.05rem]">Based in {profile.location}</p>}
        <nav aria-label="Contact" className="mt-10 flex flex-wrap gap-x-7 gap-y-2 text-[1.05rem] font-medium">
          {profile.email && (
            <a href={`mailto:${profile.email}`} className="text-ss-blue">
              {profile.email}
            </a>
          )}
          {links.map((link) => (
            <a key={link.url} href={link.url}>
              {platformName(link.platform)}
            </a>
          ))}
          {profile.resumeUrl && <a href={profile.resumeUrl}>Resume (PDF)</a>}
        </nav>
      </div>
      <Avatar
        url={profile.avatarUrl}
        name={profile.fullName}
        className="row-start-1 size-28 border border-ss-rule object-cover md:col-start-2 md:size-40"
        fallbackClassName="row-start-1 grid size-28 place-items-center border border-ss-rule text-3xl font-bold tracking-tight text-ss-blue md:col-start-2 md:size-40 md:text-5xl"
      />
    </header>
  );
}
