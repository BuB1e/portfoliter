import { describe, expect, it } from "vitest";

import { walkTarget } from "./walk";

// Tops are each exhibit's top relative to the viewport's middle: negative means already passed.
describe("exhibition keyboard walk", () => {
  it("goes to the first exhibit still ahead", () => {
    expect(walkTarget([-900, -200, 400, 1200], "next")).toBe(2);
  });

  it("skips the exhibit the visitor is standing in front of", () => {
    expect(walkTarget([-900, 10, 700], "next")).toBe(2);
  });

  it("goes back to the exhibit before the current one", () => {
    expect(walkTarget([-1600, -900, -200, 400], "previous")).toBe(1);
  });

  it("stops at either end of the show", () => {
    expect(walkTarget([-1600, -900, -200], "next")).toBeNull();
    expect(walkTarget([300, 900], "previous")).toBeNull();
  });
});
