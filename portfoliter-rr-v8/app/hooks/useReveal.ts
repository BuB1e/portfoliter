import { useEffect } from "react";

// How far up the screen a part's top must come before it rises into place.
const SHOW_LINE = 0.92;

// Entrance motion for the taste-made designs. Markup marks the parts that rise into place with
// data-reveal (and a --i style for their stagger step). Nothing is hidden until this hook runs, so the
// page reads fully without JavaScript: on mount it shows what is already on screen, then switches the
// page into reveal mode, and each later part is shown once its top passes the show line. Parts above the
// line are always shown, so a jump to the end of the page (a link, the End key) never leaves anything hidden.
export function useReveal() {
  useEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let waiting = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
    let frame = 0;

    const update = () => {
      frame = 0;
      const line = window.innerHeight * SHOW_LINE;
      waiting = waiting.filter((part) => {
        if (part.getBoundingClientRect().top < line) {
          part.setAttribute("data-shown", "");
          return false;
        }
        return true;
      });
      if (waiting.length === 0) {
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
      }
    };
    const schedule = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(update);
      }
    };

    update();
    root.setAttribute("data-reveal", "on");
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      root.removeAttribute("data-reveal");
    };
  }, []);
}
