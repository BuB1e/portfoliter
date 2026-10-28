import type { Skill } from "~/lib/portfolio";

interface InterestListProps {
  skills: Skill[];
}

export function InterestList({ skills }: InterestListProps) {
  return (
    <ul className="flex flex-wrap gap-2.5">
      {skills.map((skill) => (
        <li key={skill.name} className="rounded-full border-[1.5px] border-lilac px-4 py-1.5 font-semibold">
          {skill.name}
          {skill.category && <small className="ml-1.5 font-normal opacity-65">{skill.category}</small>}
        </li>
      ))}
    </ul>
  );
}
