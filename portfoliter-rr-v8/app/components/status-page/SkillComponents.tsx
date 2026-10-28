import type { SkillGroup } from "~/lib/skills";
import { StatusPill } from "./StatusPill";
import { UPTIME_DAYS, uptimeDays, uptimePercent } from "./uptime";

interface SkillComponentsProps {
  groups: SkillGroup[];
}

// Phones show the last 30 days so the bars stay wide enough to read.
const MOBILE_DAYS = 30;

function UptimeRow({ name }: { name: string }) {
  const days = uptimeDays(name);
  const percent = uptimePercent(days);
  return (
    <li className="px-5 py-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="font-medium">{name}</span>
        <span className="text-sm font-medium text-st-up">Operational</span>
      </div>
      <div role="img" aria-label={`${name}: ${percent} uptime over ${UPTIME_DAYS} days`} className="flex h-8 gap-[2px]">
        {days.map((day, index) => (
          <span
            key={index}
            title={day.isDegraded ? `Degraded: ${day.reason}` : "No incidents"}
            className={`flex-1 rounded-[2px] ${day.isDegraded ? "bg-st-warn" : "bg-st-up"} ${
              index < UPTIME_DAYS - MOBILE_DAYS ? "hidden sm:block" : ""
            }`}
          />
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-xs text-st-muted">
        <span>
          <span className="sm:hidden">{MOBILE_DAYS}</span>
          <span className="hidden sm:inline">{UPTIME_DAYS}</span> days ago
        </span>
        <span>{percent} uptime</span>
        <span>Today</span>
      </div>
    </li>
  );
}

export function SkillComponents({ groups }: SkillComponentsProps) {
  return (
    <div className="divide-y divide-st-line">
      {groups.map((group) => (
        <div key={group.category}>
          <div className="flex items-center justify-between gap-3 bg-st-bg/60 px-5 py-3">
            <h3 className="font-semibold">{group.category}</h3>
            <StatusPill tone="up" label="Operational" />
          </div>
          <ul className="divide-y divide-st-line">
            {group.names.map((name) => (
              <UptimeRow key={name} name={name} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
