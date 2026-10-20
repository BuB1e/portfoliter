import type { SkillGroup } from "~/lib/skills";

interface ContentsChecklistProps {
  groups: SkillGroup[];
}

export function ContentsChecklist({ groups }: ContentsChecklistProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6">
      {groups.map((group) => (
        <div key={group.category}>
          <h3 className="mb-2 font-parcel-stencil text-2xl leading-none font-black">{group.category}</h3>
          <ul>
            {group.names.map((name) => (
              <li key={name} className="parcel-check py-1 font-semibold">{name}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
