import { describe, expect, it } from "vitest";

import { THEME_KEYS, themeKey } from "./theme";

describe("themeKey", () => {
  it.each(THEME_KEYS)("keeps the known key %s", (key) => {
    expect(themeKey(key)).toBe(key);
  });

  it.each([undefined, null, "", "Dating", "neon"])("falls back to plain for %s", (value) => {
    expect(themeKey(value)).toBe("plain");
  });
});
