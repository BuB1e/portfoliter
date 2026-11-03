import { useBubbleWrap } from "~/hooks/useBubbleWrap";
import type { Profile } from "~/lib/portfolio";

const BUBBLES = 40;

// The live thing: a sheet of bubble wrap to pop. Each bubble is a toggle button, so it works by mouse,
// thumb or keyboard; without JavaScript the sheet simply sits there whole.
function BubbleWrap() {
  const { popped, pop, message } = useBubbleWrap(BUBBLES);
  const count = popped.filter(Boolean).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-8 gap-2 bg-pn-kraft-deep p-4 sm:gap-3 sm:p-6">
        {popped.map((isPopped, i) => (
          <button
            key={i}
            type="button"
            aria-pressed={isPopped}
            aria-label={isPopped ? `Bubble ${i + 1}, popped` : `Pop bubble ${i + 1}`}
            onClick={() => pop(i)}
            className="pn-bubble"
          />
        ))}
      </div>
      <p aria-live="polite" className="min-h-[1.6em] font-bold">
        {message || `${BUBBLES - count} bubbles left. Go on.`}
      </p>
    </div>
  );
}

// The note tucked into the box: the bio as a letter on a scalloped sheet, signed by the sender, beside the
// free bubble wrap. With no bio the sheet carries only the signature.
export function PackingNote({ profile, id }: { profile: Profile; id: string }) {
  const paragraphs = profile.bio.split(/\n\s*\n/).filter((text) => text.trim());

  return (
    <section aria-labelledby={id} className="pn-section pn-wrap grid items-start gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <div data-reveal="" className="pn-scallop-bottom bg-pn-paper px-6 pt-10 pb-16 sm:px-14 sm:pt-14">
        <h2 id={id} className="pn-heading">
          A note from the sender
        </h2>
        <div className="mt-8 flex max-w-[62ch] flex-col gap-5">
          {paragraphs.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </div>
        <p className="mt-10 text-[1.375rem] font-bold">{profile.fullName}</p>
        <p className="pn-small text-pn-ink-soft">Packed and shipped by hand</p>
      </div>

      <div data-reveal="" style={{ "--i": 2 } as React.CSSProperties}>
        <h3 className="pn-heading">Free bubble wrap</h3>
        <p className="mt-4 mb-6 max-w-[40ch]">Included with every engineer. Pop a few while you read; nobody is counting except this page.</p>
        <BubbleWrap />
      </div>
    </section>
  );
}
