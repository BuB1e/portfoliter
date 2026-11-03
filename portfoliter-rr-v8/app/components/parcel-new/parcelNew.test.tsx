import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { makeSampleView } from "~/test-utils/sampleView";
import { barcodeBars, barcodeWidth } from "./Barcode";
import { PackingNote } from "./PackingNote";

describe("parcel-new bubble wrap", () => {
  it("renders a whole sheet of poppable bubbles without JavaScript", () => {
    const html = renderToStaticMarkup(<PackingNote profile={makeSampleView().profile} id="note-title" />);

    expect(html.match(/<button/g)).toHaveLength(40);
    expect(html.match(/aria-pressed="false"/g)).toHaveLength(40);
    expect(html).not.toContain('aria-pressed="true"');
    expect(html).toContain('aria-label="Pop bubble 1"');
    expect(html).toContain("40 bubbles left. Go on.");
  });

  it("prints the bio as the sender's note, one paragraph per blank line", () => {
    const profile = { ...makeSampleView().profile, bio: "First part.\n\nSecond part." };

    const html = renderToStaticMarkup(<PackingNote profile={profile} id="note-title" />);

    expect(html).toContain("<p>First part.</p>");
    expect(html).toContain("<p>Second part.</p>");
  });
});

describe("parcel-new barcode", () => {
  it("draws the same bars for the same tracking number", () => {
    expect(barcodeBars("BUB1E-2025")).toEqual(barcodeBars("BUB1E-2025"));
  });

  it("draws different bars for a different number, and never overlaps two bars", () => {
    const bars = barcodeBars("JANEDOE-2023");

    expect(bars).not.toEqual(barcodeBars("JANEDOE-2024"));
    for (let i = 1; i < bars.length; i++) {
      expect(bars[i].x).toBeGreaterThan(bars[i - 1].x + bars[i - 1].width - 1);
    }
    expect(barcodeWidth("JANEDOE-2023")).toBe(bars.at(-1)!.x + bars.at(-1)!.width);
  });
});
