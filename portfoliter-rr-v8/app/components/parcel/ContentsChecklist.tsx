import { skillGroupLabel } from "~/lib/labels";
import type { SkillGroup } from "~/lib/portfolio";

interface ContentsChecklistProps {
  groups: SkillGroup[];
}

export function ContentsChecklist({ groups }: ContentsChecklistProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6">
      {groups.map((group) => (
        <div key={group.key}>
          <h3 className="mb-2 font-parcel-stencil text-2xl leading-none font-black">{skillGroupLabel(group)}</h3>
          <ul>
            {group.skills.map((name) => (
              <li key={name} className="parcel-check py-1 font-semibold">
                {name}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
