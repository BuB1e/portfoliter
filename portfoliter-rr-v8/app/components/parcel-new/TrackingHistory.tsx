import { experienceLine } from "~/lib/fields";
import type { Experience } from "~/lib/portfolio";

// Tracking history: one tall printed sheet with scalloped ends. Each job is a stop on the route, its
// dates set against the right edge the way a courier's printout lines them up.
export function TrackingHistory({ experiences, id }: { experiences: Experience[]; id: string }) {
  return (
    <section aria-labelledby={id} className="pn-section pn-wrap">
      <div className="pn-scallop-y mx-auto max-w-[860px] bg-pn-paper px-6 py-16 sm:px-16 sm:py-20">
        <div data-reveal="" className="text-center">
          <h2 id={id} className="pn-heading">
            Tracking history
          </h2>
          <p className="mt-3">Where this package has been, latest scan first. No dents reported.</p>
        </div>

        <ol className="mt-14 flex flex-col gap-14">
          {experiences.map((job, index) => {
            const line = experienceLine(job);
            const facts = [line.isCurrent ? "Still in transit" : "Delivered", line.employmentType, line.location].filter(Boolean).join(", ");
            return (
              <li key={job.id} data-reveal="" style={{ "--i": index } as React.CSSProperties}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <h3 className="text-[1.375rem] leading-tight font-bold">{line.role}</h3>
                  <p className="font-semibold tabular-nums">{line.dates}</p>
                </div>
                <p className="mt-1 font-semibold">{line.company}</p>
                {facts && <p className="pn-small mt-1 text-pn-ink-soft">{facts}</p>}
                {line.description && <p className="mt-4 max-w-[64ch]">{line.description}</p>}
                {line.skills.length > 0 && (
                  <p className="pn-small mt-4">
                    <span className="font-semibold">Scanned with </span>
                    {line.skills.join(", ")}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
