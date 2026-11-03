import { useEffect } from "react";

// Entrance motion for the taste-made designs. Markup marks the parts that rise into place with
// data-reveal (and a --i style for their stagger step). Nothing is hidden until this hook runs, so the
// page reads fully without JavaScript: on mount it shows what is already on screen, then switches the
// page into reveal mode, and each later part is shown once as it scrolls into view.
export function useReveal() {
  useEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      return;
    }

    const parts = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
    const show = (part: HTMLElement) => part.setAttribute("data-shown", "");
    parts.filter((part) => part.getBoundingClientRect().top < window.innerHeight).forEach(show);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            show(entry.target as HTMLElement);
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    parts.filter((part) => !part.hasAttribute("data-shown")).forEach((part) => observer.observe(part));
    root.setAttribute("data-reveal", "on");

    return () => {
      observer.disconnect();
      root.removeAttribute("data-reveal");
    };
  }, []);
}
