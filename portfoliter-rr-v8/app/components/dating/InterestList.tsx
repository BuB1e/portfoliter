import { skillGroupLabel } from "~/lib/labels";
import type { SkillGroup } from "~/lib/portfolio";

interface InterestListProps {
  groups: SkillGroup[];
}

// One row of interest chips per skill category, in the order the backend grouped them.
export function InterestList({ groups }: InterestListProps) {
  return (
    <div className="grid gap-5">
      {groups.map((group) => (
        <div key={group.key}>
          <h3 className="mb-2 text-[0.95rem] font-semibold opacity-75">{skillGroupLabel(group)}</h3>
          <ul className="flex flex-wrap gap-2.5">
            {group.skills.map((skill) => (
              <li key={skill} className="rounded-full border-[1.5px] border-lilac px-4 py-1.5 font-semibold">
                {skill}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
