import { useState } from "react";

import type { PortfolioView } from "~/lib/portfolio";
import { CITATION_FORMATS, type CitationFormat, citation } from "./citation";

type CopyState = "idle" | "copied" | "failed";

const COPY_LABELS: Record<CopyState, string> = {
  idle: "Copy citation",
  copied: "Copied",
  failed: "Select and copy it by hand",
};

// The live thing: cite this engineer. Pick a format and copy it. The citation is real text in a code
// block, so without JavaScript it can still be selected and copied by hand.
export function CiteThis({ view }: { view: PortfolioView }) {
  const [format, setFormat] = useState<CitationFormat>("bibtex");
  const [copy, setCopy] = useState<CopyState>("idle");
  const text = citation(view, format);

  const choose = (next: CitationFormat) => {
    setFormat(next);
    setCopy("idle");
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopy("copied");
    } catch {
      setCopy("failed");
    }
  };

  return (
    <div className="pp-cite">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Citation format" className="flex gap-1">
          {CITATION_FORMATS.map((option) => (
            <button key={option.key} type="button" aria-pressed={format === option.key} onClick={() => choose(option.key)} className="pp-chip">
              {option.label}
            </button>
          ))}
        </div>
        <button type="button" onClick={copyText} className="pp-button">
          {COPY_LABELS[copy]}
        </button>
      </div>
      <pre className="mt-3">
        <code>{text}</code>
      </pre>
      <p aria-live="polite" className="sr-only">
        {copy === "copied" ? "Citation copied" : ""}
      </p>
    </div>
  );
}
