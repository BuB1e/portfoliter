import { useState } from "react";

// [pops needed, message]; the highest reached threshold wins.
const POP_LINES: [number, string][] = [
  [1, "One down. Very professional."],
  [5, "5 bubbles popped. That's a sprint's worth of focus."],
  [12, "12. You could have read a whole project by now."],
  [25, "25 popped. We should talk about your hiring pipeline."],
  [40, "All of them. Hire me and I'll bring more."],
];

export function useBubbleWrap(count: number) {
  const [popped, setPopped] = useState<boolean[]>(() => Array(count).fill(false));

  const pop = (index: number) =>
    setPopped((current) => current.map((isPopped, i) => isPopped || i === index));

  const total = popped.filter(Boolean).length;
  const message = POP_LINES.filter(([threshold]) => total >= threshold).at(-1)?.[1] ?? "";

  return { popped, pop, message };
}
