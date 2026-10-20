import type { SkillGroup } from "~/lib/skills";

interface DietProps {
  groups: SkillGroup[];
}

export function Diet({ groups }: DietProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-6">
      {groups.map((group) => (
        <div key={group.category} className="border-t-[3px] border-fg-pine pt-3">
          <h3 className="mb-1.5 font-fg-serif text-[1.3rem] font-semibold italic">{group.category}</h3>
          <ul>
            {group.names.map((name) => (
              <li key={name} className="py-0.5">{name}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
