import { skillGroupLabel } from "~/lib/labels";
import type { SkillGroup } from "~/lib/portfolio";

// "Contents": one giant word across a reading column, then one filled bar per skill group that opens in
// place. The first bar starts open; every skill is in the markup either way.
export function Contents({ groups, id }: { groups: SkillGroup[]; id: string }) {
  return (
    <section aria-labelledby={id} className="pn-section pn-wrap">
      <div className="mx-auto max-w-[680px]">
        <h2 id={id} data-reveal="" className="pn-display">
          Contents
        </h2>
        <p data-reveal="" style={{ "--i": 1 } as React.CSSProperties} className="mt-5 mb-8">
          Checked at the warehouse. Open a bar to see each item in it.
        </p>
        <div className="flex flex-col gap-1.5">
          {groups.map((group, index) => (
            <details
              key={group.key}
              open={index === 0}
              data-reveal=""
              style={{ "--i": index + 2 } as React.CSSProperties}
              className="pn-bar bg-pn-kraft-light"
            >
              <summary>
                <span>{skillGroupLabel(group)}</span>
                <span className="flex items-center gap-4">
                  <span className="pn-small font-normal text-pn-ink-soft">
                    {group.skills.length} {group.skills.length === 1 ? "item" : "items"}
                  </span>
                  <span aria-hidden="true" className="pn-plus pn-lead leading-none">
                    +
                  </span>
                </span>
              </summary>
              <ul className="flex flex-wrap gap-x-6 gap-y-2 px-[18px] pt-2 pb-6">
                {group.skills.map((skill) => (
                  <li key={skill} className="font-semibold">
                    {skill}
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
