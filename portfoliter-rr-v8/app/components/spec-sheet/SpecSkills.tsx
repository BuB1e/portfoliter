import type { SkillGroup } from "~/lib/skills";

interface SpecSkillsProps {
  groups: SkillGroup[];
}

export function SpecSkills({ groups }: SpecSkillsProps) {
  return (
    <dl className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
      {groups.map((group) => (
        <div key={group.category}>
          <dt className="font-semibold">{group.category}</dt>
          <dd className="text-ss-muted">{group.names.join(", ")}</dd>
        </div>
      ))}
    </dl>
  );
}
