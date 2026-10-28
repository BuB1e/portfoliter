import { Avatar } from "~/components/shared/Avatar";
import type { Profile } from "~/lib/portfolio";

interface ShippingLabelProps {
  profile: Profile;
  trackingNumber: string;
}

// Left-column fields draw the divider between the two label columns.
function Field({ name, value, isLeft = false }: { name: string; value: string; isLeft?: boolean }) {
  return (
    <div className={`border-b-2 border-parcel-ink px-6 py-5 ${isLeft ? "sm:border-r-2" : ""}`}>
      <div className="text-[0.8rem] font-bold font-stretch-75%">{name}</div>
      <div className="text-[1.05rem]">{value}</div>
    </div>
  );
}

export function ShippingLabel({ profile, trackingNumber }: ShippingLabelProps) {
  return (
    <header
      aria-label="Shipping label"
      className="relative mt-12 mr-1.5 grid -rotate-[0.6deg] border-[3px] border-parcel-ink bg-parcel-label shadow-[6px_7px_0_var(--color-parcel-kraft-dark)] sm:mr-0 sm:-rotate-[1.2deg] sm:grid-cols-2 sm:shadow-[10px_12px_0_var(--color-parcel-kraft-dark)]"
    >
      <Field name="Ship to" value="You, the person hiring" isLeft />
      <Field name="From" value={profile.location ?? "Somewhere with good coffee"} />
      <div className="flex flex-col gap-5 border-b-2 border-parcel-ink px-6 pt-6 pb-5 sm:col-span-2 sm:flex-row sm:items-start">
        {/* The sender's photo, clipped to the label like an ID card; initials stamped on kraft when there is none. */}
        <Avatar
          url={profile.avatarUrl}
          name={profile.fullName}
          className="size-28 flex-none rotate-[-3deg] border-2 border-parcel-ink object-cover shadow-[3px_3px_0_var(--color-parcel-kraft-dark)] sm:size-32"
          fallbackClassName="grid size-28 flex-none rotate-[-3deg] place-items-center border-2 border-parcel-ink bg-parcel-box font-parcel-stencil text-5xl font-black shadow-[3px_3px_0_var(--color-parcel-kraft-dark)] sm:size-32"
        />
        <div className="min-w-0">
          <h1 className="font-parcel-stencil text-[clamp(3.4rem,11vw,7.5rem)] leading-[0.85] font-black tracking-[-0.01em]">
            {profile.fullName}
          </h1>
          <p className="mt-3.5 max-w-[46ch] text-xl font-stretch-95%">{profile.headline}</p>
        </div>
      </div>
      <Field name="Contents" value="1 engineer, fully assembled" isLeft />
      <Field name="Weight" value="Mostly coffee" />
      <div className="flex items-center gap-6 px-6 py-5 sm:col-span-2">
        <div aria-hidden="true" className="parcel-barcode h-16 flex-1" />
        <div className="text-lg font-bold font-stretch-70%">{trackingNumber}</div>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none mx-6 mb-5 -rotate-3 justify-self-start border-4 border-parcel-tape px-3.5 pt-1.5 pb-2 text-center font-parcel-stencil text-[1.9rem] leading-none font-black text-parcel-tape opacity-90 mix-blend-multiply sm:absolute sm:top-[38%] sm:right-[4%] sm:m-0 sm:rotate-[9deg]"
      >
        Fragile
        <small className="mt-1 block font-parcel-body text-[0.8rem] leading-tight font-bold">contains code and feelings</small>
      </div>
    </header>
  );
}
