import { skillGroupLabel } from "~/lib/labels";
import type { SkillGroup } from "~/lib/portfolio";

interface SpecSkillsProps {
  groups: SkillGroup[];
}

export function SpecSkills({ groups }: SpecSkillsProps) {
  return (
    <dl className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
      {groups.map((group) => (
        <div key={group.key}>
          <dt className="font-semibold">{skillGroupLabel(group)}</dt>
          <dd className="text-ss-muted">{group.skills.join(", ")}</dd>
        </div>
      ))}
    </dl>
  );
}
