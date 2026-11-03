import { educationLine } from "~/lib/fields";
import type { Education } from "~/lib/portfolio";

function Fact({ value, note }: { value: string; note: string }) {
  return (
    <div className="min-w-0">
      <p className="pn-fact">{value}</p>
      <p className="pn-small mt-2 text-pn-ink-soft">{note}</p>
    </div>
  );
}

// Certificate of origin: where the engineer was made, one row of facts per school, set like the line of
// details on a customs form.
export function Origin({ education, id }: { education: Education[]; id: string }) {
  return (
    <section aria-labelledby={id} className="pn-section pn-wrap">
      <div data-reveal="" className="grid items-end gap-6 md:grid-cols-12">
        <h2 id={id} className="pn-display md:col-span-8">
          Certificate of origin
        </h2>
        <p className="max-w-[30ch] md:col-span-3 md:col-start-10">Where this engineer was made. Schools listed newest first, papers in order.</p>
      </div>

      <div className="mt-16 flex flex-col gap-16">
        {education.map((school, index) => {
          const line = educationLine(school);
          return (
            <div
              key={school.id}
              data-reveal=""
              style={{ "--i": index + 1 } as React.CSSProperties}
              className="grid gap-x-10 gap-y-8 bg-pn-kraft-light p-6 sm:grid-cols-2 sm:p-10"
            >
              <Fact value={line.institution} note="Made at" />
              {line.qualification && <Fact value={line.qualification} note="Model" />}
              {line.dates && <Fact value={line.dates} note="Production run" />}
              {line.description && <Fact value={line.description} note="Inspection notes" />}
            </div>
          );
        })}
      </div>
    </section>
  );
}
