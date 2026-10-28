import { Avatar } from "~/components/shared/Avatar";
import type { Profile } from "~/lib/portfolio";

interface StatusHeaderProps {
  profile: Profile;
  currentCompany: string | null;
}

export function StatusHeader({ profile, currentCompany }: StatusHeaderProps) {
  return (
    <header className="pt-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar
            url={profile.avatarUrl}
            name={profile.fullName}
            className="size-11 flex-none rounded-full border border-st-line object-cover"
            fallbackClassName="grid size-11 flex-none place-items-center rounded-full border border-st-line bg-st-card font-semibold text-st-muted"
          />
          <div>
            <span className="block text-lg leading-tight font-semibold">{profile.fullName}</span>
            {profile.location && <span className="block text-sm text-st-muted">Region: {profile.location}</span>}
          </div>
        </div>
        {profile.email && (
          <a href={`mailto:${profile.email}`} className="rounded-lg bg-st-ink px-4 py-2 text-sm font-medium text-white no-underline">
            Subscribe to updates
          </a>
        )}
      </div>

      <div className={`mt-10 flex items-center gap-4 rounded-xl px-6 py-5 text-white ${currentCompany ? "bg-st-up" : "bg-st-info"}`}>
        <span aria-hidden="true" className="grid size-8 flex-none place-items-center rounded-full bg-white/25 text-lg font-bold">
          ✓
        </span>
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl">
            {currentCompany ? "All systems operational" : "Available for new work"}
          </h1>
          <p className="text-white/85">
            {currentCompany ? `${profile.fullName} is currently running at ${currentCompany}.` : `${profile.fullName} is open to new roles.`}
          </p>
        </div>
      </div>
    </header>
  );
}
