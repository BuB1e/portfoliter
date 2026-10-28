import { useId, useRef, useState } from "react";
import type { MouseEvent, PointerEvent } from "react";
import { Link } from "react-router";

import type { SwipeDirection } from "~/hooks/useSwipeDeck";
import type { Education, Experience, Project, ProjectType } from "~/lib/portfolio";
import { projectDates, projectPath, shortDescription } from "~/lib/projects";

const SWIPE_THRESHOLD_PX = 110;
// Movement below this is a tap (opens the project); above it the card starts to drag.
const DRAG_START_PX = 8;

const COVERS = [
  "radial-gradient(circle at 20% 30%, #ff4d6d 0 22%, transparent 23%), radial-gradient(circle at 80% 70%, #6ee7b7 0 30%, transparent 31%), #cdb8ff",
  "repeating-linear-gradient(-45deg, #6ee7b7 0 18px, #3d1849 18px 36px)",
  "conic-gradient(from 90deg at 40% 60%, #ff4d6d, #cdb8ff, #6ee7b7, #ff4d6d)",
  "radial-gradient(circle at 50% 120%, #ffd166 0 40%, transparent 41%), #ff4d6d",
];

export const TYPE_CHIPS: Record<ProjectType, string> = {
  WORK: "Work",
  PERSONAL: "Personal",
  UNIVERSITY: "University",
};

export function datingCover(project: Project): string {
  return project.coverUrl ? `url(${project.coverUrl}) center/cover` : COVERS[project.id % COVERS.length];
}

// Where we met, in the deck's voice.
export function metAt(project: Project, experience: Experience | null, education: Education | null): string {
  if (project.projectType === "WORK") {
    return `At ${experience?.company ?? "work"}`;
  }
  if (project.projectType === "UNIVERSITY") {
    return `At ${education?.institution ?? "uni"}`;
  }
  return "A weekend thing";
}

interface SwipeCardProps {
  project: Project;
  origin: string;
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

// The whole card is a link to the project page. A tap opens it; a horizontal drag swipes instead,
// and the click that ends a drag is swallowed so swiping never navigates.
export function SwipeCard({ project, origin, depth, exitDirection, onSwipe }: SwipeCardProps) {
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef<number | null>(null);
  const justDragged = useRef(false);
  const titleId = useId();
  const descriptionId = useId();
  const isTop = depth === 0;
  const dates = projectDates(project);

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (isTop) {
      startX.current = event.clientX;
      justDragged.current = false;
    }
  };
  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (startX.current === null) {
      return;
    }
    const dx = event.clientX - startX.current;
    if (!dragging) {
      if (Math.abs(dx) < DRAG_START_PX) {
        return;
      }
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
    }
    setDragX(dx);
  };
  const onPointerUp = () => {
    if (dragging) {
      justDragged.current = true;
      if (Math.abs(dragX) > SWIPE_THRESHOLD_PX) {
        onSwipe(dragX > 0 ? 1 : -1);
      }
    }
    startX.current = null;
    setDragging(false);
    setDragX(0);
  };
  const onClickCapture = (event: MouseEvent<HTMLElement>) => {
    if (justDragged.current) {
      event.preventDefault();
      event.stopPropagation();
      justDragged.current = false;
    }
  };

  return (
    <article
      inert={!isTop}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClickCapture={onClickCapture}
      style={{ transform: cardTransform(depth, dragX, exitDirection), opacity: exitDirection ? 0 : 1 }}
      className={`absolute inset-0 touch-pan-y rounded-[26px] bg-card text-ink select-none ${
        dragging ? "" : "transition-[transform,opacity] duration-300 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none"
      }`}
    >
      <Link
        to={projectPath(project.slug)}
        draggable={false}
        aria-labelledby={titleId}
        aria-describedby={project.summary ? descriptionId : undefined}
        className="group flex h-full flex-col rounded-[26px] no-underline"
      >
        <div className="relative h-[170px] shrink-0 rounded-t-[26px]" style={{ background: datingCover(project) }}>
          <span className="absolute top-4 left-4 rounded-full bg-card px-3 py-1 text-sm font-bold">
            {TYPE_CHIPS[project.projectType]}
            {project.isFeatured ? ", featured" : ""}
          </span>
        </div>
        <div className="flex min-h-0 flex-1 flex-col px-6 py-5">
          <h3 id={titleId} className="text-[1.8rem] leading-[1.05] font-extrabold tracking-tight group-hover:underline">
            {project.title}
          </h3>
          <p className="mt-1 mb-3 text-sm text-muted">
            {origin}
            {dates ? `, ${dates}` : ""}
          </p>
          {project.summary && (
            <p id={descriptionId} className="mb-3 line-clamp-4">
              {shortDescription(project.summary)}
            </p>
          )}
          <span aria-hidden="true" className="mt-auto self-start rounded-full bg-ink px-4 py-1.5 text-sm font-bold text-card">
            View full profile
          </span>
        </div>
      </Link>
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
