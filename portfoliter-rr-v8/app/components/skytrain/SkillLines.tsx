import type { SkillGroup } from "~/lib/skills";
import { lineColor } from "./lines";

interface SkillLinesProps {
  groups: SkillGroup[];
}

// Each category is a line; its skills are the stops along it.
export function SkillLines({ groups }: SkillLinesProps) {
  return (
    <div className="grid gap-8">
      {groups.map((group, index) => {
        const color = lineColor(index);
        return (
          <div key={group.category}>
            <h3 className={`mb-3 inline-block rounded-md px-2.5 py-0.5 font-sky-sign text-lg font-bold text-white ${color.bg}`}>
              {group.category}
            </h3>
            <ul className="flex flex-wrap gap-y-4">
              {group.names.map((name) => (
                <li key={name} className={`relative min-w-[120px] flex-1 border-t-[6px] pt-4 pr-3 font-semibold ${color.border}`}>
                  <span
                    aria-hidden="true"
                    className={`absolute -top-[13px] left-0 size-5 rounded-full border-[5px] bg-white ${color.border}`}
                  />
                  {name}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
