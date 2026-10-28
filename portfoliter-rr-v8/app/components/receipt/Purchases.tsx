import { experienceLine } from "~/lib/fields";
import type { Experience } from "~/lib/portfolio";
import { Line, monthsBetween, Sub } from "./ReceiptParts";

// Each job is a purchase: the role is the item, the months on the job its price. The current job is
// still an open tab.
export function Purchases({ experiences }: { experiences: Experience[] }) {
  const closedMonths = experiences
    .filter((experience) => experience.endDate)
    .reduce((sum, experience) => sum + monthsBetween(experience.startDate, experience.endDate ?? experience.startDate), 0);
  const hasOpenTab = experiences.some((experience) => !experience.endDate);

  return (
    <>
      <ol className="grid gap-5">
        {experiences.map((experience) => {
          const line = experienceLine(experience);
          return (
            <li key={experience.id}>
              <h3 className="font-bold">
                <Line
                  label={line.role}
                  amount={experience.endDate ? `${monthsBetween(experience.startDate, experience.endDate)} mo` : "Open tab"}
                />
              </h3>
              <Sub isFaded={false}>@ {line.company}</Sub>
              <Sub>{line.meta}</Sub>
              {line.description && <Sub isFaded={false}>{line.description}</Sub>}
              {line.skills.length > 0 && <Sub>+ {line.skills.join(", ")}</Sub>}
            </li>
          );
        })}
      </ol>
      <div className="mt-5 border-t-2 border-dashed border-rc-ink pt-3">
        <Line label="Subtotal" amount={`${closedMonths} mo${hasOpenTab ? " + open tab" : ""}`} isStrong />
      </div>
    </>
  );
}
