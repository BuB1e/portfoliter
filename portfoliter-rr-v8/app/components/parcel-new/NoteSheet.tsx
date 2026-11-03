import type { Section } from "~/lib/portfolio";

// Any other section (prompts, awards, talks, languages, keys no design knows) as a note taped to the
// box: its title on the left, its entries in two columns on the right.
export function NoteSheet({ section }: { section: Section }) {
  const id = `section-${section.key}`;
  return (
    <section aria-labelledby={id} className="pn-section pn-wrap">
      <div data-reveal="" className="grid gap-10 bg-pn-paper p-6 sm:p-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        <h2 id={id} className="pn-heading">
          {section.title}
        </h2>
        <ul className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
          {section.entries.map((entry, index) => (
            <li key={`${entry.title}-${index}`}>
              <p className="font-bold">
                {entry.url ? (
                  <a href={entry.url} className="pn-link">
                    {entry.title}
                  </a>
                ) : (
                  entry.title
                )}
              </p>
              {entry.detail && <p className="mt-1">{entry.detail}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
