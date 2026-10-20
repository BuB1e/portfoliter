import { useBubbleWrap } from "~/hooks/useBubbleWrap";

const BUBBLES = 40;

export function BubbleWrap() {
  const { popped, pop, message } = useBubbleWrap(BUBBLES);

  return (
    <>
      <div className="grid grid-cols-8 gap-2 border-2 border-white/70 bg-[rgb(232_244_250/0.55)] p-3 backdrop-blur-[2px] sm:grid-cols-10 sm:gap-3 sm:p-5">
        {popped.map((isPopped, i) => (
          <button
            key={i}
            type="button"
            disabled={isPopped}
            onClick={() => pop(i)}
            aria-label={isPopped ? "Popped" : `Pop bubble ${i + 1}`}
            className={`aspect-square rounded-full transition-transform duration-[120ms] ease-out motion-reduce:transition-none ${
              isPopped ? "parcel-bubble-popped scale-[0.82]" : "parcel-bubble cursor-pointer hover:scale-[1.06]"
            }`}
          />
        ))}
      </div>
      <p aria-live="polite" className="mt-4 min-h-[1.6em] font-bold">
        {message}
      </p>
    </>
  );
}
