import { initials, platformName } from "~/lib/format";
import type { Link, Profile } from "~/lib/portfolio";

interface LeadStoryProps {
  profile: Profile;
  links: Link[];
  index: { href: string; label: string; count: number }[];
}

// The front-page lead: the owner's headline as the story, the bio as its text, with the index and the
// letters box in the right-hand rail.
export function LeadStory({ profile, links, index }: LeadStoryProps) {
  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_17rem] lg:gap-0">
      <article aria-labelledby="lead-title" className="min-w-0 lg:border-r lg:border-bs-rule lg:pr-8">
        <p className="text-[0.95rem] text-bs-red italic">Profile</p>
        <h2 id="lead-title" className="mt-1 max-w-[22ch] text-[clamp(2rem,5.2vw,3.9rem)] leading-[1.02] font-bold tracking-[-0.015em] text-balance">
          {profile.headline}
        </h2>
        <p className="mt-4 text-[0.95rem]">
          By <span className="font-semibold">{profile.fullName}</span>
          {profile.location && <span className="text-bs-grey">, {profile.location}</span>}
        </p>

        <div className="mt-5 grid gap-6 md:grid-cols-[minmax(0,15rem)_1fr]">
          <figure>
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={`Portrait of ${profile.fullName}`} className="bs-photo aspect-[4/5] w-full object-cover" />
            ) : (
              <div aria-hidden="true" className="bs-halftone grid aspect-[4/5] w-full place-items-center font-bs-nameplate text-6xl">
                {initials(profile.fullName)}
              </div>
            )}
            <figcaption className="mt-2 border-b border-bs-rule pb-2 text-[0.85rem] text-bs-grey italic">
              {profile.fullName}
              {profile.location ? ` in ${profile.location}` : ""}.
            </figcaption>
          </figure>
          {profile.bio && (
            <p className="bs-column-rule text-[1.06rem] leading-[1.6] text-pretty xl:columns-2 xl:gap-8 first-letter:float-left first-letter:mt-1 first-letter:mr-2 first-letter:font-bs-nameplate first-letter:text-[3.6rem] first-letter:leading-[0.8]">
              {profile.bio}
            </p>
          )}
        </div>
      </article>

      <aside className="grid content-start gap-8 lg:pl-8">
        <nav aria-labelledby="index-title" className="border border-bs-ink p-4">
          <h2 id="index-title" className="border-b border-bs-ink pb-2 text-xl font-bold">
            Inside today
          </h2>
          <ul className="mt-2 grid">
            {index.map((entry) => (
              <li key={entry.href} className="border-b border-dotted border-bs-rule last:border-0">
                <a href={entry.href} className="flex justify-between gap-3 py-1.5 no-underline hover:underline">
                  <span>{entry.label}</span>
                  <span className="text-bs-grey tabular-nums">{entry.count}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <section aria-labelledby="letters-title" className="border-t-4 border-bs-ink pt-3">
          <h2 id="letters-title" className="text-xl font-bold">
            Letters to the editor
          </h2>
          <p className="mt-1 text-[0.95rem] text-bs-grey italic">Hiring, questions and corrections welcome.</p>
          <ul className="mt-3 grid gap-1.5">
            {profile.email && (
              <li>
                <a href={`mailto:${profile.email}`} className="font-semibold break-all">
                  {profile.email}
                </a>
              </li>
            )}
            {links.map((link) => (
              <li key={link.url}>
                <a href={link.url}>{platformName(link.platform)}</a>
              </li>
            ))}
            {profile.resumeUrl && (
              <li>
                <a href={profile.resumeUrl}>Resume, the full record (PDF)</a>
              </li>
            )}
          </ul>
        </section>
      </aside>
    </div>
  );
}
