import { certificationLine } from "~/lib/fields";
import type { Certification } from "~/lib/portfolio";

// The customs declaration as a coupon: the heading on the stub, each certification on the main part,
// with notches and a dotted perforation between them.
export function Customs({ certifications, id }: { certifications: Certification[]; id: string }) {
  return (
    <section aria-labelledby={id} className="pn-section pn-wrap">
      <div data-reveal="" className="pn-coupon mx-auto grid max-w-[1200px] bg-pn-ink text-pn-paper md:grid-cols-[42%_58%]">
        <div className="flex flex-col justify-between gap-8 p-8 sm:p-12">
          <h2 id={id} className="pn-heading">
            Customs declaration
          </h2>
          <p className="max-w-[34ch]">Paperwork, so this engineer clears the border. Keep this half for your records.</p>
        </div>
        <ul className="pn-perforation flex flex-col gap-2.5 p-8 sm:p-12">
          {certifications.map((cert) => {
            const line = certificationLine(cert);
            return (
              <li key={cert.id} className="bg-pn-ink-soft px-5 py-4">
                <p className="text-[1.375rem] leading-tight font-bold">
                  {line.credentialUrl ? (
                    <a href={line.credentialUrl} className="pn-link">
                      {line.name}
                    </a>
                  ) : (
                    line.name
                  )}
                </p>
                <p className="pn-small mt-1 text-pn-paper-deep">{line.meta}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
