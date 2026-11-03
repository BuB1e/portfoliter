import { useEffect, useState } from "react";

export interface BoxPhoto {
  src: string;
  alt: string;
}

const HOLD_MS = 5600;

// The principal photograph: the sender first, then what is in the box, crossfading every few seconds.
// The server renders the first one showing; the cycle starts only in the browser, pauses while the tab is
// hidden and never runs under reduced motion. With no photographs at all, `fallback` fills the frame.
export function BoxPhotos({ photos, fallback, className }: { photos: BoxPhoto[]; fallback: React.ReactNode; className?: string }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (photos.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const timer = window.setInterval(() => {
      if (!document.hidden) {
        setActive((current) => (current + 1) % photos.length);
      }
    }, HOLD_MS);
    return () => window.clearInterval(timer);
  }, [photos.length]);

  return (
    <div className={`pn-photos ${className ?? ""}`}>
      {photos.length === 0
        ? fallback
        : photos.map((photo, index) => (
            <img key={photo.src} src={photo.src} alt={photo.alt} data-active={index === active ? "" : undefined} />
          ))}
    </div>
  );
}
