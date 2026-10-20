const REPEATS = 14;

export function Tape() {
  return (
    <div aria-hidden="true" className="overflow-hidden pt-5 pb-1.5">
      <div className="-mx-4 -rotate-1 overflow-hidden bg-parcel-tape py-2 font-parcel-stencil text-[1.05rem] leading-none font-black tracking-[0.12em] whitespace-nowrap text-parcel-label shadow-[0_2px_0_rgb(0_0_0/0.15)]">
        {Array.from({ length: REPEATS }, (_, i) => (
          <span key={i}>
            <span className="inline-block pr-10">FRAGILE</span>
            <span className="inline-block pr-10">HANDLE WITH CARE</span>
          </span>
        ))}
      </div>
    </div>
  );
}
