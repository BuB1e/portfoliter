import { useCallback, useRef, useState } from "react";

export type SwipeDirection = -1 | 1;

const EXIT_MS = 300;

interface Exiting {
  id: number;
  direction: SwipeDirection;
}

// Holds the deck order, the card currently flying out, and the first-like "match".
export function useSwipeDeck<T extends { id: number }>(items: T[]) {
  const [queue, setQueue] = useState(items);
  const [exiting, setExiting] = useState<Exiting | null>(null);
  const [match, setMatch] = useState<T | null>(null);
  const likes = useRef(0);

  const swipe = useCallback(
    (direction: SwipeDirection) => {
      const top = queue[0];
      if (!top || exiting) {
        return;
      }
      setExiting({ id: top.id, direction });
      if (direction === 1) {
        likes.current += 1;
        if (likes.current === 1) {
          setMatch(top);
        }
      }
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.setTimeout(() => {
        setQueue((current) => current.slice(1));
        setExiting(null);
      }, reduceMotion ? 0 : EXIT_MS);
    },
    [queue, exiting],
  );

  const restart = useCallback(() => setQueue(items), [items]);
  const closeMatch = useCallback(() => setMatch(null), []);

  return { queue, exiting, match, swipe, restart, closeMatch };
}
