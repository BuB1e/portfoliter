import type { Profile } from "~/lib/portfolio";
import { EngineerFigure } from "./EngineerFigure";

interface SpecimenPlateProps {
  profile: Profile;
  currentCompany: string | null;
}

export function SpecimenPlate({ profile, currentCompany }: SpecimenPlateProps) {
  const marks: [string, string][] = [
    ["Habitat", `${profile.location ?? "Somewhere"}, usually indoors near a power outlet`],
    ["Territory", currentCompany ? `Currently nesting at ${currentCompany}` : "Between territories"],
    ["Call", "A short, rising \"it works on my machine\""],
    ...(profile.bio ? [["Behaviour", profile.bio] as [string, string]] : []),
    ["Status", "Least concern, unless the coffee machine breaks"],
  ];

  return (
    <header className="grid items-center gap-8 pt-8 pb-12 md:grid-cols-[1fr_1.05fr] md:gap-12 md:pt-14">
      <div>
        <h1 className="font-fg-serif text-[clamp(3rem,7.5vw,5.6rem)] leading-[0.95] font-semibold tracking-[-0.02em]">
          {profile.fullName}
        </h1>
        <p className="mt-2.5 mb-6 font-fg-serif text-[clamp(1.4rem,2.6vw,2rem)] leading-tight text-fg-moss italic">
          Programmator bangkokensis
        </p>
        <p className="mb-8 max-w-[40ch] font-fg-serif text-xl leading-normal">{profile.headline}</p>
        <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2">
          {marks.map(([term, detail]) => (
            <div key={term} className="contents">
              <dt className="font-semibold">{term}</dt>
              <dd>{detail}</dd>
            </div>
          ))}
        </dl>
      </div>
      <figure className="border-[1.5px] border-fg-pine bg-fg-paper p-4">
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt={`Photo of ${profile.fullName}`} className="block w-full" />
        ) : (
          <EngineerFigure />
        )}
        <figcaption className="mt-2.5 text-center font-fg-serif text-[0.95rem] leading-snug italic">
          Adult in typical working posture. Observed between 10 a.m. and late.
        </figcaption>
      </figure>
    </header>
  );
}
