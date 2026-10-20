import { useEffect, useRef } from "react";

import type { Project } from "~/lib/portfolio";

interface MatchDialogProps {
  project: Project | null;
  ownerFirstName: string;
  email: string | null;
  onClose: () => void;
}

// Native <dialog> gives focus trapping and Escape-to-close for free.
export function MatchDialog({ project, ownerFirstName, email, onClose }: MatchDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (project && dialog && !dialog.open) {
      dialog.showModal();
    }
  }, [project]);

  const close = () => {
    ref.current?.close();
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="match-title"
      className="m-auto max-w-xl bg-transparent p-8 text-center text-card backdrop:bg-ink/90"
    >
      {project && (
        <>
          <h2
            id="match-title"
            className="animate-match-pop text-[clamp(3rem,10vw,6rem)] leading-[0.9] font-extrabold tracking-tighter text-mint [font-stretch:75%] motion-reduce:animate-none"
          >
            It's a match
          </h2>
          <p className="mx-auto mt-4 mb-6 max-w-[36ch] text-xl">
            You liked {project.title}, and {ownerFirstName} liked you back. Statistically, this never happens.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {email && (
              <a
                href={`mailto:${email}?subject=${encodeURIComponent(`We matched on ${project.title}`)}`}
                className="rounded-full bg-flame px-4 py-2.5 font-bold text-white no-underline"
              >
                Send a message
              </a>
            )}
            <button type="button" onClick={close} className="cursor-pointer rounded-full border-[1.5px] border-card px-4 py-2.5 font-bold">
              Keep swiping
            </button>
          </div>
        </>
      )}
    </dialog>
  );
}
