import { useRef, useState } from "react";
import type { PointerEvent } from "react";

import type { SwipeDirection } from "~/hooks/useSwipeDeck";
import { formatRange } from "~/lib/format";
import type { Project } from "~/lib/portfolio";

const SWIPE_THRESHOLD_PX = 110;

const COVERS = [
  "radial-gradient(circle at 20% 30%, #ff4d6d 0 22%, transparent 23%), radial-gradient(circle at 80% 70%, #6ee7b7 0 30%, transparent 31%), #cdb8ff",
  "repeating-linear-gradient(-45deg, #6ee7b7 0 18px, #3d1849 18px 36px)",
  "conic-gradient(from 90deg at 40% 60%, #ff4d6d, #cdb8ff, #6ee7b7, #ff4d6d)",
  "radial-gradient(circle at 50% 120%, #ffd166 0 40%, transparent 41%), #ff4d6d",
];

interface SwipeCardProps {
  project: Project;
  company: string | null;
  depth: number;
  exitDirection: SwipeDirection | null;
  onSwipe: (direction: SwipeDirection) => void;
}

function cardTransform(depth: number, dragX: number, exitDirection: SwipeDirection | null): string {
  if (exitDirection) {
    return `translateX(${exitDirection * 140}%) rotate(${exitDirection * 24}deg)`;
  }
  if (depth === 0) {
    return `translateX(${dragX}px) rotate(${dragX / 18}deg)`;
  }
  return `translateY(${depth * 14}px) scale(${1 - depth * 0.04})`;
}

export function SwipeCard({ project, company, depth, exitDirection, onSwipe }: SwipeCardProps) {
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const isTop = depth === 0;
  const cover = project.coverUrl ? `url(${project.coverUrl}) center/cover` : COVERS[project.id % COVERS.length];
  const where = project.projectType === "WORK" ? `At ${company ?? "work"}` : "A weekend thing";

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (!isTop || (event.target as HTMLElement).closest("a")) {
      return;
    }
    startX.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  };
  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (dragging) {
      setDragX(event.clientX - startX.current);
    }
  };
  const onPointerUp = () => {
    setDragging(false);
    if (Math.abs(dragX) > SWIPE_THRESHOLD_PX) {
      onSwipe(dragX > 0 ? 1 : -1);
    }
    setDragX(0);
  };

  return (
    <article
      aria-label={project.title}
      aria-hidden={!isTop}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{ transform: cardTransform(depth, dragX, exitDirection), opacity: exitDirection ? 0 : 1 }}
      className={`absolute inset-0 flex touch-pan-y flex-col overflow-hidden rounded-[26px] bg-card text-ink select-none ${
        dragging ? "" : "transition-[transform,opacity] duration-300 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none"
      }`}
    >
      <div className="relative h-[190px] shrink-0" style={{ background: cover }}>
        <span className="absolute top-4 left-4 rounded-full bg-card px-3 py-1 text-sm font-bold">
          {project.projectType === "WORK" ? "Work" : "Personal"}
          {project.isFeatured ? ", featured" : ""}
        </span>
      </div>
      <div className="flex flex-1 flex-col px-6 py-5">
        <h3 className="text-[1.9rem] leading-[1.05] font-extrabold tracking-tight">{project.title}</h3>
        <p className="mt-1 mb-3 text-sm text-muted">
          {where}
          {project.startDate ? `, ${formatRange(project.startDate, project.endDate)}` : ""}
        </p>
        <p className="mb-3">{project.summary}</p>
        {(project.repoUrl || project.demoUrl) && (
          <p className="mb-3">
            {project.repoUrl && <a href={project.repoUrl}>See the code</a>}
            {project.repoUrl && project.demoUrl && " or "}
            {project.demoUrl && <a href={project.demoUrl}>try it</a>}
          </p>
        )}
        <ul className="mt-auto flex flex-wrap gap-1.5">
          {project.skills.map((skill) => (
            <li key={skill} className="rounded-full bg-lilac px-3 py-0.5 text-sm font-semibold">{skill}</li>
          ))}
        </ul>
      </div>
      <span
        aria-hidden="true"
        style={{ opacity: Math.max(0, dragX / 120) }}
        className="pointer-events-none absolute top-8 left-6 -rotate-[14deg] rounded-[10px] border-4 px-3 text-[2rem] font-extrabold text-mint"
      >
        Like
      </span>
      <span
        aria-hidden="true"
        style={{ opacity: Math.max(0, -dragX / 120) }}
        className="pointer-events-none absolute top-8 right-6 rotate-[14deg] rounded-[10px] border-4 px-3 text-[2rem] font-extrabold text-flame"
      >
        Nope
      </span>
    </article>
  );
}
