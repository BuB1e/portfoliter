import type { KeyboardEvent } from "react";

import { useSwipeDeck } from "~/hooks/useSwipeDeck";
import type { Education, Experience, Project } from "~/lib/portfolio";
import { findEducation, findExperience } from "~/lib/projects";
import { MatchDialog } from "./MatchDialog";
import { metAt, SwipeCard } from "./SwipeCard";

const VISIBLE_CARDS = 3;

interface ProjectDeckProps {
  projects: Project[];
  experiences: Experience[];
  education: Education[];
  ownerFirstName: string;
  email: string | null;
}

export function ProjectDeck({ projects, experiences, education, ownerFirstName, email }: ProjectDeckProps) {
  const { queue, exiting, match, swipe, restart, closeMatch } = useSwipeDeck(projects);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") swipe(1);
    if (event.key === "ArrowLeft") swipe(-1);
  };

  return (
    <div className="grid justify-items-center gap-5">
      <div
        tabIndex={0}
        onKeyDown={onKeyDown}
        aria-label="Project cards. Use the left and right arrow keys to swipe, Tab and Enter to open the top card."
        className="relative h-[460px] w-full max-w-[420px] rounded-[26px]"
      >
        {queue.length === 0 ? (
          <div className="absolute inset-0 grid place-content-center gap-4 rounded-[26px] border-2 border-dashed border-lilac p-8 text-center">
            <p className="text-xl font-semibold">That's every project. You've seen more of my code than my manager.</p>
            <button type="button" onClick={restart} className="mx-auto cursor-pointer rounded-full bg-flame px-4 py-2.5 font-bold text-white">
              Start over
            </button>
          </div>
        ) : (
          queue
            .slice(0, VISIBLE_CARDS)
            .map((project, depth) => (
              <SwipeCard
                key={project.id}
                project={project}
                origin={metAt(project, findExperience(project, experiences), findEducation(project, education))}
                depth={depth}
                exitDirection={exiting?.id === project.id ? exiting.direction : null}
                onSwipe={swipe}
              />
            ))
            .reverse()
        )}
      </div>

      <div className="flex gap-6">
        <button
          type="button"
          onClick={() => swipe(-1)}
          aria-label="Pass on this project"
          disabled={queue.length === 0}
          className="grid size-16 cursor-pointer place-items-center rounded-full bg-night-raised text-[1.7rem] text-flame transition-transform active:scale-90 disabled:opacity-40"
        >
          <span aria-hidden="true">✕</span>
        </button>
        <button
          type="button"
          onClick={() => swipe(1)}
          aria-label="Like this project"
          disabled={queue.length === 0}
          className="grid size-16 cursor-pointer place-items-center rounded-full bg-flame text-[1.7rem] text-white transition-transform active:scale-90 disabled:opacity-40"
        >
          <span aria-hidden="true">♥</span>
        </button>
      </div>
      <p className="text-center text-sm opacity-70">Drag to swipe, tap a card to see the whole project.</p>

      <MatchDialog project={match} ownerFirstName={ownerFirstName} email={email} onClose={closeMatch} />
    </div>
  );
}
