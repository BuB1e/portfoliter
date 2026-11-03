import { useEffect, useState } from "react";

export type WalkDirection = "next" | "previous";

// A part of the page counts as reached once its top is this far above the viewport's middle, so the
// exhibit the visitor stands in front of is never the one the walk goes to next.
const STANDING_SLACK = 24;

// Which exhibit the walk goes to: tops are each exhibit's top relative to the viewport's middle, in page
// order. Next is the first one still ahead; previous is the last one already passed (the one standing in
// front of the visitor does not count). Null at either end of the show.
export function walkTarget(tops: number[], direction: WalkDirection): number | null {
  if (direction === "next") {
    const index = tops.findIndex((top) => top > STANDING_SLACK);
    return index === -1 ? null : index;
  }
  const passed = tops.map((top, index) => ({ top, index })).filter(({ top }) => top < -STANDING_SLACK);
  return passed.length > 1 ? passed[passed.length - 2].index : passed.length === 1 ? passed[0].index : null;
}

function isTyping(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
}

// The keyboard walk: the right and left arrow keys move from exhibit to exhibit ([data-exhibit]), centring
// it and moving focus to its wall label's link, so the show can be walked without scrolling by hand.
export function useExhibitWalk() {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.key !== "ArrowRight" && event.key !== "ArrowLeft") || event.altKey || event.ctrlKey || event.metaKey || isTyping(event.target)) {
        return;
      }
      const exhibits = [...document.querySelectorAll<HTMLElement>("[data-exhibit]")];
      const middle = window.innerHeight / 2;
      const target = walkTarget(
        exhibits.map((exhibit) => exhibit.getBoundingClientRect().top - middle),
        event.key === "ArrowRight" ? "next" : "previous",
      );
      if (target === null) {
        return;
      }
      event.preventDefault();
      const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      exhibits[target].scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "center" });
      exhibits[target].querySelector<HTMLElement>(".ex-exhibit-link")?.focus({ preventScroll: true });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

// The room the visitor is in: the last room whose top has passed the viewport's middle. Null before the
// first room, so the floor plan marks no room on the title screen.
export function useCurrentRoom(roomIds: string[]): string | null {
  const [current, setCurrent] = useState<string | null>(null);
  const key = roomIds.join(" ");

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const middle = window.innerHeight / 2;
      const passed = key
        .split(" ")
        .filter(Boolean)
        .filter((id) => {
          const room = document.getElementById(id);
          return room !== null && room.getBoundingClientRect().top < middle;
        });
      setCurrent(passed.at(-1) ?? null);
    };
    const schedule = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
    };
  }, [key]);

  return current;
}
