import { initials } from "~/lib/format";
import type { Profile } from "~/lib/portfolio";
import { Cursor, Meter } from "./QuestWindow";

interface CharacterSheetProps {
  profile: Profile;
  cleared: number;
  total: number;
}

// The party member's status window: portrait, name, class (the headline), level and quest progress.
// Level is the number of quests in the log, so it only ever comes from real data.
export function CharacterSheet({ profile, cleared, total }: CharacterSheetProps) {
  return (
    <header className="ql-window px-4 py-5 sm:px-6">
      <div className="grid gap-5 sm:grid-cols-[8.5rem_1fr]">
        <div className="size-34 border-[3px] border-ql-frame bg-ql-edge p-1 shadow-[0_0_0_3px_var(--color-ql-edge)]">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={`Portrait of ${profile.fullName}`} className="size-full object-cover" />
          ) : (
            <div aria-hidden="true" className="grid size-full place-items-center bg-ql-window-top text-5xl font-bold text-ql-gold">
              {initials(profile.fullName)}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h1 className="text-[clamp(2.1rem,6vw,3.4rem)] leading-[0.95] font-bold break-words">{profile.fullName}</h1>
          <dl className="mt-3 grid gap-x-4 gap-y-1 sm:grid-cols-[auto_1fr]">
            <dt className="text-ql-gold">Class</dt>
            <dd>{profile.headline}</dd>
            {profile.location && (
              <>
                <dt className="text-ql-gold">Home</dt>
                <dd>{profile.location}</dd>
              </>
            )}
            <dt className="text-ql-gold">Level</dt>
            <dd>
              {total} <span className="text-ql-soft">(one per quest in the log)</span>
            </dd>
          </dl>
          {total > 0 && (
            <div className="mt-3 grid max-w-sm grid-cols-[auto_1fr_auto] items-center gap-3">
              <span className="text-ql-gold">Cleared</span>
              <Meter label={`${cleared} of ${total} quests cleared`} value={cleared} max={total} />
              <span className="tabular-nums">
                {cleared}/{total}
              </span>
            </div>
          )}
        </div>
      </div>
      {profile.bio && (
        <div className="mt-6 border-t-2 border-ql-frame/40 pt-4">
          <h2 className="text-ql-gold">Backstory</h2>
          <p className="mt-1 max-w-[62ch] text-[1.08rem] leading-relaxed">{profile.bio}</p>
        </div>
      )}
    </header>
  );
}

// The command menu: every section of the page as a menu entry, with the pointing cursor.
export function QuestMenu({ entries }: { entries: { href: string; label: string }[] }) {
  return (
    <nav aria-label="Menu" className="ql-window px-3 py-4">
      <ul className="grid gap-0.5 text-[1.15rem]">
        {entries.map((entry) => (
          <li key={entry.href}>
            <a href={entry.href} className="group flex items-start gap-2 rounded px-1 py-1 no-underline hover:text-ql-gold">
              <Cursor />
              <span>{entry.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
