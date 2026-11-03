// A barcode drawn from the tracking number: each character sets the widths of its bars and gaps, so the
// same label always prints the same code. Decorative; the number itself is printed beside it.
export function barcodeBars(code: string): { x: number; width: number }[] {
  const bars: { x: number; width: number }[] = [];
  let x = 0;
  for (const char of `*${code}*`) {
    const value = char.charCodeAt(0);
    for (let step = 0; step < 3; step++) {
      const width = 1 + ((value >> (step * 2)) & 3);
      const gap = 1 + ((value >> (step + 1)) & 1);
      bars.push({ x, width });
      x += width + gap;
    }
  }
  return bars;
}

export function barcodeWidth(code: string): number {
  const last = barcodeBars(code).at(-1);
  return last ? last.x + last.width : 1;
}

export function Barcode({ code, className }: { code: string; className?: string }) {
  const bars = barcodeBars(code);
  return (
    <svg aria-hidden="true" viewBox={`0 0 ${barcodeWidth(code)} 40`} preserveAspectRatio="none" className={className}>
      {bars.map((bar) => (
        <rect key={bar.x} x={bar.x} width={bar.width} height="40" fill="currentColor" />
      ))}
    </svg>
  );
}
