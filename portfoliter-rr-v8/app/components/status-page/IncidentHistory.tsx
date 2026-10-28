import { formatMonth } from "~/lib/format";
import type { Experience } from "~/lib/portfolio";
import { StatusPill } from "./StatusPill";

interface IncidentHistoryProps {
  experiences: Experience[];
}

interface Update {
  label: string;
  when: string;
  text: string;
}

// Each job reads as an incident: started when the engineer joined, resolved when they moved on.
function updatesFor(experience: Experience): Update[] {
  const started: Update = {
    label: experience.endDate ? "Investigating" : "Monitoring",
    when: formatMonth(experience.startDate),
    text: experience.description || `Joined as ${experience.role}.`,
  };
  if (!experience.endDate) {
    return [started];
  }
  return [{ label: "Resolved", when: formatMonth(experience.endDate), text: "Handed over cleanly. Services still running." }, started];
}

export function IncidentHistory({ experiences }: IncidentHistoryProps) {
  return (
    <ol className="divide-y divide-st-line">
      {experiences.map((experience) => (
        <li key={experience.id} className="px-5 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">
              {experience.role} at {experience.company}
            </h3>
            {experience.endDate ? <StatusPill tone="muted" label="Resolved" /> : <StatusPill tone="info" label="Ongoing" />}
          </div>
          <ol className="mt-3 grid gap-3 border-l-2 border-st-line pl-4">
            {updatesFor(experience).map((update) => (
              <li key={update.label}>
                <p className="text-sm">
                  <span className="font-semibold">{update.label}</span>
                  <span className="text-st-muted">, {update.when}</span>
                </p>
                <p className="max-w-[65ch]">{update.text}</p>
              </li>
            ))}
          </ol>
          {experience.skills.length > 0 && (
            <p className="mt-3 text-sm text-st-muted">Affected components: {experience.skills.join(", ")}</p>
          )}
        </li>
      ))}
    </ol>
  );
}
