import { formatRange } from "~/lib/format";
import type { Experience } from "~/lib/portfolio";
import { ContentsTags } from "./ContentsTags";

interface TrackingHistoryProps {
  experiences: Experience[];
}

export function TrackingHistory({ experiences }: TrackingHistoryProps) {
  return (
    <ol className="border-[3px] border-parcel-ink bg-parcel-label">
      {experiences.map((experience) => (
        <li key={experience.id} className="grid border-b-2 border-parcel-ink last:border-b-0 sm:grid-cols-[180px_1fr]">
          <div className="border-b border-dashed border-parcel-ink p-5 pb-2.5 sm:border-r-2 sm:border-b-0 sm:border-solid sm:pb-5">
            <span className={`font-parcel-stencil text-[1.25rem] leading-none font-black ${experience.endDate ? "" : "text-parcel-tape"}`}>
              {experience.endDate ? "Delivered" : "In transit"}
            </span>
            <span className="mt-1.5 block text-[0.9rem] font-semibold font-stretch-80%">
              {formatRange(experience.startDate, experience.endDate)}
            </span>
          </div>
          <div className="px-6 py-5">
            <h3 className="text-[1.3rem] font-extrabold">{experience.company}</h3>
            <p className="mb-2 font-stretch-85%">
              {experience.role}
              {experience.location ? `, ${experience.location}` : ""}
            </p>
            {experience.description && <p className="mb-3 max-w-[62ch]">{experience.description}</p>}
            <ContentsTags label="Skills used" items={experience.skills} />
          </div>
        </li>
      ))}
    </ol>
  );
}
