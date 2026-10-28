import { Avatar } from "~/components/shared/Avatar";
import type { Profile } from "~/lib/portfolio";

interface StationSignProps {
  profile: Profile;
  currentCompany: string | null;
}

// Platform sign: line roundel, station name, and where the train goes next.
export function StationSign({ profile, currentCompany }: StationSignProps) {
  return (
    <header className="overflow-hidden rounded-b-3xl bg-sky-silom text-white">
      <div className="mx-auto max-w-[1080px] px-5 pt-10 pb-12 md:pt-14 md:pb-16">
        <div className="flex flex-wrap items-center gap-3 text-[0.95rem] font-semibold">
          <Avatar
            url={profile.avatarUrl}
            name={profile.fullName}
            className="size-16 rounded-full border-4 border-white object-cover"
            fallbackClassName="grid size-16 place-items-center rounded-full border-4 border-white bg-white font-sky-sign text-xl font-bold text-sky-silom"
          />
          {profile.location && <span>{profile.location}</span>}
        </div>
        <p className="mt-8 text-lg text-white/75">This station</p>
        <h1 className="font-sky-sign text-[clamp(3.4rem,11vw,7.5rem)] leading-[0.88] font-bold tracking-[-0.01em]">
          {profile.fullName}
        </h1>
        <p className="mt-4 max-w-[44ch] text-xl leading-snug">{profile.headline}</p>
        <div className="mt-8 inline-flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl bg-sky-yellow px-5 py-3 text-sky-ink">
          <span className="font-sky-sign text-lg font-bold">Next station</span>
          <span className="text-lg">{currentCompany ?? "Your team"}</span>
        </div>
      </div>
      <div aria-hidden="true" className="h-3 bg-sky-sukhumvit" />
    </header>
  );
}
